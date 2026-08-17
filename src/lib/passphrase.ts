const DEFAULT_WORDLIST = [
  'ocean',
  'forest',
  'monkey',
  'vintage',
  'crystal',
  'guitar',
  'silver',
  'river',
  'tiger',
  'winter',
  'cloud',
  'amber',
  'breeze',
  'candle',
  'desert',
  'eagle',
  'flame',
  'garden',
  'harbor',
  'island',
  'jungle',
  'knight',
  'legend',
  'meadow',
  'nature',
  'orchid',
  'planet',
  'quartz',
  'shadow',
  'timber',
  'valley',
  'zenith',
  'beacon',
  'canyon',
  'dragon',
  'ember',
  'falcon',
  'galaxy',
  'haven',
  'impact',
  'jasper',
  'kudu',
  'lotus',
  'marble',
  'nebula',
  'oasis',
  'palace',
  'radiance',
  'safari',
  'thunder',
  'voyage',
  'whisper',
  'acorn',
  'blossom',
  'clover',
  'drift',
];

/**
 * Generates a 12-word mnemonic passphrase for zero-config pairing
 */
export const generatePassphrase = (wordCount = 12): string => {
  const words: string[] = [];

  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const cryptoArray = new Uint32Array(wordCount);
      crypto.getRandomValues(cryptoArray);
      for (let i = 0; i < wordCount; i++) {
        const wordIndex = cryptoArray[i] % DEFAULT_WORDLIST.length;
        words.push(DEFAULT_WORDLIST[wordIndex]);
      }
      return words.join(' ');
    }
  } catch {
    // Fallback if crypto fails
  }

  // Math.random fallback
  for (let i = 0; i < wordCount; i++) {
    const wordIndex = Math.floor(Math.random() * DEFAULT_WORDLIST.length);
    words.push(DEFAULT_WORDLIST[wordIndex]);
  }

  return words.join(' ');
};

/**
 * Sanitizes and normalizes passphrase input from user
 */
export const normalizePassphrase = (input: string): string => {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
};
