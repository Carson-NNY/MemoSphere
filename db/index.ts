import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Prepare config
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

// ✅ Log the config for verification
console.log("✅ PG Pool config →", JSON.stringify(poolConfig, null, 2));

// Create pool and drizzle client
export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });
