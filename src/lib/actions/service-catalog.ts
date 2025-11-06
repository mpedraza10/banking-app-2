"use server";

import { db } from "@/lib/db";
import { services, geographicCoverage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import type { NewService, NewGeographicCoverage } from "@/lib/db/schema";

/**
 * Create a new service provider
 */
export async function createService(user: User | null, serviceData: NewService) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const newService = await db.insert(services).values(serviceData).returning();

    return {
      id: newService[0].id,
      message: "Service created successfully",
    };
  } catch (error) {
    console.error("Create service error:", error);
    throw new Error("Failed to create service");
  }
}

/**
 * Update service provider configuration
 */
export async function updateService(
  user: User | null,
  serviceId: string,
  serviceData: Partial<NewService>
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const updatedService = await db
      .update(services)
      .set({
        ...serviceData,
        updatedAt: new Date(),
      })
      .where(eq(services.id, serviceId))
      .returning();

    if (updatedService.length === 0) {
      throw new Error("Service not found");
    }

    return {
      id: updatedService[0].id,
      message: "Service updated successfully",
    };
  } catch (error) {
    console.error("Update service error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update service"
    );
  }
}

/**
 * Delete (deactivate) a service provider
 */
export async function deleteService(user: User | null, serviceId: string) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const deactivatedService = await db
      .update(services)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(services.id, serviceId))
      .returning();

    if (deactivatedService.length === 0) {
      throw new Error("Service not found");
    }

    return {
      id: deactivatedService[0].id,
      message: "Service deactivated successfully",
    };
  } catch (error) {
    console.error("Delete service error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete service"
    );
  }
}

/**
 * Get all services (active and inactive)
 */
export async function getAllServices(user: User | null) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const allServices = await db.select().from(services);

    return {
      data: allServices,
    };
  } catch (error) {
    console.error("Get all services error:", error);
    throw new Error("Failed to retrieve services");
  }
}

/**
 * Get service by ID with geographic coverage
 */
export async function getServiceWithCoverage(user: User | null, serviceId: string) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (service.length === 0) {
      throw new Error("Service not found");
    }

    const coverage = await db
      .select()
      .from(geographicCoverage)
      .where(eq(geographicCoverage.serviceId, serviceId));

    return {
      service: service[0],
      coverage,
    };
  } catch (error) {
    console.error("Get service with coverage error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to retrieve service"
    );
  }
}

/**
 * Add geographic coverage for a service
 */
export async function addGeographicCoverage(
  user: User | null,
  coverageData: NewGeographicCoverage
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const newCoverage = await db
      .insert(geographicCoverage)
      .values(coverageData)
      .returning();

    return {
      id: newCoverage[0].id,
      message: "Geographic coverage added successfully",
    };
  } catch (error) {
    console.error("Add geographic coverage error:", error);
    throw new Error("Failed to add geographic coverage");
  }
}

/**
 * Remove geographic coverage
 */
export async function removeGeographicCoverage(user: User | null, coverageId: string) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const deactivatedCoverage = await db
      .update(geographicCoverage)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(geographicCoverage.id, coverageId))
      .returning();

    if (deactivatedCoverage.length === 0) {
      throw new Error("Coverage area not found");
    }

    return {
      id: deactivatedCoverage[0].id,
      message: "Geographic coverage removed successfully",
    };
  } catch (error) {
    console.error("Remove geographic coverage error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to remove geographic coverage"
    );
  }
}

/**
 * Get all coverage areas for a service
 */
export async function getServiceCoverage(user: User | null, serviceId: string) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const coverage = await db
      .select()
      .from(geographicCoverage)
      .where(eq(geographicCoverage.serviceId, serviceId));

    return {
      data: coverage,
    };
  } catch (error) {
    console.error("Get service coverage error:", error);
    throw new Error("Failed to retrieve service coverage");
  }
}
