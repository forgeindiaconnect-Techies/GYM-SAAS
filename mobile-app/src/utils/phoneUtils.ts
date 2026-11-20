/**
 * Strips any non-digit characters (alphabets, symbols, spaces),
 * enforces that phone numbers must start with 6, 7, 8, or 9 (not 0-5),
 * and limits phone numbers to at most 10 digits.
 */
export const sanitizeTenDigitPhone = (value: string): string => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 10);
  if (digits.length > 0 && !/^[6-9]/.test(digits)) return '';
  return digits;
};

/**
 * Returns true when the value consists of exactly 10 numeric digits starting with 6, 7, 8, or 9.
 */
export const isValidTenDigitPhone = (value: string): boolean =>
  /^[6-9]\d{9}$/.test(value || '');

/**
 * Strips any non-digit characters (alphabets, symbols, spaces)
 * and limits PIN codes to at most 6 digits.
 */
export const sanitizeSixDigitPinCode = (value: string): string =>
  (value || '').replace(/\D/g, '').slice(0, 6);

/**
 * Returns true when the value consists of exactly 6 numeric digits.
 */
export const isValidSixDigitPinCode = (value: string): boolean =>
  /^\d{6}$/.test(value || '');

