"use server";

import { db } from "@/lib/db";
import { systemConfiguration, commissionRates, serviceProviders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

export type SystemConfiguration = {
  id: string;
  session_timeout_minutes: number;
  transaction_timeout_seconds: number;
  max_retry_attempts: number;
  maintenance_mode: boolean;
  default_receipt_copies: number;
  updated_at: Date;
  updated_by: string;
};

export type CommissionRate = {
  id: string;
  service_name: string;
  service_provider: string;
  commission_type: "fixed" | "percentage";
  commission_value: number;
  is_active: boolean;
  effective_date: Date;
  updated_at: Date;
  updated_by: string;
};

export type ServiceProvider = {
  id: string;
  provider_name: string;
  service_type: string;
  api_endpoint: string | null;
  timeout_seconds: number;
  retry_attempts: number;
  is_active: boolean;
  updated_at: Date;
  updated_by: string;
};

/**
 * Get current system configuration
 */
export async function getSystemConfiguration(): Promise<SystemConfiguration> {
  try {
    const result = await db.select().from(systemConfiguration).limit(1);
    
    if (result.length === 0) {
      // Create default configuration if none exists
      const defaultConfig = {
        session_timeout_minutes: 15,
        transaction_timeout_seconds: 120,
        max_retry_attempts: 3,
        maintenance_mode: false,
        default_receipt_copies: 1,
        updated_by: "system",
      };
      
      const [created] = await db.insert(systemConfiguration).values(defaultConfig).returning();
      return created as SystemConfiguration;
    }
    
    return result[0] as SystemConfiguration;
  } catch (error) {
    console.error("Error getting system configuration:", error);
    throw new Error("Failed to retrieve system configuration");
  }
}

/**
 * Update system configuration
 */
export async function updateSystemConfiguration(
  user: User | null,
  config: SystemConfiguration
): Promise<SystemConfiguration> {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const [updated] = await db
      .update(systemConfiguration)
      .set({
        session_timeout_minutes: config.session_timeout_minutes,
        transaction_timeout_seconds: config.transaction_timeout_seconds,
        max_retry_attempts: config.max_retry_attempts,
        maintenance_mode: config.maintenance_mode,
        default_receipt_copies: config.default_receipt_copies,
        updated_at: new Date(),
        updated_by: user.id,
      })
      .where(eq(systemConfiguration.id, config.id))
      .returning();

    return updated as SystemConfiguration;
  } catch (error) {
    console.error("Error updating system configuration:", error);
    throw new Error("Failed to update system configuration");
  }
}

/**
 * Get all commission rates
 */
export async function getCommissionRates(): Promise<CommissionRate[]> {
  try {
    const result = await db.select().from(commissionRates).orderBy(commissionRates.service_name);
    return result.map(rate => ({
      ...rate,
      commission_value: parseFloat(rate.commission_value as unknown as string),
      effective_date: new Date(rate.effective_date),
    })) as CommissionRate[];
  } catch (error) {
    console.error("Error getting commission rates:", error);
    throw new Error("Failed to retrieve commission rates");
  }
}

/**
 * Get commission rate by service
 */
export async function getCommissionRateByService(
  serviceId: string
): Promise<CommissionRate | null> {
  try {
    const result = await db
      .select()
      .from(commissionRates)
      .where(eq(commissionRates.id, serviceId))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const rate = result[0];
    return {
      ...rate,
      commission_value: parseFloat(rate.commission_value as unknown as string),
      effective_date: new Date(rate.effective_date),
    } as CommissionRate;
  } catch (error) {
    console.error("Error getting commission rate:", error);
    throw new Error("Failed to retrieve commission rate");
  }
}

/**
 * Update commission rate
 */
export async function updateCommissionRate(
  user: User | null,
  rate: CommissionRate
): Promise<CommissionRate> {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const [updated] = await db
      .update(commissionRates)
      .set({
        commission_type: rate.commission_type,
        commission_value: rate.commission_value.toString(),
        is_active: rate.is_active,
        updated_at: new Date(),
        updated_by: user.id,
      })
      .where(eq(commissionRates.id, rate.id))
      .returning();

    return {
      ...updated,
      commission_value: parseFloat(updated.commission_value as unknown as string),
      effective_date: new Date(updated.effective_date),
    } as CommissionRate;
  } catch (error) {
    console.error("Error updating commission rate:", error);
    throw new Error("Failed to update commission rate");
  }
}

/**
 * Get all service providers
 */
export async function getServiceProviders(): Promise<ServiceProvider[]> {
  try {
    const result = await db.select().from(serviceProviders).orderBy(serviceProviders.provider_name);
    return result as ServiceProvider[];
  } catch (error) {
    console.error("Error getting service providers:", error);
    throw new Error("Failed to retrieve service providers");
  }
}

/**
 * Get service provider by ID
 */
export async function getServiceProviderById(
  providerId: string
): Promise<ServiceProvider | null> {
  try {
    const result = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.id, providerId))
      .limit(1);
    
    return result.length > 0 ? (result[0] as ServiceProvider) : null;
  } catch (error) {
    console.error("Error getting service provider:", error);
    throw new Error("Failed to retrieve service provider");
  }
}

/**
 * Update service provider
 */
export async function updateServiceProvider(
  user: User | null,
  provider: ServiceProvider
): Promise<ServiceProvider> {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const [updated] = await db
      .update(serviceProviders)
      .set({
        api_endpoint: provider.api_endpoint,
        timeout_seconds: provider.timeout_seconds,
        retry_attempts: provider.retry_attempts,
        is_active: provider.is_active,
        updated_at: new Date(),
        updated_by: user.id,
      })
      .where(eq(serviceProviders.id, provider.id))
      .returning();

    return updated as ServiceProvider;
  } catch (error) {
    console.error("Error updating service provider:", error);
    throw new Error("Failed to update service provider");
  }
}

/**
 * Check if system is in maintenance mode
 */
export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const config = await getSystemConfiguration();
    return config.maintenance_mode;
  } catch (error) {
    console.error("Error checking maintenance mode:", error);
    return false;
  }
}

/**
 * Get active service providers only
 */
export async function getActiveServiceProviders(): Promise<ServiceProvider[]> {
  try {
    const result = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.is_active, true))
      .orderBy(serviceProviders.provider_name);
    
    return result as ServiceProvider[];
  } catch (error) {
    console.error("Error getting active service providers:", error);
    throw new Error("Failed to retrieve active service providers");
  }
}
