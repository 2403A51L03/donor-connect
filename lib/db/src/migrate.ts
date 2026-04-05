import path from "path";
import { config } from "dotenv";
import { readFileSync } from "fs";
import pg from "pg";

const __dirname = process.cwd();

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  config({ path: path.resolve(__dirname, ".env") });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log("Running database migrations...");

    // Check if migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL UNIQUE,
        created_at bigint
      )
    `);

    // Read migration files
    const migrations: Array<{ name: string; sql: string }> = [];
    const migrationsDir = path.resolve(__dirname, "../drizzle");

    // Try to read migration files
    try {
      const files = require("fs").readdirSync(migrationsDir);
      const sqlFiles = files.filter((f: string) => f.endsWith(".sql")).sort();

      for (const file of sqlFiles) {
        const filepath = path.join(migrationsDir, file);
        const sql = readFileSync(filepath, "utf-8");
        migrations.push({ name: file, sql });
      }
    } catch (err) {
      console.log("No migration files found, skipping migrations");
      return;
    }

    // Run each migration
    for (const migration of migrations) {
      const checkResult = await client.query(
        'SELECT * FROM "drizzle"."__drizzle_migrations" WHERE hash = $1',
        [migration.name]
      );

      if (checkResult.rows.length === 0) {
        console.log(`  Running migration: ${migration.name}`);
        // Split by statement breakpoint and execute each statement
        const statements = migration.sql
          .split("--> statement-breakpoint")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        for (const statement of statements) {
          await client.query(statement);
        }

        // Record migration
        await client.query(
          'INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)',
          [migration.name, Date.now()]
        );
      }
    }

    console.log("✓ Migrations completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error("Fatal migration error:", err);
  process.exit(1);
});
