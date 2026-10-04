/**
 * ai-controller.js
 *
 * Handles POST /ai/search
 *
 * Flow:
 *  1. Validate prompt
 *  2. Extract structured filters using LLM (GPT-4o-mini → JSON)
 *  3. Search cars using RAG pipeline (embedding → vector search → hard filters)
 *  4. Generate AI recommendation from real retrieved car data ONLY
 *  5. Return structured response
 *
 * Business logic (status, isActive, booking availability)
 * is enforced by rag-service — NEVER by the AI.
 *
 * The LLM NEVER invents cars, prices, or availability.
 */

import { extractFiltersFromPrompt, generateAIRecommendation, generateCarSuggestions } from "../services/ai-service.js";
import { searchCarsWithRAG } from "../services/rag-service.js";

const aiCtrl = {};

// -------------------------------------------------------
// POST /ai/search
// -------------------------------------------------------

aiCtrl.searchCars = async (req, res) => {
  const { prompt } = req.body;

  // --------------------------------------------------
  // Validate prompt
  // --------------------------------------------------
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: "Please describe the car you are looking for.",
    });
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 3) {
    return res.status(400).json({
      success: false,
      error: "Your search query is too short. Please describe what kind of car you need.",
    });
  }

  if (trimmedPrompt.length > 1000) {
    return res.status(400).json({
      success: false,
      error: "Your search query is too long. Please keep it under 1000 characters.",
    });
  }

  console.log(`\n[AI SEARCH] ==========================================`);
  console.log(`[AI SEARCH] User: ${req.userId}`);
  console.log(`[AI SEARCH] User query: "${trimmedPrompt}"`);

  try {
    // --------------------------------------------------
    // 1. Extract structured filters from the prompt
    //    GPT-4o-mini → strict JSON with enum validation
    // --------------------------------------------------
    const filters = await extractFiltersFromPrompt(trimmedPrompt);

    console.log("[AI SEARCH] Extracted filters:", JSON.stringify(filters, null, 2));

    // --------------------------------------------------
    // 2. Run RAG pipeline
    //    - Generates embedding (or falls back to regular search)
    //    - Applies hard MongoDB filters (status=AVAILABLE, type, fuelType, etc.)
    //    - Checks booking date availability
    //    - Returns exactMatches + alternatives
    // --------------------------------------------------
    const { exactMatches, alternatives } = await searchCarsWithRAG(trimmedPrompt, filters);

    console.log(
      `[AI SEARCH] Results — Exact: ${exactMatches.length}, Alternatives: ${alternatives.length}`
    );

    // --------------------------------------------------
    // 3. Generate AI recommendation
    //    GPT receives ONLY the cars retrieved from MongoDB.
    //    It CANNOT invent cars, prices, or availability.
    // --------------------------------------------------
    const allCarsForAI = [...exactMatches, ...alternatives];
    const answer = await generateAIRecommendation(allCarsForAI, trimmedPrompt, filters);

    console.log(`[AI SEARCH] ==========================================\n`);

    // --------------------------------------------------
    // 4. Return structured response
    // --------------------------------------------------
    return res.status(200).json({
      success: true,
      query: trimmedPrompt,
      filters,
      cars: exactMatches,
      alternatives,
      answer,
      meta: {
        exactCount: exactMatches.length,
        alternativeCount: alternatives.length,
        hasDateFilter: !!(filters.startDate && filters.endDate),
      },
    });
  } catch (error) {
    console.error("[AI SEARCH] Unexpected error:", error);

    const isApiKeyError =
      error.message?.includes("API key") ||
      error.message?.includes("authentication") ||
      error.status === 401;

    const isRateLimitError = error.status === 429;

    const isNetworkError =
      error.code === "ENOTFOUND" || error.code === "ECONNREFUSED";

    let userMessage =
      "Something went wrong with the AI search. Please try again.";

    if (isApiKeyError) {
      userMessage = "AI service configuration error. Please contact support.";
    } else if (isRateLimitError) {
      userMessage = "AI service is temporarily busy. Please try again in a moment.";
    } else if (isNetworkError) {
      userMessage = "Could not connect to AI service. Please check your connection.";
    }

    return res.status(500).json({
      success: false,
      error: userMessage,
    });
  }
};

// -------------------------------------------------------
// POST /ai/car-suggestion
// -------------------------------------------------------

aiCtrl.carSuggestions = async (req, res) => {
  const { brand, model, year, type, transmission, fuelType, seats } = req.body;

  // --------------------------------------------------
  // Validate required fields
  // --------------------------------------------------
  if (!brand || typeof brand !== "string" || !brand.trim()) {
    return res.status(400).json({
      success: false,
      error: "Car brand is required to generate suggestions.",
    });
  }

  if (!model || typeof model !== "string" || !model.trim()) {
    return res.status(400).json({
      success: false,
      error: "Car model is required to generate suggestions.",
    });
  }

  const carInfo = {
    brand: brand.trim(),
    model: model.trim(),
    year: year ? Number(year) : null,
    type: type || null,
    transmission: transmission || null,
    fuelType: fuelType || null,
    seats: seats ? Number(seats) : null,
  };

  console.log(`\n[AI SUGGESTION] ==========================================`);
  console.log(`[AI SUGGESTION] Host: ${req.userId}`);
  console.log(`[AI SUGGESTION] Car: ${carInfo.brand} ${carInfo.model} (${carInfo.year || "year unknown"})`);

  try {
    const suggestions = await generateCarSuggestions(carInfo);

    console.log(`[AI SUGGESTION] Features: ${suggestions.features.length} items`);
    console.log(`[AI SUGGESTION] Description: ${suggestions.description.length} chars`);
    console.log(`[AI SUGGESTION] ==========================================\n`);

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("[AI SUGGESTION] Error:", error.message);

    // Classify error — never expose raw errors or API keys to frontend
    const isApiKeyError =
      error.message?.includes("API key") ||
      error.message?.includes("authentication") ||
      error.status === 401;

    const isRateLimitError =
      error.status === 429 || error.message?.includes("quota") || error.message?.includes("rate");

    const isNetworkError =
      error.code === "ENOTFOUND" || error.code === "ECONNREFUSED";

    const isFormatError = error.message?.includes("unexpected response format");

    let userMessage = "AI suggestions are temporarily unavailable. You can continue entering details manually.";

    if (isApiKeyError) {
      userMessage = "AI service configuration error. Please contact support.";
    } else if (isRateLimitError) {
      userMessage = "AI service is temporarily busy. Please try again in a moment.";
    } else if (isNetworkError) {
      userMessage = "Could not connect to AI service. Please check your connection.";
    } else if (isFormatError) {
      userMessage = "AI returned an unexpected response. Please try again.";
    }

    return res.status(500).json({
      success: false,
      error: userMessage,
    });
  }
};

export default aiCtrl;
