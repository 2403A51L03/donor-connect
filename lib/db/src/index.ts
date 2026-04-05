import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const __dirname = process.cwd();

function normalizeEnvValue(value?: string): string | undefined {
  if (!value) return value;
  let normalized = value.trim();
  normalized = normalized.replace(/^(?:DATABASE_URL|database_url)\s*=\s*/i, "");
  normalized = normalized.replace(/^['"]|['"]$/g, "");
  return normalized;
}

if (!process.env.DATABASE_URL) {
  config({ path: path.resolve(__dirname, ".env") });
}

const rawDatabaseUrl = process.env.DATABASE_URL;
const normalizedDatabaseUrl = normalizeEnvValue(rawDatabaseUrl);
if (normalizedDatabaseUrl && normalizedDatabaseUrl !== rawDatabaseUrl) {
  process.env.DATABASE_URL = normalizedDatabaseUrl;
}

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
