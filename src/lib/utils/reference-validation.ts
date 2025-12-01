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
  verificationDigitValidator?: (reference: string, digit: string) => boolean;
  requiresVerificationDigit?: boolean;
  verificationDigitLength?: number;
  description: string;
}

// Service-specific validation rules
const SERVICE_VALIDATION_RULES: Record<string, ValidationRule> = {
  // CFE (Federal Electricity Commission)
  CFE: {
    type: "numeric",
    exactLength: 12,
    pattern: /^\d{12}$/,
    requiresVerificationDigit: true,
    verificationDigitLength: 1,
    verificationDigitValidator: validateCFEVerificationDigit,
    description: "CFE reference must be 12 numeric digits with valid verification digit",
  },
  
  // Telmex (Telephone service)
  TELMEX: {
    type: "numeric",
    exactLength: 10,
    pattern: /^\d{10}$/,
    requiresVerificationDigit: true,
    verificationDigitLength: 1,
    verificationDigitValidator: validateTelmexVerificationDigit,
    description: "Telmex reference must be 10 numeric digits with valid verification digit",
  },
  
  // GNM (Gas Natural México)
  GNM: {
    type: "numeric",
    exactLength: 16,
    pattern: /^\d{16}$/,
    requiresVerificationDigit: true,
    verificationDigitLength: 1,
    verificationDigitValidator: validateGNMVerificationDigit,
    description: "GNM reference must be 16 numeric digits with valid verification digit",
  },
  
  // Cablevisión
  CABLEVISION: {
    type: "numeric",
    exactLength: 7,
    pattern: /^\d{7}$/,
    requiresVerificationDigit: false,
    description: "Cablevisión reference must be 7 numeric digits",
  },
  
  // Diestel (Special 30-digit format)
  DIESTEL: {
    type: "numeric",
    exactLength: 30,
    pattern: /^\d{30}$/,
    checksum: validateDiestelChecksum,
    requiresVerificationDigit: false,
    description: "Diestel reference must be 30 numeric digits with valid checksum",
  },

  // Telcel (Mobile service)
  TELCEL: {
    type: "numeric",
    exactLength: 10,
    pattern: /^\d{10}$/,
    requiresVerificationDigit: true,
    verificationDigitLength: 1,
    verificationDigitValidator: validateTelcelVerificationDigit,
    description: "Telcel reference must be 10 numeric digits with valid verification digit",
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
  reference: string,
  verificationDigit?: string
): { isValid: boolean; message: string; requiresVerificationDigit?: boolean } {
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
  
  // Check verification digit if required
  if (rules.requiresVerificationDigit) {
    // If verification digit is required but not provided, return info
    if (!verificationDigit || verificationDigit.trim() === "") {
      return {
        isValid: false,
        message: "Dígito verificador es requerido para este servicio",
        requiresVerificationDigit: true,
      };
    }
    
    // Validate verification digit length
    if (rules.verificationDigitLength && verificationDigit.length !== rules.verificationDigitLength) {
      return {
        isValid: false,
        message: `Dígito verificador debe tener ${rules.verificationDigitLength} dígito(s)`,
        requiresVerificationDigit: true,
      };
    }
    
    // Validate verification digit format (must be numeric)
    if (!/^\d+$/.test(verificationDigit)) {
      return {
        isValid: false,
        message: "Dígito verificador debe contener solo números",
        requiresVerificationDigit: true,
      };
    }
    
    // Validate verification digit using service-specific validator
    if (rules.verificationDigitValidator && !rules.verificationDigitValidator(cleanedReference, verificationDigit)) {
      return {
        isValid: false,
        message: "Dígito verificador inválido para esta referencia",
        requiresVerificationDigit: true,
      };
    }
  }
  
  // All validations passed
  return {
    isValid: true,
    message: "Reference number is valid",
    requiresVerificationDigit: rules.requiresVerificationDigit,
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
 * CFE verification digit validation
 * Uses Modulo 10 algorithm (Luhn variant)
 * The verification digit is calculated from the reference number
 */
function validateCFEVerificationDigit(reference: string, digit: string): boolean {
  if (reference.length !== 12 || digit.length !== 1) {
    return false;
  }
  
  // Calculate expected verification digit using Modulo 10
  const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
  let sum = 0;
  
  for (let i = 0; i < reference.length; i++) {
    let product = parseInt(reference[i], 10) * weights[i];
    // If product is >= 10, sum the digits
    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }
  
  // The verification digit is (10 - (sum % 10)) % 10
  const expectedDigit = (10 - (sum % 10)) % 10;
  
  return parseInt(digit, 10) === expectedDigit;
}

/**
 * Telmex verification digit validation
 * Uses weighted sum algorithm
 */
function validateTelmexVerificationDigit(reference: string, digit: string): boolean {
  if (reference.length !== 10 || digit.length !== 1) {
    return false;
  }
  
  // Telmex uses a weighted sum with alternating weights 2,1
  const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
  let sum = 0;
  
  for (let i = 0; i < reference.length; i++) {
    let product = parseInt(reference[i], 10) * weights[i];
    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }
  
  const expectedDigit = (10 - (sum % 10)) % 10;
  
  return parseInt(digit, 10) === expectedDigit;
}

/**
 * GNM (Gas Natural México) verification digit validation
 * Uses Modulo 11 algorithm
 */
function validateGNMVerificationDigit(reference: string, digit: string): boolean {
  if (reference.length !== 16 || digit.length !== 1) {
    return false;
  }
  
  // GNM uses Modulo 11 with weights 2-7 cycling
  const weights = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5];
  let sum = 0;
  
  for (let i = reference.length - 1; i >= 0; i--) {
    sum += parseInt(reference[i], 10) * weights[reference.length - 1 - i];
  }
  
  const remainder = sum % 11;
  let expectedDigit: number;
  
  if (remainder === 0) {
    expectedDigit = 0;
  } else if (remainder === 1) {
    expectedDigit = 0; // Special case, some implementations use 'K' but we use 0
  } else {
    expectedDigit = 11 - remainder;
  }
  
  return parseInt(digit, 10) === expectedDigit;
}

/**
 * Telcel verification digit validation
 * Uses Luhn algorithm variant
 */
function validateTelcelVerificationDigit(reference: string, digit: string): boolean {
  if (reference.length !== 10 || digit.length !== 1) {
    return false;
  }
  
  // Telcel uses standard Luhn algorithm
  let sum = 0;
  let isEven = true;
  
  for (let i = reference.length - 1; i >= 0; i--) {
    let d = parseInt(reference[i], 10);
    
    if (isEven) {
      d *= 2;
      if (d > 9) {
        d -= 9;
      }
    }
    
    sum += d;
    isEven = !isEven;
  }
  
  const expectedDigit = (10 - (sum % 10)) % 10;
  
  return parseInt(digit, 10) === expectedDigit;
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
 * Check if a service requires verification digit
 */
export function requiresVerificationDigit(serviceCode: string): boolean {
  const baseServiceCode = extractBaseServiceCode(serviceCode);
  const rules = SERVICE_VALIDATION_RULES[baseServiceCode];
  return rules?.requiresVerificationDigit ?? false;
}

/**
 * Get verification digit length for a service
 */
export function getVerificationDigitLength(serviceCode: string): number {
  const baseServiceCode = extractBaseServiceCode(serviceCode);
  const rules = SERVICE_VALIDATION_RULES[baseServiceCode];
  return rules?.verificationDigitLength ?? 1;
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
