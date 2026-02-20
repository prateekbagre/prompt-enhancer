import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Export variables after conditional initialization to keep valid module syntax.
let _pool: any = null;
let _db: any = null;

if (process.env.DEV_NO_DB === "1") {
  // Placeholders so imports don't throw. Storage modules should opt into
  // in-memory implementations when DEV_NO_DB is set.
  _pool = null;
  _db = {};
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzle(_pool, { schema });
}

export const pool = _pool;
export const db = _db;
