
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function checkServices() {
  const allServices = await db.select().from(services);
  // Services loaded - processing can be added here if needed
}

checkServices().catch(console.error);
