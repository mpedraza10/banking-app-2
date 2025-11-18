"use server";

import { db } from "@/lib/db";
import { users, systemUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

export async function getUsers() {
    try {
        const result = await db.select().from(users);
        return result;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}

/**
 * Get or create a system user from an auth user
 * This maps Supabase Auth users to system_users (cashiers/staff)
 */
export async function getOrCreateSystemUser(
    authUser: User | null
): Promise<{ id: string; branchId: string }> {
    if (!authUser) {
        throw new Error("User not authenticated");
    }

    try {
        // Try to find existing system user by username (using email)
        const existingSystemUser = await db
            .select()
            .from(systemUsers)
            .where(eq(systemUsers.username, authUser.email || ""))
            .limit(1);

        if (existingSystemUser.length > 0 && existingSystemUser[0].isActive) {
            return {
                id: existingSystemUser[0].id,
                branchId: existingSystemUser[0].branchId,
            };
        }

        // If not found, create a new system user
        // Use email as username (or fallback)
        const username = authUser.email || `user_${authUser.id.slice(0, 8)}`;
        
        // Get user name from auth user or use email
        const name = authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User";

        try {
            const [newSystemUser] = await db
                .insert(systemUsers)
                .values({
                    username: username,
                    name: name,
                    role: "Cajero Ventanilla", // Default role
                    branchId: "BRANCH-001", // TODO: Get from user context/settings
                    isActive: true,
                })
                .returning();

            return {
                id: newSystemUser.id,
                branchId: newSystemUser.branchId,
            };
        } catch (insertError: any) {
            // If insert fails due to unique constraint, try to fetch again
            // This handles race conditions where another request created the user
            if (insertError?.code === "23505" || insertError?.message?.includes("unique")) {
                const retrySystemUser = await db
                    .select()
                    .from(systemUsers)
                    .where(eq(systemUsers.username, username))
                    .limit(1);

                if (retrySystemUser.length > 0) {
                    return {
                        id: retrySystemUser[0].id,
                        branchId: retrySystemUser[0].branchId,
                    };
                }
            }
            throw insertError;
        }
    } catch (error) {
        console.error("Get or create system user error:", error);
        throw new Error(
            error instanceof Error
                ? error.message
                : "Failed to get or create system user"
        );
    }
}
