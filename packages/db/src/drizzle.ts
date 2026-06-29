import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Create a Drizzle database client connected to Neon Postgres.
 * Uses the serverless HTTP driver for edge/serverless environments.
 */
export function createDb(databaseUrl?: string) {
  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Please set it in your environment variables."
    );
  }

  const sql = neon(url);
  return drizzle(sql, { schema });
}

/** Singleton database instance for server-side use */
let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export type Database = ReturnType<typeof createDb>;
