/**
 * embedding-service.js
 *
 * Responsibilities:
 *  1. Build a rich, searchable text string from a car document.
 *  2. Call Google Gemini text-embedding-004 to generate a 768-dim vector.
 *
 * NEVER called from the frontend — backend only.
 *
 * Migrated from OpenAI text-embedding-3-small (1536-dim)
 *         → Google Gemini text-embedding-004 (768-dim) — free tier
 *
 * NOTE: If you have existing embeddings in MongoDB from OpenAI (1536-dim),
 * you must re-run the embedding generation script to regenerate them,
 * since the vector dimensions have changed (1536 → 768).
 */

import getGeminiClient from "../../config/gemini.js";

// -------------------------------------------------------
// BUILD SEARCHABLE TEXT FROM CAR DOCUMENT
// -------------------------------------------------------

/**
 * Converts a Mongoose car document into a rich natural-language
 * text string suitable for embedding. Uses all meaningful fields.
 *
 * @param {Object} car - Mongoose Car document
 * @returns {string}
 */
export function buildCarSearchText(car) {
  const parts = [];

  // Core identity
  if (car.brand) parts.push(car.brand);
  if (car.model) parts.push(car.model);
  if (car.year) parts.push(String(car.year));

  // Classification
  if (car.type) {
    const typeMap = {
      HATCHBACK: "hatchback",
      SEDAN: "sedan",
      SUV: "SUV",
      MUV: "MUV",
      COUPE: "coupe",
      CONVERTIBLE: "convertible",
      LUXURY: "luxury car",
    };
    parts.push(typeMap[car.type] || car.type);
  }

  if (car.transmission) {
    parts.push(
      car.transmission === "AUTOMATIC" ? "automatic transmission" : "manual transmission"
    );
  }

  if (car.fuelType) {
    const fuelMap = {
      PETROL: "petrol",
      DIESEL: "diesel",
      ELECTRIC: "electric",
      HYBRID: "hybrid",
    };
    parts.push(fuelMap[car.fuelType] || car.fuelType);
  }

  if (car.seats) parts.push(`${car.seats} seater`);

  // Pricing
  if (car.pricePerDay) parts.push(`₹${car.pricePerDay} per day`);

  // Location
  if (car.location?.city) parts.push(`available in ${car.location.city}`);
  if (car.location?.state) parts.push(car.location.state);

  // Description
  if (car.description) parts.push(car.description);

  // Features
  if (car.features && car.features.length > 0) {
    parts.push(`Features: ${car.features.join(", ")}`);
  }

  // Suitability hints based on type
  if (car.type === "SUV" || car.type === "MUV") {
    parts.push("suitable for family trips, group travel, long distance");
  } else if (car.type === "LUXURY") {
    parts.push("luxury premium executive car");
  } else if (car.type === "HATCHBACK") {
    parts.push("city car compact economical budget");
  } else if (car.type === "SEDAN") {
    parts.push("comfortable city intercity travel");
  }

  if (car.fuelType === "ELECTRIC") {
    parts.push("eco-friendly zero emission EV");
  }

  return parts.join(". ") + ".";
}

// -------------------------------------------------------
// GENERATE EMBEDDING FROM TEXT
// -------------------------------------------------------

/**
 * Generates a 768-dimensional embedding vector using
 * Google Gemini text-embedding-004.
 *
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector (768 dimensions)
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("generateEmbedding: text must be a non-empty string");
  }

  // Truncate to avoid token limit issues
  const truncated = text.slice(0, 8000);

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

  const result = await model.embedContent(truncated);
  return result.embedding.values;
}

// -------------------------------------------------------
// GENERATE AND PERSIST EMBEDDING FOR A CAR
// -------------------------------------------------------

/**
 * Generates an embedding for the given car document and saves
 * it back to MongoDB. This is meant to be called non-blocking
 * (fire-and-forget) after a car is created or updated.
 *
 * @param {Object} car - Mongoose Car document (already saved)
 */
export async function generateAndSaveEmbedding(car) {
  try {
    const text = buildCarSearchText(car);
    console.log(`[Embedding] Generating embedding for car: ${car._id} (${car.brand} ${car.model})`);

    const embedding = await generateEmbedding(text);

    // Update only the embedding field to avoid triggering
    // unintended middleware / validation on other fields.
    const Car = (await import("../models/car-model.js")).default;
    await Car.updateOne(
      { _id: car._id },
      { $set: { embedding } }
    );

    console.log(`[Embedding] Saved embedding for car: ${car._id}`);
  } catch (error) {
    // Non-blocking: log but don't crash the main request
    console.error(`[Embedding] Failed to generate/save embedding for car ${car._id}:`, error.message);
  }
}
