
import { config } from "dotenv";
import { validateServiceReference } from "@/lib/actions/services";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Load env vars
config({ path: ".env" });

async function debugValidation() {
  // 1. Get Telcel service
  const telcel = await db.select().from(services).where(eq(services.name, "Telcel")).limit(1);
  if (telcel.length === 0) {
    return;
  }
  const service = telcel[0];

  // 2. Mock User
  const mockUser = {
    id: "debug-user-id",
    aud: "authenticated",
    role: "authenticated",
    email: "debug@example.com",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  };

  // 3. Call validateServiceReference
  try {
    const result = await validateServiceReference(
      mockUser as any,
      service.id,
      "1234567890" // Valid 10 digit reference
    );
  } catch (error) {
    console.error("Validation Error:", error);
  }
}

debugValidation()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
