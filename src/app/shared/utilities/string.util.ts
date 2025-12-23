/**
 * String utility functions
 */

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 * @param str - String to capitalize
 * @returns String with each word capitalized
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncate string to specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(
  str: string | null | undefined,
  length: number,
  suffix: string = '...'
): string {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Remove whitespace from string
 * @param str - String to clean
 * @returns String without whitespace
 */
export function removeWhitespace(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\s+/g, '');
}

/**
 * Convert string to slug format
 * @param str - String to convert
 * @returns Slug string
 */
export function toSlug(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract numbers from string
 * @param str - String to extract numbers from
 * @returns Array of numbers found
 */
export function extractNumbers(str: string | null | undefined): number[] {
  if (!str || typeof str !== 'string') return [];
  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Mask sensitive information (e.g., phone numbers, emails)
 * @param str - String to mask
 * @param visibleChars - Number of characters to show at start and end
 * @param maskChar - Character to use for masking
 * @returns Masked string
 */
export function maskString(
  str: string | null | undefined,
  visibleChars: number = 3,
  maskChar: string = '*'
): string {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= visibleChars * 2) return maskChar.repeat(str.length);
  const start = str.substring(0, visibleChars);
  const end = str.substring(str.length - visibleChars);
  const middle = maskChar.repeat(str.length - visibleChars * 2);
  return start + middle + end;
}

/**
 * Format phone number (basic formatting)
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
}

/**
 * Search string in text (case-insensitive)
 * @param text - Text to search in
 * @param searchTerm - Term to search for
 * @returns True if search term is found
 */
export function searchInText(
  text: string | null | undefined,
  searchTerm: string | null | undefined
): boolean {
  if (!text || !searchTerm) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Replace all occurrences in string
 * @param str - String to replace in
 * @param search - String to search for
 * @param replace - String to replace with
 * @returns New string with replacements
 */
export function replaceAll(
  str: string | null | undefined,
  search: string,
  replace: string
): string {
  if (!str || typeof str !== 'string') return '';
  return str.split(search).join(replace);
}

