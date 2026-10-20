/**
 * Monoalphabetic Substitution Cipher
 * Permutation of the 26-letter Latin alphabet using either a full 26-letter substitution alphabet
 * or a keyword-derived alphabet (removing duplicates and appending remaining letters).
 */

export const STANDARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generates a keyed substitution alphabet from a keyword.
 * E.g., 'ZEBRAS' -> 'ZEBRACDFGHIJKLMNOPQSTUVWXY'
 */
export function generateKeyedAlphabet(keyword: string): string {
  const clean = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  if (!clean) return STANDARD_ALPHABET;

  const seen = new Set<string>();
  let result = '';

  for (const char of clean) {
    if (!seen.has(char)) {
      seen.add(char);
      result += char;
    }
  }

  for (const char of STANDARD_ALPHABET) {
    if (!seen.has(char)) {
      seen.add(char);
      result += char;
    }
  }

  return result;
}

/**
 * Validates and normalizes a substitution key.
 * If 26 distinct letters are provided, it is used as the direct mapping.
 * If a shorter keyword is provided, it expands it via generateKeyedAlphabet.
 */
export function normalizeSubstitutionKey(inputKey: string): {
  valid: boolean;
  alphabet: string;
  error?: string;
} {
  const clean = (inputKey || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (!clean) {
    return {
      valid: false,
      alphabet: STANDARD_ALPHABET,
      error: 'Please enter a keyword or a 26-letter substitution alphabet.',
    };
  }

  if (clean.length === 26) {
    const unique = new Set(clean.split(''));
    if (unique.size !== 26) {
      return {
        valid: false,
        alphabet: STANDARD_ALPHABET,
        error: `A 26-letter substitution alphabet must contain all 26 unique A-Z letters. Duplicate letters found.`,
      };
    }
    return { valid: true, alphabet: clean };
  }

  // Shorter keyword - expand to full 26-letter keyed alphabet
  const keyed = generateKeyedAlphabet(clean);
  return { valid: true, alphabet: keyed };
}

/**
 * Generates a random 26-letter substitution alphabet
 */
export function generateRandomSubstitutionAlphabet(): string {
  const letters = STANDARD_ALPHABET.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join('');
}

/**
 * Encrypts plaintext using monoalphabetic substitution.
 * Preserves casing, numbers, punctuation, and spaces.
 */
export function monoalphabeticEncrypt(plaintext: string, keyOrKeyword: string): string {
  const { valid, alphabet, error } = normalizeSubstitutionKey(keyOrKeyword);
  if (!valid) throw new Error(error || 'Invalid substitution alphabet');

  return plaintext.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const index = char.charCodeAt(0) - base;
    const subChar = alphabet[index];
    return isUpper ? subChar : subChar.toLowerCase();
  });
}

/**
 * Decrypts ciphertext using monoalphabetic substitution.
 * Inverts the substitution alphabet mapping.
 */
export function monoalphabeticDecrypt(ciphertext: string, keyOrKeyword: string): string {
  const { valid, alphabet, error } = normalizeSubstitutionKey(keyOrKeyword);
  if (!valid) throw new Error(error || 'Invalid substitution alphabet');

  // Build reverse lookup map
  const reverseMap: Record<string, string> = {};
  for (let i = 0; i < 26; i++) {
    const cipherChar = alphabet[i];
    const plainChar = STANDARD_ALPHABET[i];
    reverseMap[cipherChar] = plainChar;
  }

  return ciphertext.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const upper = char.toUpperCase();
    const plainChar = reverseMap[upper] || upper;
    return isUpper ? plainChar : plainChar.toLowerCase();
  });
}

/**
 * Frequency-based monoalphabetic substitution heuristic.
 * Maps letters ordered by observed frequency in ciphertext directly to standard English frequency:
 * ETAOINSHRDLCUMWFGYPBVKJXQZ
 */
export function frequencyMonoalphabeticGuess(ciphertext: string): string {
  const counts: Record<string, number> = {};
  for (const ch of ciphertext.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      counts[ch] = (counts[ch] || 0) + 1;
    }
  }
  const sortedCipherLetters = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const englishFreq = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
  const map: Record<string, string> = {};
  for (let i = 0; i < sortedCipherLetters.length; i++) {
    map[sortedCipherLetters[i]] = englishFreq[i] || 'Z';
  }

  return ciphertext.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const plain = map[char.toUpperCase()] || char;
    return isUpper ? plain : plain.toLowerCase();
  });
}

