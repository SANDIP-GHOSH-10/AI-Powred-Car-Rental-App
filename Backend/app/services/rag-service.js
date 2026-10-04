/**
 * rag-service.js
 *
 * RAG (Retrieval-Augmented Generation) pipeline for car search.
 *
 * Flow:
 *  1. Generate query embedding from customer's prompt
 *  2. Atlas Vector Search → semantic similarity → candidate cars
 *  3. Apply hard business filters (status=AVAILABLE, isActive, price, type, etc.)
 *  4. Check booking date availability if dates are provided
 *  5. Return exact matches + close alternatives
 *
 * ALL business logic stays on the backend.
 * AI is only used for embedding generation and ranking.
 *
 * IMPORTANT:
 *  - status="AVAILABLE" is ALWAYS enforced — PENDING/REJECTED/UNAVAILABLE cars
 *    are NEVER returned as exact matches.
 *  - If embedding fails (OpenAI quota/network), we fall back to regular MongoDB
 *    search — but the SAME hard filters are preserved. We never return all cars.
 *  - The fallback does NOT silently return everything. If no cars match the exact
 *    filters, exactMatches = [] and the wideFilter alternatives clearly respect
 *    the relaxed-but-still-filtered query.
 */

import Car from "../models/car-model.js";
import Booking from "../models/booking-models.js";
import { generateEmbedding } from "./embedding-service.js";

// -------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------

const VECTOR_INDEX_NAME = "car_embedding_index";

// How many candidates to pull from vector search
// before applying post-vector hard filters
const VECTOR_CANDIDATES = 100;

// Max exact results to return
const MAX_EXACT_RESULTS = 10;

// Max alternative results to return
const MAX_ALTERNATIVES = 5;

// -------------------------------------------------------
// HELPER: Check if a car is available for given date range
// -------------------------------------------------------

/**
 * Returns true if the car has NO confirmed/pending bookings
 * that overlap with [startDate, endDate].
 *
 * Overlap condition: start1 < end2 AND end1 > start2
 *
 * @param {string} carId
 * @param {string} startDate - ISO date string
 * @param {string} endDate   - ISO date string
 * @returns {Promise<boolean>}
 */
async function isCarAvailableForDates(carId, startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ["PENDING", "CONFIRMED"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    return !conflictingBooking;
  } catch (err) {
    console.error("[RAG] isCarAvailableForDates error:", err.message);
    return false;
  }
}

// -------------------------------------------------------
// HELPER: Build MongoDB hard filter from extracted filters
//
// FIX (BUG 1): status:"AVAILABLE" is now ALWAYS included.
// Previously status was missing, which allowed PENDING,
// REJECTED, and UNAVAILABLE cars into the results.
// -------------------------------------------------------

/**
 * Builds a strict MongoDB query from the extracted structured
 * filters. All filters are applied as hard constraints.
 *
 * status: "AVAILABLE" is always enforced — no exceptions.
 * Only approved, active, available cars are eligible as exact matches.
 *
 * @param {Object} filters - Extracted structured filters
 * @returns {Object} MongoDB query object
 */
function buildExactMongoFilter(filters) {
  const query = {
    // Business logic — always required:
    isActive: true,
    status: "AVAILABLE", // ← FIX: was missing before! Now always enforced.
  };

  // Exact enum matches (Car model uses UPPERCASE enums)
  // LLM sanitization already uppercases these in ai-service.js,
  // but we defensively normalize here too.
  if (filters.type) {
    query.type = String(filters.type).toUpperCase();
  }
  if (filters.transmission) {
    query.transmission = String(filters.transmission).toUpperCase();
  }
  if (filters.fuelType) {
    query.fuelType = String(filters.fuelType).toUpperCase();
  }

  // Numeric filters
  if (filters.seats && typeof filters.seats === "number") {
    query.seats = { $gte: filters.seats };
  }
  if (filters.maxPricePerDay && typeof filters.maxPricePerDay === "number") {
    query.pricePerDay = { $lte: filters.maxPricePerDay };
  }

  // Location: case-insensitive regex on location.city
  if (filters.location) {
    query["location.city"] = {
      $regex: new RegExp(filters.location.trim(), "i"),
    };
  }

  return query;
}

// -------------------------------------------------------
// HELPER: Build a "wide" filter for alternatives
//
// FIX (BUG 4): The alternatives filter now respects:
//   - status: AVAILABLE (always)
//   - isActive: true (always)
//   - location: kept if provided
//   - price: slightly relaxed (up to +30%)
//   - type/transmission/fuelType: intentionally relaxed so
//     we can show "close" alternatives when no exact match
//
// But it does NOT return ALL cars — it still constrains
// by location and a relaxed price.
// -------------------------------------------------------

function buildWideAlternativesFilter(filters) {
  const query = {
    isActive: true,
    status: "AVAILABLE",
  };

  // Keep location constraint for alternatives
  if (filters.location) {
    query["location.city"] = {
      $regex: new RegExp(filters.location.trim(), "i"),
    };
  }

  // Relax price by 30% but still constrain it
  if (filters.maxPricePerDay && typeof filters.maxPricePerDay === "number") {
    query.pricePerDay = { $lte: Math.round(filters.maxPricePerDay * 1.3) };
  }

  // For alternatives, we intentionally do NOT filter on type/transmission/fuelType
  // so we can suggest "close" options to the user.
  // But if no location is given, fallback to cheapest available cars.

  return query;
}

// -------------------------------------------------------
// HELPER: Run Atlas Vector Search aggregation
//
// FIX (BUG 3): The $vectorSearch pre-filter now includes
// status:"AVAILABLE" in addition to isActive.
// The post-vector $match applies the full exactFilter.
// -------------------------------------------------------

/**
 * Runs MongoDB Atlas $vectorSearch.
 * Returns null (not empty array) if vector search fails —
 * this signals the caller to use regularSearch fallback.
 *
 * @param {number[]} queryEmbedding - 1536-dim query vector
 * @param {Object} exactFilter - Full hard filter (post-vector $match)
 * @param {number} limit - Max candidates to return
 * @returns {Promise<Object[]|null>}
 */
async function vectorSearch(queryEmbedding, exactFilter, limit) {
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: VECTOR_CANDIDATES,
          limit: VECTOR_CANDIDATES, // fetch more, then filter below
          // Pre-filter: use only fields that are indexed as filters in Atlas
          // This narrows the vector search candidate set before scoring.
          // FIX (BUG 3): now includes status to exclude unavailable cars early.
          filter: {
            isActive: { $eq: true },
            status: { $eq: "AVAILABLE" },
          },
        },
      },
      // Add the vector similarity score for debugging/ranking
      {
        $addFields: {
          _vectorScore: { $meta: "vectorSearchScore" },
        },
      },
      // Apply ALL hard business filters as a strict post-vector match
      // This is where type, transmission, fuelType, price, location are enforced.
      {
        $match: exactFilter,
      },
      // Populate host fields
      {
        $lookup: {
          from: "users",
          localField: "host",
          foreignField: "_id",
          as: "host",
          pipeline: [{ $project: { name: 1, email: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$host",
          preserveNullAndEmpty: true,
        },
      },
      // Never expose the embedding vector to the frontend
      {
        $project: {
          embedding: 0,
        },
      },
      { $limit: limit },
    ];

    console.log(
      "[RAG] Running Atlas Vector Search, index:",
      VECTOR_INDEX_NAME,
      "| limit:",
      limit
    );

    const results = await Car.aggregate(pipeline);

    console.log("[RAG] Vector Search returned:", results.length, "candidates");

    return results;
  } catch (error) {
    console.warn(
      "[RAG] Vector Search failed (index may not be ready yet). Falling back to regular search.",
      "Error:", error.message
    );
    return null; // Signal caller to use regularSearch fallback
  }
}

// -------------------------------------------------------
// HELPER: Regular MongoDB search (fallback)
//
// FIX (BUG 2): This fallback now receives exactFilter which
// ALWAYS has status:"AVAILABLE" and isActive:true baked in.
// It no longer silently returns all cars.
// -------------------------------------------------------

/**
 * Falls back to a regular Car.find() when vector search is
 * unavailable (missing index, no embeddings, OpenAI quota).
 *
 * The exactFilter passed here ALWAYS includes status and isActive,
 * so this NEVER returns all cars.
 *
 * @param {Object} exactFilter - Full hard filter (includes status:"AVAILABLE")
 * @param {number} limit
 * @returns {Promise<Object[]>}
 */
async function regularSearch(exactFilter, limit) {
  console.log("[RAG] Regular MongoDB fallback filter:", JSON.stringify(exactFilter));

  const results = await Car.find(exactFilter)
    .populate("host", "name email")
    .select("-embedding")
    .sort({ pricePerDay: 1, createdAt: -1 })
    .limit(limit);

  const docs = results.map((car) => (car.toObject ? car.toObject() : car));
  console.log("[RAG] Regular fallback returned:", docs.length, "cars");
  return docs;
}

// -------------------------------------------------------
// MAIN RAG SEARCH FUNCTION
// -------------------------------------------------------

/**
 * Full RAG pipeline:
 *   embedding → vector search → hard filter → booking check → split
 *
 * Key guarantees:
 *  - status:"AVAILABLE" is ALWAYS enforced (never PENDING/REJECTED/UNAVAILABLE)
 *  - Filters (type, fuelType, transmission, price, location) are always applied
 *  - If embedding fails, falls back to regular search WITH the same filters
 *  - exactMatches = [] if nothing matches — never silently returns all cars
 *  - alternatives are shown when no exact match, but with relaxed type/fuel/transmission
 *
 * @param {string} prompt - Customer's natural language prompt
 * @param {Object} filters - Structured filters extracted by LLM
 * @returns {Promise<{ exactMatches: Object[], alternatives: Object[] }>}
 */
export async function searchCarsWithRAG(prompt, filters) {
  const { startDate, endDate } = filters;
  const hasDates = !!(startDate && endDate);

  console.log("\n[RAG] ======================================");
  console.log("[RAG] USER QUERY:", prompt);
  console.log("[RAG] EXTRACTED FILTERS:", JSON.stringify(filters, null, 2));

  // --------------------------------------------------
  // 1. Build strict MongoDB filter
  //    status:"AVAILABLE" + isActive:true + all extracted constraints
  // --------------------------------------------------
  const exactFilter = buildExactMongoFilter(filters);
  console.log("[RAG] EXACT MONGODB FILTER:", JSON.stringify(exactFilter));

  // --------------------------------------------------
  // 2. Try to generate query embedding
  //    If this fails (OpenAI quota/network), we fall back
  //    to regular search — but still with exactFilter applied.
  // --------------------------------------------------
  let queryEmbedding = null;
  try {
    queryEmbedding = await generateEmbedding(prompt);
    console.log(
      "[RAG] Embedding generated, dims:",
      queryEmbedding?.length
    );
  } catch (err) {
    console.warn(
      "[RAG] Embedding generation failed — will use regular MongoDB search.",
      "Reason:", err.message
    );
  }

  // --------------------------------------------------
  // 3a. Try Vector Search (semantic ranking)
  // --------------------------------------------------
  let candidates = [];

  if (queryEmbedding) {
    const vectorResults = await vectorSearch(
      queryEmbedding,
      exactFilter,
      MAX_EXACT_RESULTS + MAX_ALTERNATIVES
    );

    if (vectorResults !== null) {
      candidates = vectorResults;
    }
  }

  // --------------------------------------------------
  // 3b. Fallback: regular MongoDB search
  //
  //    CRITICAL FIX: The exactFilter passed here ALWAYS has
  //    status:"AVAILABLE" and isActive:true plus all the user's
  //    constraints (type, fuelType, transmission, price, location).
  //    We do NOT return all cars.
  // --------------------------------------------------
  if (candidates.length === 0) {
    console.log("[RAG] Vector search produced 0 results. Using regular MongoDB fallback.");
    candidates = await regularSearch(
      exactFilter,
      MAX_EXACT_RESULTS + MAX_ALTERNATIVES
    );
  }

  console.log("[RAG] CANDIDATE COUNT (after hard filter):", candidates.length);

  // --------------------------------------------------
  // 4. Date availability check (booking overlap)
  //    All candidates at this point are already AVAILABLE.
  //    We further filter by booking date conflicts if provided.
  // --------------------------------------------------
  let exactMatches = [];
  let dateUnavailable = [];

  if (hasDates && candidates.length > 0) {
    const dateChecks = await Promise.all(
      candidates.map(async (car) => {
        const avail = await isCarAvailableForDates(car._id, startDate, endDate);
        return { car, avail };
      })
    );

    exactMatches = dateChecks.filter((r) => r.avail).map((r) => r.car);
    dateUnavailable = dateChecks.filter((r) => !r.avail).map((r) => r.car);

    console.log(
      "[RAG] Date-filtered exact matches:",
      exactMatches.length,
      "| Date-booked (shown as alternatives):",
      dateUnavailable.length
    );
  } else {
    // No dates — all AVAILABLE candidates are exact matches
    exactMatches = candidates;
  }

  // --------------------------------------------------
  // 5. Build alternatives
  //
  // Case A: We have exact matches → alternatives = date-booked cars
  // Case B: No exact matches → widen the search (relax type/fuel/transmission)
  //         but still keep location + price constraints.
  // --------------------------------------------------
  let alternatives = [];

  if (exactMatches.length > 0) {
    // Alternatives = cars that match location+price but are booked for the dates
    alternatives = dateUnavailable.slice(0, MAX_ALTERNATIVES);
  } else {
    // No exact matches — widen filter to show close alternatives
    console.log("[RAG] No exact matches. Running wide alternatives search.");

    const wideFilter = buildWideAlternativesFilter(filters);
    console.log("[RAG] WIDE (alternatives) FILTER:", JSON.stringify(wideFilter));

    // Exclude car IDs already in candidates to avoid duplicates
    const candidateIds = candidates.map((c) => String(c._id));
    if (candidateIds.length > 0) {
      wideFilter._id = { $nin: candidateIds };
    }

    const wideResults = await Car.find(wideFilter)
      .populate("host", "name email")
      .select("-embedding")
      .sort({ pricePerDay: 1 })
      .limit(MAX_ALTERNATIVES);

    alternatives = wideResults.map((c) => (c.toObject ? c.toObject() : c));
    console.log("[RAG] Wide alternatives found:", alternatives.length);
  }

  console.log(
    "[RAG] FINAL — exactMatches:",
    exactMatches.length,
    "| alternatives:",
    alternatives.length
  );
  console.log("[RAG] ======================================\n");

  return {
    exactMatches: exactMatches.slice(0, MAX_EXACT_RESULTS),
    alternatives: alternatives.slice(0, MAX_ALTERNATIVES),
  };
}
