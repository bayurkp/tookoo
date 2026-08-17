/**
 * Robust UUID v4 generator supporting Secure Contexts, LAN HTTP, and mobile webviews.
 */
export const generateUUID = (): string => {
  // 1. Native crypto.randomUUID (available in Secure Contexts: HTTPS & localhost)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails
    }
  }

  // 2. crypto.getRandomValues (available in almost all modern mobile browsers)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // RFC 4122 version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant 10xx
      return Array.from(bytes, (b, i) => {
        const hex = b.toString(16).padStart(2, '0');
        return i === 4 || i === 6 || i === 8 || i === 10 ? `-${hex}` : hex;
      }).join('');
    } catch {
      // Fallback to Math.random
    }
  }

  // 3. Math.random fallback (guaranteed to never fail anywhere)
  let d = Date.now();
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};
