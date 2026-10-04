/**
 * backfill-embeddings.js
 *
 * One-time script to generate embeddings for all existing cars
 * that do not have an embedding yet.
 *
 * Run ONCE from the Backend directory:
 *   node scripts/backfill-embeddings.js
 *
 * PREREQUISITES:
 *  - OPENAI_API_KEY must be set in .env
 *  - MongoDB Atlas must be connected
 *  - The Atlas Vector Search index must be created BEFORE running semantic search
 *    (but this script can run before the index is created)
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Car from "../app/models/car-model.js";
import { buildCarSearchText, generateEmbedding } from "../app/services/embedding-service.js";

// -------------------------------------------------------
// RATE LIMITING HELPER
// -------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// OpenAI free tier: ~3 requests/min for embeddings
// We'll add a small delay between each to be safe
const DELAY_BETWEEN_CALLS_MS = 500;

// -------------------------------------------------------
// MAIN BACKFILL
// -------------------------------------------------------

async function backfillEmbeddings() {
  console.log("=== Car Embedding Backfill Script ===\n");

  // Connect to MongoDB
  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to MongoDB\n");

  // Find cars without embeddings
  const cars = await Car.find({ embedding: { $exists: false } }).select(
    "-embedding"
  );

  console.log(`Found ${cars.length} cars without embeddings.\n`);

  if (cars.length === 0) {
    console.log("All cars already have embeddings. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    console.log(
      `[${i + 1}/${cars.length}] Processing: ${car.brand} ${car.model} (${car._id})`
    );

    try {
      const text = buildCarSearchText(car);
      const embedding = await generateEmbedding(text);

      await Car.updateOne({ _id: car._id }, { $set: { embedding } });

      console.log(`  ✓ Embedding saved (${embedding.length} dims)`);
      success++;
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      failed++;
    }

    // Rate limiting delay
    if (i < cars.length - 1) {
      await sleep(DELAY_BETWEEN_CALLS_MS);
    }
  }

  console.log("\n=== Backfill Complete ===");
  console.log(`  ✓ Success: ${success}`);
  console.log(`  ✗ Failed:  ${failed}`);
  console.log("\nYou can now create the Atlas Vector Search index if you haven't already.");

  await mongoose.disconnect();
  process.exit(0);
}

backfillEmbeddings().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
