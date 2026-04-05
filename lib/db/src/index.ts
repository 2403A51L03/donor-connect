import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is required but not set. Please configure your Supabase connection string.",
  );
}

// Configure pool for Supabase/cloud usage
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  max: 5, // Limit connections for cloud databases
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Fail fast if connection takes too long
});

export const db = drizzle(pool, { schema });

export * from "./schema";
