// src/lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Get the connection string from your .env
const connectionString = process.env.NEXT_PUBLIC_SUPABASE_DB_URL!;

// Create the postgres client
const client = postgres(connectionString);

// Create the drizzle database instance
export const db = drizzle(client);
