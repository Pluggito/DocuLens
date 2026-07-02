export { createDb, getDb, type Database } from "./drizzle";
export * from "./schema";
export * as schema from "./schema";
export { createId } from "./utils";

// Re-export drizzle-orm utilities for convenience
export { eq, and, or, desc, asc, sql, like, ilike, inArray, count, gte } from "drizzle-orm";
