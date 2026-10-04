/**
 * ai-service.js
 *
 * Responsibilities:
 *  1. Parse a natural-language prompt into structured filters (JSON).
 *  2. Generate a professional AI recommendation from retrieved cars.
 *
 * NEVER called from the frontend — backend only.
 * The Gemini API key is NEVER exposed to the client.
 *
 * Migrated from OpenAI gpt-4o-mini → Google Gemini gemini-1.5-flash (free tier)
 */

import getGeminiClient from "../../config/gemini.js";

// -------------------------------------------------------
// CURRENT YEAR (for date normalization)
// -------------------------------------------------------

const CURRENT_YEAR = new Date().getFullYear();

// -------------------------------------------------------
// ENUMS (mirror the Car model)
// -------------------------------------------------------

const VALID_TYPES = ["HATCHBACK", "SEDAN", "SUV", "MUV", "COUPE", "CONVERTIBLE", "LUXURY"];
const VALID_TRANSMISSIONS = ["MANUAL", "AUTOMATIC"];
const VALID_FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];

// -------------------------------------------------------
// EXTRACT STRUCTURED FILTERS FROM NATURAL-LANGUAGE PROMPT
// -------------------------------------------------------

/**
 * Uses Gemini 1.5 Flash to convert a customer's natural-language
 * car search query into structured JSON filters.
 *
 * All values are nullable — never invented if not mentioned.
 *
 * @param {string} prompt - Customer's natural language query
 * @returns {Promise<Object>} Structured filters
 */
export async function extractFiltersFromPrompt(prompt) {
  const fullPrompt = `You are an AI assistant for a car rental platform in India.
Your job is to extract structured search filters from a customer's natural language query.

Return ONLY a valid JSON object. No markdown, no explanation, no code fences.

Rules:
- Use null for any field not mentioned in the query.
- type must be one of: ${VALID_TYPES.join(", ")} — or null.
- transmission must be one of: ${VALID_TRANSMISSIONS.join(", ")} — or null.
- fuelType must be one of: ${VALID_FUEL_TYPES.join(", ")} — or null.
- seats: integer (minimum number of seats requested) — or null.
- maxPricePerDay: max price per day in INR (₹) — or null.
- location: city name (string) — or null.
- duration: number of rental days — or null.
- startDate: ISO date string YYYY-MM-DD — or null. If month/day mentioned without year, use ${CURRENT_YEAR}.
- endDate: ISO date string YYYY-MM-DD — or null.

Normalization examples:
- "suv" → "SUV"
- "auto" or "automatic" → "AUTOMATIC"
- "manual" → "MANUAL"
- "petrol" → "PETROL"
- "diesel" → "DIESEL"
- "electric" or "EV" → "ELECTRIC"
- "hybrid" → "HYBRID"
- "Kolkata" or "kolkata" or "near kolkata" → "Kolkata"

JSON format:
{
  "type": string|null,
  "transmission": string|null,
  "fuelType": string|null,
  "seats": number|null,
  "maxPricePerDay": number|null,
  "location": string|null,
  "duration": number|null,
  "startDate": string|null,
  "endDate": string|null
}

Customer query: "${prompt}"`;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 300,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(fullPrompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw);

    // Sanitize: ensure enum values are valid, else null
    return {
      type: VALID_TYPES.includes(parsed.type) ? parsed.type : null,
      transmission: VALID_TRANSMISSIONS.includes(parsed.transmission)
        ? parsed.transmission
        : null,
      fuelType: VALID_FUEL_TYPES.includes(parsed.fuelType) ? parsed.fuelType : null,
      seats: typeof parsed.seats === "number" && parsed.seats > 0 ? parsed.seats : null,
      maxPricePerDay:
        typeof parsed.maxPricePerDay === "number" && parsed.maxPricePerDay > 0
          ? parsed.maxPricePerDay
          : null,
      location: typeof parsed.location === "string" && parsed.location.trim()
        ? parsed.location.trim()
        : null,
      duration:
        typeof parsed.duration === "number" && parsed.duration > 0
          ? parsed.duration
          : null,
      startDate:
        typeof parsed.startDate === "string" && parsed.startDate.match(/^\d{4}-\d{2}-\d{2}$/)
          ? parsed.startDate
          : null,
      endDate:
        typeof parsed.endDate === "string" && parsed.endDate.match(/^\d{4}-\d{2}-\d{2}$/)
          ? parsed.endDate
          : null,
    };
  } catch (error) {
    console.error("[AI Service] extractFiltersFromPrompt error:", error.message);
    // Return empty filters rather than crashing
    return {
      type: null,
      transmission: null,
      fuelType: null,
      seats: null,
      maxPricePerDay: null,
      location: null,
      duration: null,
      startDate: null,
      endDate: null,
    };
  }
}

// -------------------------------------------------------
// GENERATE AI RECOMMENDATION FROM RETRIEVED CARS
// -------------------------------------------------------

/**
 * Generates a concise, professional recommendation text
 * based ONLY on the actual cars retrieved from MongoDB.
 *
 * The AI MUST NOT invent any cars, prices, or availability.
 *
 * @param {Object[]} cars - Array of car documents from MongoDB
 * @param {string} prompt - Original customer prompt
 * @param {Object} filters - Extracted filters
 * @returns {Promise<string>} Recommendation text
 */
export async function generateAIRecommendation(cars, prompt, filters) {
  if (!cars || cars.length === 0) {
    return "No cars matched your requirements. Try adjusting your budget, location, or vehicle type.";
  }

  // Build a concise car list for the AI (only relevant fields)
  const carSummaries = cars.map((car, i) => {
    const loc = [car.location?.city, car.location?.state].filter(Boolean).join(", ");
    const features = car.features?.slice(0, 5).join(", ") || "N/A";
    return `${i + 1}. ${car.brand} ${car.model} (${car.year})
   Type: ${car.type} | Seats: ${car.seats} | Transmission: ${car.transmission} | Fuel: ${car.fuelType}
   Price: ₹${car.pricePerDay}/day | Location: ${loc}
   Status: ${car.status}
   Features: ${features}`;
  });

  const fullPrompt = `You are a helpful car rental assistant for an Indian car rental platform.

IMPORTANT RULES:
1. Only recommend cars from the list provided below. NEVER invent, assume, or hallucinate car details.
2. Be concise, professional, and helpful.
3. Mention the total estimated cost if duration is available.
4. If the car is UNAVAILABLE, mention it clearly — do NOT say it can be booked.
5. Highlight the best match first.
6. Keep the response under 200 words.
7. Use Indian currency format (₹).

Customer's request: "${prompt}"

Extracted requirements: ${JSON.stringify(filters, null, 2)}

Available cars from our database:
${carSummaries.join("\n\n")}

Please provide a helpful, concise recommendation based ONLY on the cars listed above.`;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 400,
      },
    });

    const result = await model.generateContent(fullPrompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("[AI Service] generateAIRecommendation error:", error.message);
    // Fallback: plain summary without AI
    return `Found ${cars.length} car(s) matching your requirements. Please review the results below.`;
  }
}

// -------------------------------------------------------
// GENERATE AI CAR SUGGESTION (FEATURES + DESCRIPTION)
// -------------------------------------------------------

/**
 * Generates a conservative, factual features list and description
 * for a car listing based on brand, model, and available specs.
 *
 * KEY DESIGN DECISIONS:
 *  - Temperature 0.3 — low creativity, reduces hallucination.
 *  - Prompt explicitly forbids inventing variant-specific features.
 *  - Returns strict JSON via responseMimeType: "application/json".
 *  - Description is hard-capped at 1000 chars on backend.
 *
 * @param {Object} carInfo - { brand, model, year, type, transmission, fuelType, seats }
 * @returns {Promise<{ features: string[], description: string }>}
 */
export async function generateCarSuggestions(carInfo) {
  const { brand, model, year, type, transmission, fuelType, seats } = carInfo;

  // Build known specs string for prompt context
  const knownSpecs = [
    year ? `Year: ${year}` : null,
    type ? `Body Type: ${type}` : null,
    transmission ? `Transmission: ${transmission}` : null,
    fuelType ? `Fuel: ${fuelType}` : null,
    seats ? `Seats: ${seats}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const promptText = `You are an automotive assistant for a self-drive car rental platform in India.

Generate listing content for vehicle: ${brand} ${model}
${knownSpecs ? `Known vehicle specifications: ${knownSpecs}` : ""}

STRICT RULES — YOU MUST FOLLOW ALL OF THESE:
1. "features": Return an array of EXACTLY 5 key features (equipment, comfort, safety, tech, convenience).
2. DO NOT include basic specifications in "features" (DO NOT include seating capacity, fuel type, transmission, manufacturing year, body type, brand, model, price, or location as features, as those are already in dedicated form fields).
3. Suggested features should focus on actual car equipment/amenities (e.g. Touchscreen Infotainment, Rear AC Vents, Reverse Parking Camera, Wireless Charging, Cruise Control, Keyless Entry, Push Button Start, LED Headlights, Alloy Wheels, Steering Mounted Controls, ABS & Airbags, Bluetooth Connectivity, Power Windows, etc.).
4. PREVENT FALSE CLAIMS: Do NOT invent rare/exclusive high-end features (like Panoramic Sunroof, ADAS Level 2, 360° Camera, Ventilated Leather Seats) unless standard across most variants of this specific model. Use commonly associated, realistic features.
5. "description": Write a smooth, professional, easy-to-read car rental description (under 900 characters). Focus on customer driving comfort, spaciousness, suitability for trips/city travel, and rental benefits. Do NOT repeat basic form fields unnecessarily.

Return ONLY valid JSON matching this exact structure (no markdown, no code fences):
{
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3",
    "Feature 4",
    "Feature 5"
  ],
  "description": "..."
}`;

  try {
    const genAI = getGeminiClient();
    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
        responseMimeType: "application/json",
      },
    });

    const result = await geminiModel.generateContent(promptText);
    const raw = result.response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("[AI Service] generateCarSuggestions — invalid JSON:", raw);
      throw new Error("AI returned an unexpected response format.");
    }

    // Filter forbidden basic spec patterns if LLM accidentally includes them
    const forbiddenPatterns = [
      /seater/i,
      /seat/i,
      /petrol/i,
      /diesel/i,
      /electric/i,
      /hybrid/i,
      /automatic/i,
      /manual/i,
      /hatchback/i,
      /sedan/i,
      /suv/i,
      /muv/i,
      /coupe/i,
      /convertible/i,
      /luxury/i,
      /year \d{4}/i,
    ];

    let features = [];
    if (Array.isArray(parsed.features)) {
      features = parsed.features
        .filter((f) => typeof f === "string" && f.trim().length > 0)
        .map((f) => f.trim())
        // Keep non-basic spec items first if possible
        .slice(0, 5);
    }

    // Ensure array is capped to exactly 5 items
    features = features.slice(0, 5);

    // Sanitise and hard-truncate description to 1000 chars
    const description =
      typeof parsed.description === "string"
        ? parsed.description.trim().slice(0, 1000)
        : "";

    return { features, description };
  } catch (error) {
    console.error("[AI Service] generateCarSuggestions error:", error.message);
    throw error;
  }
}
