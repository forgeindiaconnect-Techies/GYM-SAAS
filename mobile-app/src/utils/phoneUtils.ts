/**
 * Strips any non-digit characters (alphabets, symbols, spaces)
 * and limits phone numbers to at most 10 digits.
 */
export const sanitizeTenDigitPhone = (value: string): string =>
  (value || '').replace(/\D/g, '').slice(0, 10);

/**
 * Returns true when the value consists of exactly 10 numeric digits.
 */
export const isValidTenDigitPhone = (value: string): boolean =>
  /^\d{10}$/.test(value || '');

