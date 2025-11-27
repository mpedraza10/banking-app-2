/**
 * Reference Validation System
 * 
 * Provides service-specific reference number validation based on provider formats.
 * Each service has unique validation rules that must be enforced before payment processing.
 */

// Reference format types
export type ReferenceFormatType = 
  | "numeric"      // Pure numeric format
  | "alphanumeric" // Mix of letters and numbers
  | "custom";      // Custom pattern with regex

// Validation rule definition
export interface ValidationRule {
  type: ReferenceFormatType;
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  pattern?: RegExp;
  checksum?: (reference: string) => boolean;
  description: string;
}

// Service-specific validation rules
const SERVICE_VALIDATION_RULES: Record<string, ValidationRule> = {
  // CFE (Federal Electricity Commission)
  CFE: {
    type: "numeric",
    exactLength: 12,
    pattern: /^\d{12}$/,
    description: "CFE reference must be 12 numeric digits",
  },
  
  // Telmex (Telephone service)
  TELMEX: {
    type: "numeric",
    exactLength: 10,
    pattern: /^\d{10}$/,
    description: "Telmex reference must be 10 numeric digits",
  },
  
  // GNM (Gas Natural México)
  GNM: {
    type: "numeric",
    exactLength: 16,
    pattern: /^\d{16}$/,
    description: "GNM reference must be 16 numeric digits",
  },
  
  // Cablevisión
  CABLEVISION: {
    type: "numeric",
    exactLength: 7,
    pattern: /^\d{7}$/,
    description: "Cablevisión reference must be 7 numeric digits",
  },
  
  // Diestel (Special 30-digit format)
  DIESTEL: {
    type: "numeric",
    exactLength: 30,
    pattern: /^\d{30}$/,
    checksum: validateDiestelChecksum,
    description: "Diestel reference must be 30 numeric digits with valid checksum",
  },

  // Telcel (Mobile service)
  TELCEL: {
    type: "numeric",
    exactLength: 10,
    pattern: /^\d{10}$/,
    description: "Telcel reference must be 10 numeric digits",
  },
};

/**
 * Extract base service code from full service code
 * Handles formats like "TELMEX-001" -> "TELMEX"
 */
function extractBaseServiceCode(serviceCode: string): string {
  // Remove any suffix after hyphen (e.g., "TELMEX-001" -> "TELMEX")
  const baseCode = serviceCode.split('-')[0].toUpperCase();
  return baseCode;
}

/**
 * Validate reference number based on service code
 */
export function validateReference(
  serviceCode: string,
  reference: string
): { isValid: boolean; message: string } {
  // Clean reference (remove spaces, hyphens, etc.)
  const cleanedReference = reference.replace(/[\s-]/g, "");
  
  // Extract base service code (handles formats like "TELMEX-001")
  const baseServiceCode = extractBaseServiceCode(serviceCode);
  
  // Get validation rules for service
  const rules = SERVICE_VALIDATION_RULES[baseServiceCode];
  
  if (!rules) {
    return {
      isValid: false,
      message: `No validation rules defined for service: ${baseServiceCode}`,
    };
  }
  
  // Check exact length if specified
  if (rules.exactLength && cleanedReference.length !== rules.exactLength) {
    return {
      isValid: false,
      message: `Reference must be exactly ${rules.exactLength} characters. ${rules.description}`,
    };
  }
  
  // Check length range if specified
  if (rules.minLength && cleanedReference.length < rules.minLength) {
    return {
      isValid: false,
      message: `Reference must be at least ${rules.minLength} characters. ${rules.description}`,
    };
  }
  
  if (rules.maxLength && cleanedReference.length > rules.maxLength) {
    return {
      isValid: false,
      message: `Reference must not exceed ${rules.maxLength} characters. ${rules.description}`,
    };
  }
  
  // Check pattern if specified
  if (rules.pattern && !rules.pattern.test(cleanedReference)) {
    return {
      isValid: false,
      message: `Reference format is invalid. ${rules.description}`,
    };
  }
  
  // Check checksum if specified
  if (rules.checksum && !rules.checksum(cleanedReference)) {
    return {
      isValid: false,
      message: "Reference checksum validation failed. Please verify the reference number.",
    };
  }
  
  // All validations passed
  return {
    isValid: true,
    message: "Reference number is valid",
  };
}

/**
 * Diestel-specific checksum validation
 * Implements Luhn algorithm for 30-digit reference
 */
function validateDiestelChecksum(reference: string): boolean {
  if (reference.length !== 30) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  // Process digits from right to left
  for (let i = reference.length - 1; i >= 0; i--) {
    let digit = parseInt(reference[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  // Valid if sum is divisible by 10
  return sum % 10 === 0;
}

/**
 * Format reference for display based on service
 */
export function formatReference(serviceCode: string, reference: string): string {
  const cleanedReference = reference.replace(/[\s-]/g, "");
  const baseServiceCode = extractBaseServiceCode(serviceCode);
  
  switch (baseServiceCode) {
    case "CFE":
      // Format as: XXXX-XXXX-XXXX
      return cleanedReference.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    
    case "TELMEX":
      // Format as: XX-XXXX-XXXX
      return cleanedReference.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
    
    case "DIESTEL":
      // Format as: XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX
      return cleanedReference.replace(
        /(\d{6})(\d{6})(\d{6})(\d{6})(\d{6})/,
        "$1-$2-$3-$4-$5"
      );
    
    default:
      return cleanedReference;
  }
}

/**
 * Get validation rules for a service
 */
export function getValidationRules(serviceCode: string): ValidationRule | null {
  const baseServiceCode = extractBaseServiceCode(serviceCode);
  return SERVICE_VALIDATION_RULES[baseServiceCode] || null;
}

/**
 * Check if a service code has validation rules defined
 */
export function hasValidationRules(serviceCode: string): boolean {
  const baseServiceCode = extractBaseServiceCode(serviceCode);
  return baseServiceCode in SERVICE_VALIDATION_RULES;
}

/**
 * Extract reference information (if applicable)
 * Some references contain embedded metadata
 */
export function extractReferenceInfo(
  serviceCode: string,
  reference: string
): Record<string, unknown> {
  const cleanedReference = reference.replace(/[\s-]/g, "");
  const baseServiceCode = extractBaseServiceCode(serviceCode);
  
  switch (baseServiceCode) {
    case "DIESTEL":
      // Diestel format: [6 digits region][6 digits account][18 digits transaction info]
      if (cleanedReference.length === 30) {
        return {
          region: cleanedReference.substring(0, 6),
          account: cleanedReference.substring(6, 12),
          transactionInfo: cleanedReference.substring(12, 30),
        };
      }
      break;
    
    // Add other service-specific extractions as needed
  }
  
  return {};
}
