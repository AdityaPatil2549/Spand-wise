/**
 * Utility for safe date sharding (YYYY-MM).
 * Avoids UTC skew issues by using local time generation.
 */
export const getLocalMonthString = (date: Date): string => {
  const year = date.getFullYear();
  // getMonth() is 0-indexed, so we add 1 and pad with 0 if necessary
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Returns the local date string in YYYY-MM-DD format.
 */
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
