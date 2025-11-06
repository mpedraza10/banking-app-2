"use server";

import { db } from "@/lib/db";
import { customers, cards } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

// Customer search filters interface
export interface CustomerSearchFilters {
  customerId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  alternatePhone?: string;
  birthDate?: string;
  taxId?: string;
  street?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  postalCode?: string;
}

// Customer search result DTO
export interface CustomerSearchResult {
  id: string;
  customerId: string | null;
  firstName: string | null;
  lastName: string | null;
  taxId: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
}

// Customer update data interface
export interface CustomerUpdateData {
  email?: string;
  phoneNumber?: string;
  alternatePhone?: string;
  street?: string;
  exteriorNumber?: string;
  interiorNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Search for customers using multiple criteria
 * Business Rule: At least two search criteria must be provided
 */
export async function searchCustomers(
  user: User | null,
  filters: CustomerSearchFilters
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Count provided search criteria
  const criteriaCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== ""
  ).length;

  if (criteriaCount < 2) {
    throw new Error("At least two search criteria must be provided");
  }

  try {
    // Build dynamic WHERE conditions
    const conditions = [];

    if (filters.customerId) {
      conditions.push(like(customers.customerId, `%${filters.customerId}%`));
    }
    if (filters.firstName) {
      conditions.push(like(customers.firstName, `%${filters.firstName}%`));
    }
    if (filters.lastName) {
      conditions.push(like(customers.lastName, `%${filters.lastName}%`));
    }
    if (filters.phoneNumber) {
      conditions.push(
        like(customers.phoneNumber, `%${filters.phoneNumber}%`)
      );
    }
    if (filters.alternatePhone) {
      conditions.push(
        like(customers.alternatePhone, `%${filters.alternatePhone}%`)
      );
    }
    if (filters.birthDate) {
      conditions.push(eq(customers.birthDate, filters.birthDate));
    }
    if (filters.taxId) {
      conditions.push(like(customers.taxId, `%${filters.taxId}%`));
    }
    if (filters.street) {
      conditions.push(like(customers.street, `%${filters.street}%`));
    }
    if (filters.city) {
      conditions.push(like(customers.city, `%${filters.city}%`));
    }
    if (filters.state) {
      conditions.push(like(customers.state, `%${filters.state}%`));
    }
    if (filters.neighborhood) {
      conditions.push(like(customers.neighborhood, `%${filters.neighborhood}%`));
    }
    if (filters.postalCode) {
      conditions.push(like(customers.postalCode, `%${filters.postalCode}%`));
    }

    const results = await db
      .select({
        id: customers.id,
        customerId: customers.customerId,
        firstName: customers.firstName,
        lastName: customers.lastName,
        taxId: customers.taxId,
        street: customers.street,
        city: customers.city,
        state: customers.state,
        postalCode: customers.postalCode,
        phoneNumber: customers.phoneNumber,
      })
      .from(customers)
      .where(and(...conditions));

    return {
      data: results,
      totalResults: results.length,
    };
  } catch (error) {
    console.error("Customer search error:", error);
    throw new Error("Failed to search customers");
  }
}

/**
 * Get complete customer profile including associated cards
 */
export async function getCustomerById(user: User | null, customerId: string) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get customer data
    const customerData = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customerData.length === 0) {
      throw new Error("Customer not found");
    }

    // Get associated cards
    const customerCards = await db
      .select()
      .from(cards)
      .where(eq(cards.customerId, customerId));

    // Mask card numbers (show only last 4 digits)
    const maskedCards = customerCards.map((card) => ({
      ...card,
      cardNumber:
        card.cardNumber && card.cardNumber.length === 16
          ? `****-****-****-${card.cardNumber.slice(-4)}`
          : card.cardNumber,
    }));

    return {
      ...customerData[0],
      cards: maskedCards,
    };
  } catch (error) {
    console.error("Get customer error:", error);
    throw new Error("Failed to retrieve customer data");
  }
}

/**
 * Update customer contact information
 * Returns success message as per business rules
 */
export async function updateCustomer(
  user: User | null,
  customerId: string,
  updateData: CustomerUpdateData
) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Validate email format if provided
  if (updateData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      throw new Error("Invalid email format");
    }
  }

  // Validate phone number format if provided (max 15 chars)
  if (updateData.phoneNumber && updateData.phoneNumber.length > 15) {
    throw new Error("Phone number must not exceed 15 characters");
  }

  if (updateData.alternatePhone && updateData.alternatePhone.length > 15) {
    throw new Error("Alternate phone must not exceed 15 characters");
  }

  try {
    // Build update object with only provided fields
    const updateObject: Record<string, string> = {};
    
    if (updateData.email !== undefined) updateObject.email = updateData.email;
    if (updateData.phoneNumber !== undefined)
      updateObject.phoneNumber = updateData.phoneNumber;
    if (updateData.alternatePhone !== undefined)
      updateObject.alternatePhone = updateData.alternatePhone;
    if (updateData.street !== undefined) updateObject.street = updateData.street;
    if (updateData.exteriorNumber !== undefined)
      updateObject.exteriorNumber = updateData.exteriorNumber;
    if (updateData.interiorNumber !== undefined)
      updateObject.interiorNumber = updateData.interiorNumber;
    if (updateData.neighborhood !== undefined)
      updateObject.neighborhood = updateData.neighborhood;
    if (updateData.city !== undefined) updateObject.city = updateData.city;
    if (updateData.state !== undefined) updateObject.state = updateData.state;
    if (updateData.postalCode !== undefined)
      updateObject.postalCode = updateData.postalCode;
    if (updateData.country !== undefined)
      updateObject.country = updateData.country;

    // Update customer
    const updatedCustomer = await db
      .update(customers)
      .set({
        ...updateObject,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();

    if (updatedCustomer.length === 0) {
      throw new Error("Customer not found");
    }

    return {
      success: true,
      message: "Se actualizó el Cliente correctamente",
      customer: updatedCustomer[0],
    };
  } catch (error) {
    console.error("Update customer error:", error);
    throw new Error("Failed to update customer data");
  }
}
