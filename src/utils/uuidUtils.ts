/**
 * Utility functions for UUID validation and handling
 */

/**
 * Validates if a string is a valid UUID format
 * Supports both standard UUID format (with hyphens) and simple format (32 hex chars)
 */
export const isValidUUID = (str: string | null | undefined): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  // Standard UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Simple format: 32 hex characters
  const simpleUuidRegex = /^[0-9a-f]{32}$/i;
  
  return uuidRegex.test(str) || simpleUuidRegex.test(str);
};

/**
 * Converts a value to a valid UUID string or null
 * If the value is not a valid UUID, returns null
 */
export const toValidUUIDOrNull = (value: string | number | null | undefined): string | null => {
  if (!value) return null;
  
  const str = String(value);
  
  // If it's a valid UUID, return it
  if (isValidUUID(str)) {
    return str;
  }
  
  // If it's not a valid UUID, return null
  return null;
};

