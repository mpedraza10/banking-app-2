
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function checkServices() {
  const allServices = await db.select().from(services);
  console.log("Services Configuration:");
  allServices.forEach(s => {
    console.log(`Service: ${s.name} (${s.serviceCode})`);
    console.log(`  Commission Rate: ${s.commissionRate}`);
    console.log(`  Fixed Commission: ${s.fixedCommission}`);
  });
}

checkServices().catch(console.error);
