/**
 * Cryptographically strong UUID v4 generator using native browser crypto API
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};
