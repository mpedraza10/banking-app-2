
import { validateReference } from "./reference-validation";

describe("Reference Validation", () => {
  describe("CFE", () => {
    it("should validate correct CFE reference (12 digits)", () => {
      const result = validateReference("CFE", "123456789012");
      expect(result.isValid).toBe(true);
    });

    it("should fail invalid CFE reference length", () => {
      const result = validateReference("CFE", "123456");
      expect(result.isValid).toBe(false);
    });
  });

  describe("TELMEX", () => {
    it("should validate correct TELMEX reference (10 digits)", () => {
      const result = validateReference("TELMEX", "1234567890");
      expect(result.isValid).toBe(true);
    });
  });

  describe("CABLEVISION", () => {
    it("should validate correct CABLEVISION reference (7 digits)", () => {
      const result = validateReference("CABLEVISION", "1234567");
      expect(result.isValid).toBe(true);
    });

    it("should fail invalid CABLEVISION reference length (10 digits)", () => {
      const result = validateReference("CABLEVISION", "1234567890");
      expect(result.isValid).toBe(false);
    });
  });

  describe("TELCEL", () => {
    it("should validate correct TELCEL reference (10 digits)", () => {
      const result = validateReference("TELCEL", "1234567890");
      expect(result.isValid).toBe(true);
    });
  });
});
