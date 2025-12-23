/**
 * Validation utility functions
 */

/**
 * Check if a value is a valid number
 * @param value - Value to check
 * @returns True if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if a string is a valid numeric string
 * @param value - String to check
 * @returns True if string can be converted to a valid number
 */
export function isValidNumericString(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Check if a value is a valid ID (positive integer)
 * @param value - Value to check
 * @returns True if value is a valid ID
 */
export function isValidId(value: any): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0;
  }
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 && num.toString() === value;
  }
  return false;
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 * @param phone - Phone string to validate
 * @returns True if phone is valid
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Remove common phone number characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  // Check if it's all digits and has reasonable length
  return /^\d+$/.test(cleaned) && cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Check if value is not empty
 * @param value - Value to check
 * @returns True if value is not empty
 */
export function isNotEmpty(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Check if value is empty
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: any): boolean {
  return !isNotEmpty(value);
}

/**
 * Validate array of IDs
 * @param ids - Array of values to validate as IDs
 * @returns Array of invalid IDs
 */
export function validateIds(ids: any[]): any[] {
  return ids.filter((id) => !isValidId(id));
}

/**
 * Check if object has required properties
 * @param obj - Object to check
 * @param requiredKeys - Array of required keys
 * @returns True if all required keys exist
 */
export function hasRequiredProperties(
  obj: Record<string, any>,
  requiredKeys: string[]
): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return requiredKeys.every((key) => key in obj && isNotEmpty(obj[key]));
}

