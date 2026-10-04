import OpenAI from "openai";

// IMPORTANT: API key is read from environment variable only.
// Never hardcode the key here.
// Never expose OPENAI_API_KEY to the frontend.

// Lazy singleton — created on first use so dotenv always loads first
let _client = null;

function getOpenAIClient() {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "[OpenAI] OPENAI_API_KEY is not set in .env. AI features will not work."
      );
    }
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _client;
}

// Export a Proxy that delegates all property accesses to the lazy client
// so callers can use `openai.chat.completions.create(...)` directly
const openai = new Proxy(
  {},
  {
    get(_target, prop) {
      return getOpenAIClient()[prop];
    },
  }
);

export default openai;

