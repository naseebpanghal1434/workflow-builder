/**
 * @fileoverview Time ago utility for relative timestamps
 * @module Lib/Utils/TimeAgo
 */

/**
 * Time intervals in seconds
 */
const intervals = {
  year: 31536000,
  month: 2592000,
  week: 604800,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
};

/**
 * Convert a timestamp to a relative time string
 *
 * @param {string | Date} timestamp - ISO timestamp or Date object
 * @returns {string} Relative time string (e.g., "2 hours ago", "just now")
 *
 * @example
 * timeAgo('2024-01-15T10:00:00Z') // "2 hours ago"
 * timeAgo(new Date(Date.now() - 60000)) // "1 minute ago"
 */
export function timeAgo(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) {
    return 'just now';
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);

    if (interval >= 1) {
      return interval === 1
        ? `${interval} ${unit} ago`
        : `${interval} ${unit}s ago`;
    }
  }

  return 'just now';
}

/**
 * Format a timestamp for display with "Last edited" prefix
 *
 * @param {string | Date | null} timestamp - ISO timestamp, Date object, or null
 * @returns {string} Formatted string (e.g., "Last edited 2 hours ago")
 *
 * @example
 * formatLastEdited('2024-01-15T10:00:00Z') // "Last edited 2 hours ago"
 * formatLastEdited(null) // "Never edited"
 */
export function formatLastEdited(timestamp: string | Date | null): string {
  if (!timestamp) {
    return 'Never edited';
  }

  return `Last edited ${timeAgo(timestamp)}`;
}
