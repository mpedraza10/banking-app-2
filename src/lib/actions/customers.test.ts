import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  searchCustomers,
  getCustomerById,
  updateCustomer,
} from "./customers";
import type { CustomerSearchFilters, CustomerUpdateData } from "./customers";
import type { User } from "@supabase/supabase-js";

// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  customers: {
    id: "id",
    customerId: "customerId",
    firstName: "firstName",
    lastName: "lastName",
    phoneNumber: "phoneNumber",
    alternatePhone: "alternatePhone",
    birthDate: "birthDate",
    taxId: "taxId",
    street: "street",
    city: "city",
    state: "state",
    postalCode: "postalCode",
    email: "email",
    updatedAt: "updatedAt",
    exteriorNumber: "exteriorNumber",
    interiorNumber: "interiorNumber",
    neighborhood: "neighborhood",
    country: "country",
  },
  cards: {
    customerId: "customerId",
    cardNumber: "cardNumber",
  },
}));

describe("Customer Search Server Actions", () => {
  const mockUser: User = {
    id: "test-user-id",
    email: "test@example.com",
  } as User;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchCustomers", () => {
    it("should throw error when user is not authenticated", async () => {
      const filters: CustomerSearchFilters = {
        firstName: "John",
        lastName: "Doe",
      };

      await expect(searchCustomers(null, filters)).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("should throw error when less than two search criteria provided", async () => {
      const filters: CustomerSearchFilters = {
        firstName: "John",
      };

      await expect(searchCustomers(mockUser, filters)).rejects.toThrow(
        "At least two search criteria must be provided"
      );
    });

    it("should accept search with two criteria", async () => {
      const filters: CustomerSearchFilters = {
        firstName: "John",
        lastName: "Doe",
      };

      const result = await searchCustomers(mockUser, filters);
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.totalResults).toBe(0); // Mocked empty response
    });

    it("should accept search with multiple criteria", async () => {
      const filters: CustomerSearchFilters = {
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
        city: "Mexico City",
      };

      const result = await searchCustomers(mockUser, filters);
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it("should ignore empty string criteria in count", async () => {
      const filters: CustomerSearchFilters = {
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "",
        city: "",
      };

      const result = await searchCustomers(mockUser, filters);
      expect(result).toBeDefined();
    });
  });

  describe("getCustomerById", () => {
    it("should throw error when user is not authenticated", async () => {
      await expect(
        getCustomerById(null, "customer-id")
      ).rejects.toThrow("Unauthorized");
    });

    it("should throw error when customer not found", async () => {
      await expect(
        getCustomerById(mockUser, "non-existent-id")
      ).rejects.toThrow("Customer not found");
    });
  });

  describe("updateCustomer", () => {
    it("should throw error when user is not authenticated", async () => {
      const updateData: CustomerUpdateData = {
        email: "new@example.com",
      };

      await expect(
        updateCustomer(null, "customer-id", updateData)
      ).rejects.toThrow("Unauthorized");
    });

    it("should throw error for invalid email format", async () => {
      const updateData: CustomerUpdateData = {
        email: "invalid-email",
      };

      await expect(
        updateCustomer(mockUser, "customer-id", updateData)
      ).rejects.toThrow("Invalid email format");
    });

    it("should accept valid email format", async () => {
      const updateData: CustomerUpdateData = {
        email: "valid@example.com",
      };

      // This will throw "Customer not found" from the mock, but it passes email validation
      await expect(
        updateCustomer(mockUser, "customer-id", updateData)
      ).rejects.toThrow("Customer not found");
    });

    it("should throw error for phone number exceeding 15 characters", async () => {
      const updateData: CustomerUpdateData = {
        phoneNumber: "12345678901234567890",
      };

      await expect(
        updateCustomer(mockUser, "customer-id", updateData)
      ).rejects.toThrow("Phone number must not exceed 15 characters");
    });

    it("should throw error for alternate phone exceeding 15 characters", async () => {
      const updateData: CustomerUpdateData = {
        alternatePhone: "12345678901234567890",
      };

      await expect(
        updateCustomer(mockUser, "customer-id", updateData)
      ).rejects.toThrow("Alternate phone must not exceed 15 characters");
    });

    it("should accept valid phone numbers", async () => {
      const updateData: CustomerUpdateData = {
        phoneNumber: "1234567890",
        alternatePhone: "0987654321",
      };

      // This will throw "Customer not found" from the mock, but it passes validation
      await expect(
        updateCustomer(mockUser, "customer-id", updateData)
      ).rejects.toThrow("Customer not found");
    });

    it("should accept partial update data", async () => {
      const updateData: CustomerUpdateData = {
        city: "New City",
        postalCode: "12345",
      };

      // This will throw "Customer not found" from the mock, but validation passes
      await expect(
        updateCustomer(mockUser, "customer-id", updateData)
      ).rejects.toThrow("Customer not found");
    });
  });
});

describe("Customer Search Validation", () => {
  const mockUser: User = {
    id: "test-user-id",
    email: "test@example.com",
  } as User;

  it("should validate criteria count correctly with mixed empty values", async () => {
    const filters: CustomerSearchFilters = {
      firstName: "John",
      lastName: "",
      phoneNumber: "1234567890",
      city: "",
      postalCode: undefined,
    };

    const result = await searchCustomers(mockUser, filters);
    expect(result).toBeDefined();
  });

  it("should handle all search fields", async () => {
    const filters: CustomerSearchFilters = {
      customerId: "CUST001",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      alternatePhone: "0987654321",
      birthDate: "1990-01-01",
      taxId: "TAX123",
      street: "Main St",
      city: "Mexico City",
      postalCode: "12345",
    };

    const result = await searchCustomers(mockUser, filters);
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
  });
});
