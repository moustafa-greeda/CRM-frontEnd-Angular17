/**
 * Array utility functions for common array operations
 */

/**
 * Remove duplicates from an array based on a key
 * @param array - Array of objects
 * @param key - Key to check for uniqueness
 * @returns Array with unique items
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Remove duplicates from an array of primitives
 * @param array - Array of primitives
 * @returns Array with unique items
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by a key
 * @param array - Array of objects
 * @param key - Key to group by
 * @returns Object with grouped items
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by a key
 * @param array - Array of objects
 * @param key - Key to sort by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Sorted array
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;

    const comparison = aVal > bVal ? 1 : -1;
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter array by multiple conditions
 * @param array - Array to filter
 * @param filters - Object with key-value pairs to filter by
 * @returns Filtered array
 */
export function filterBy<T extends Record<string, any>>(
  array: T[],
  filters: Partial<T>
): T[] {
  return array.filter((item) => {
    return Object.keys(filters).every((key) => {
      const filterValue = filters[key];
      if (
        filterValue === undefined ||
        filterValue === null ||
        filterValue === ''
      ) {
        return true;
      }
      return item[key] === filterValue;
    });
  });
}

/**
 * Find item in array by key-value pair
 * @param array - Array to search
 * @param key - Key to search by
 * @param value - Value to match
 * @returns Found item or undefined
 */
export function findById<T>(
  array: T[],
  key: keyof T,
  value: any
): T | undefined {
  return array.find((item) => item[key] === value);
}

/**
 * Check if array contains item with specific key-value
 * @param array - Array to check
 * @param key - Key to check
 * @param value - Value to match
 * @returns True if item exists
 */
export function containsBy<T>(array: T[], key: keyof T, value: any): boolean {
  return array.some((item) => item[key] === value);
}

/**
 * Remove item from array by key-value
 * @param array - Array to modify
 * @param key - Key to match
 * @param value - Value to match
 * @returns New array without the item
 */
export function removeBy<T>(array: T[], key: keyof T, value: any): T[] {
  return array.filter((item) => item[key] !== value);
}

/**
 * Chunk array into smaller arrays
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get paginated slice of array
 * @param array - Array to paginate
 * @param page - Page number (1-based)
 * @param pageSize - Items per page
 * @returns Object with items and pagination info
 */
export function paginate<T>(
  array: T[],
  page: number,
  pageSize: number
): { items: T[]; totalCount: number; totalPages: number; currentPage: number } {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = array.slice(startIndex, endIndex);
  const totalPages = Math.ceil(array.length / pageSize);

  return {
    items,
    totalCount: array.length,
    totalPages,
    currentPage: page,
  };
}
