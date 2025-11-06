"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Server action to create a user in the database
 * This runs on the server, so it can access the database safely
 */
export async function createUserInDatabase(userData: {
  id: string;
  email: string;
  name: string;
}) {
  try {
    await db.insert(users).values({
      id: userData.id,
      email: userData.email,
      name: userData.name,
    });

    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      error: "Failed to create user in database",
    };
  }
}
