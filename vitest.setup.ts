import { config } from "dotenv";

// Load environment variables from .env file
config();

// Ensure we have required environment variables for testing
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set for tests");
}
