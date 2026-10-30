/**
 * Format a Date for HTML datetime-local inputs using local wall time.
 * Date#toISOString is UTC, so slicing it shifts the value by the timezone offset
 * (e.g. IST UTC+5:30) and can make a "5 hours from now" default already expired.
 */
export const toDatetimeLocalValue = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
