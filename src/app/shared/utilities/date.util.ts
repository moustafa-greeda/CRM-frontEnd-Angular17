/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date to a localized string
 * @param date - Date object or ISO string
 * @param locale - Locale string (default: 'ar-SA')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format a date with time
 * @param date - Date object or ISO string
 * @param locale - Locale string (default: 'ar-SA')
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  locale: string = 'ar-SA'
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date - Date object or ISO string
 * @param locale - Locale string (default: 'ar-SA')
 * @returns Relative time string
 */
export function getRelativeTime(
  date: Date | string | null | undefined,
  locale: string = 'ar-SA'
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'منذ لحظات';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  }

  return formatDate(dateObj, locale);
}

/**
 * Check if a date is today
 * @param date - Date object or ISO string
 * @returns True if the date is today
 */
export function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false;

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get start of day
 * @param date - Date object (optional, defaults to today)
 * @returns Date object set to start of day
 */
export function getStartOfDay(date?: Date): Date {
  const d = date || new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get end of day
 * @param date - Date object (optional, defaults to today)
 * @returns Date object set to end of day
 */
export function getEndOfDay(date?: Date): Date {
  const d = date || new Date();
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

