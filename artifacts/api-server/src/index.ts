import app from "./app";
import path from "path";
import { readFileSync } from "fs";
import { config } from "dotenv";

const __dirname = process.cwd();

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  config({ path: path.resolve(__dirname, ".env") });
}

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("Database URL not set, skipping migrations");
    return;
  }

  try {
    // Dynamically import pg to avoid bundling issues
    const pg = require("pg");
    const { Pool } = pg;
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();
    try {
      console.log("Checking database migrations...");

      // Create schema first
      try {
        await client.query('CREATE SCHEMA IF NOT EXISTS "drizzle"');
      } catch (err) {
        // Schema might already exist or user might not have permission, continue anyway
      }

      // Create migrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL UNIQUE,
          created_at bigint
        )
      `);

      // Read migration files
      const migrationsDir = path.resolve(__dirname, "lib/db/drizzle");
      let sqlFiles: string[] = [];

      try {
        const fs = require("fs");
        sqlFiles = fs
          .readdirSync(migrationsDir)
          .filter((f: string) => f.endsWith(".sql"))
          .sort();
      } catch (err) {
        console.log("No migration files found");
        return;
      }

      // Run migrations
      for (const file of sqlFiles) {
        const filepath = path.join(migrationsDir, file);
        const checkResult = await client.query(
          'SELECT * FROM "drizzle"."__drizzle_migrations" WHERE hash = $1',
          [file]
        );

        if (checkResult.rows.length === 0) {
          console.log(`  Running migration: ${file}`);
          const sql = readFileSync(filepath, "utf-8");
          const statements = sql
            .split("--> statement-breakpoint")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

          for (const statement of statements) {
            await client.query(statement);
          }

          await client.query(
            'INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)',
            [file, Date.now()]
          );
        }
      }

      console.log("✓ Database migrations completed");
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("⚠ Migration check error (non-fatal):", error instanceof Error ? error.message : error);
  }
}

async function startServer() {
  try {
    await runMigrations();
  } catch (err) {
    console.error("Migration failed, continuing startup");
  }

  const rawPort = process.env["API_PORT"] ?? process.env["PORT"];

  if (!rawPort) {
    throw new Error(
      "API_PORT or PORT environment variable is required but none were provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
