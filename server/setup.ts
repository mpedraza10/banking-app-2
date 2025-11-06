import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MIGRATIONS_DIR = join(process.cwd(), "server", "migrations");
const DEFAULT_ADMIN = {
  email: "admin@admin.com",
  password: "admin",
  name: "Administrator",
};

/**
 * Complete database setup script
 * 1. Checks if migrations exist
 * 2. Generates migrations if needed
 * 3. Runs migrations
 * 4. Seeds admin user if not exists
 */
async function setup() {
  try {
    // STEP 1: Check if migrations exist
    const migrationsExist = checkMigrationsExist();

    // STEP 2: Generate migrations if needed
    if (!migrationsExist) {
      try {
        execSync("npm run drizzle:generate", {
          stdio: "inherit",
          cwd: process.cwd(),
        });
      } catch (error) {
        throw error;
      }
    }

    // STEP 3: Run migrations
    try {
      execSync("npm run drizzle:migrate", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      throw error;
    }

    // STEP 4: Seed admin user
    await seedAdminUser();
  } catch (error) {
    process.exit(1);
  }
}

/**
 * Check if migration files exist
 */
function checkMigrationsExist(): boolean {
  if (!existsSync(MIGRATIONS_DIR)) {
    return false;
  }

  const files = readdirSync(MIGRATIONS_DIR);
  const sqlFiles = files.filter((file) => file.endsWith(".sql"));

  if (sqlFiles.length === 0) {
    return false;
  }

  return true;
}

/**
 * Seed the database with default admin user
 */
async function seedAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const connectionString = process.env.NEXT_PUBLIC_SUPABASE_DB_URL!;

  if (!supabaseUrl || !connectionString) {
    throw new Error("Missing environment variables");
  }

  // Initialize Drizzle
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Check if admin user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, DEFAULT_ADMIN.email));

    if (existingUsers.length > 0) {
      await client.end();
      return;
    }

    // User doesn't exist, create it
    if (!supabaseServiceKey) {
      await createUserWithSignup(supabaseUrl, db);
    } else {
      await createUserWithServiceKey(supabaseUrl, supabaseServiceKey, db);
    }
  } catch (error) {
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Create user using Supabase Service Role Key (recommended)
 */
async function createUserWithServiceKey(
  supabaseUrl: string,
  serviceKey: string,
  db: any
) {
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Create user in Supabase Auth
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      email_confirm: true,
    });

  if (authError) {
    // Check if user already exists in auth
    if (authError.message.includes("already registered")) {
      // Get the existing user
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = listData?.users.find(
        (u) => u.email === DEFAULT_ADMIN.email
      );

      if (existingAuthUser) {
        // Insert into our users table
        await db.insert(users).values({
          id: existingAuthUser.id,
          email: DEFAULT_ADMIN.email,
          name: DEFAULT_ADMIN.name,
        });

        return;
      }
    }
    throw authError;
  }

  // Insert into our users table
  await db.insert(users).values({
    id: authData.user.id,
    email: DEFAULT_ADMIN.email,
    name: DEFAULT_ADMIN.name,
  });
}

/**
 * Create user using signup endpoint (fallback)
 */
async function createUserWithSignup(supabaseUrl: string, db: any) {
  const supabaseAnon = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: signUpData, error: signUpError } =
    await supabaseAnon.auth.signUp({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
    });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return;
    }
    throw signUpError;
  }

  if (signUpData.user) {
    // Insert into our users table
    await db.insert(users).values({
      id: signUpData.user.id,
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
    });
  }
}

// Run setup if called directly
if (require.main === module) {
  setup()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}

export { setup };
