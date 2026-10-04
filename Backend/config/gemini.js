import { GoogleGenerativeAI } from "@google/generative-ai";

// IMPORTANT: API key is read from environment variable only.
// Never hardcode the key here.
// Never expose GEMINI_API_KEY to the frontend.

// Lazy singleton — created on first use so dotenv always loads first
let _client = null;

function getGeminiClient() {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "[Gemini] GEMINI_API_KEY is not set in .env. AI features will not work."
      );
    }
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _client;
}

export default getGeminiClient;
