import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
});

// server/drizzle.config.ts
// import "dotenv/config";
// import { Pool } from "pg";
// import { drizzle } from "drizzle-orm/node-postgres";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   // If you run into any SSL issues you can disable cert checks:
//   // ssl: { rejectUnauthorized: false },
// });

// export default drizzle(pool);

// drizzle.config.ts
// import { defineConfig } from 'drizzle-kit';
// import 'dotenv/config';

// export default defineConfig({
//   // point to your schema file or folder
//   schema: './shared/schema.ts',
//   // where to output the generated migration files
//   out: './drizzle',
//   // use PostgreSQL
//   driver: 'postgresql',
//   // connection info comes from your env var
//   dbCredentials: {
//     connectionString: process.env.DATABASE_URL!,
//   },
// });
