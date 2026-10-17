/**
 * Vigenère, Beaufort, and Autokey Ciphers
 */

import { ENGLISH_LETTER_FREQUENCIES } from '../frequencies';

export function cleanKey(key: string): string {
  const clean = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!clean) throw new Error('Key must contain at least one alphabetic letter.');
  return clean;
}

export function vigenereEncrypt(plaintext: string, rawKey: string): string {
  const key = cleanKey(rawKey);
  let keyIndex = 0;

  return plaintext.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const p = char.charCodeAt(0) - base;
    const k = key.charCodeAt(keyIndex % key.length) - 65;
    keyIndex++;
    const c = (p + k) % 26;
    return String.fromCharCode(base + c);
  });
}

export function vigenereDecrypt(ciphertext: string, rawKey: string): string {
  const key = cleanKey(rawKey);
  let keyIndex = 0;

  return ciphertext.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const c = char.charCodeAt(0) - base;
    const k = key.charCodeAt(keyIndex % key.length) - 65;
    keyIndex++;
    const p = ((c - k) % 26 + 26) % 26;
    return String.fromCharCode(base + p);
  });
}

/**
 * Beaufort Cipher: E(x) = (K - P) mod 26
 * Decryption is identical: D(y) = (K - C) mod 26
 */
export function beaufortCipher(text: string, rawKey: string): string {
  const key = cleanKey(rawKey);
  let keyIndex = 0;

  return text.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const p = char.charCodeAt(0) - base;
    const k = key.charCodeAt(keyIndex % key.length) - 65;
    keyIndex++;
    const c = ((k - p) % 26 + 26) % 26;
    return String.fromCharCode(base + c);
  });
}

/**
 * Autokey Cipher (Plaintext autokey)
 */
export function autokeyEncrypt(plaintext: string, rawKey: string): string {
  const initialKey = cleanKey(rawKey);
  const cleanPlain = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
  const fullKey = initialKey + cleanPlain;
  let keyIndex = 0;

  return plaintext.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const p = char.charCodeAt(0) - base;
    const k = fullKey.charCodeAt(keyIndex) - 65;
    keyIndex++;
    const c = (p + k) % 26;
    return String.fromCharCode(base + c);
  });
}

export function autokeyDecrypt(ciphertext: string, rawKey: string): string {
  const initialKey = cleanKey(rawKey);
  let keyStream = initialKey;
  let keyIndex = 0;
  let result = '';

  for (let i = 0; i < ciphertext.length; i++) {
    const char = ciphertext[i];
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char >= 'A' && char <= 'Z';
      const base = isUpper ? 65 : 97;
      const c = char.charCodeAt(0) - base;
      const k = keyStream.charCodeAt(keyIndex) - 65;
      const p = ((c - k) % 26 + 26) % 26;
      const pCharUpper = String.fromCharCode(65 + p);
      keyStream += pCharUpper;
      keyIndex++;
      result += String.fromCharCode(base + p);
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Common keys used in puzzles and challenges for key guessing
 */
export const COMMON_VIGENERE_KEYS = [
  'KEY', 'SECRET', 'CIPHER', 'PASS', 'PASSWORD', 'LEMON', 'CRYPTO',
  'FLAG', 'CODE', 'HIDDEN', 'TEST', 'ALPHA', 'BRAVO', 'MATRIX',
  'SOLVE', 'SYSTEM', 'ATTACK', 'DAWN', 'DEFEND', 'VICTORY'
];

/**
 * Attempts to solve Vigenère for a given key length by frequency analysis on cosets
 */
export function crackVigenereByLength(ciphertext: string, keyLength: number): { key: string; plaintext: string } {
  const letters = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  if (letters.length < keyLength * 4) {
    return { key: '', plaintext: '' };
  }

  let derivedKey = '';

  for (let col = 0; col < keyLength; col++) {
    // Collect all letters for this column
    const slice: string[] = [];
    for (let i = col; i < letters.length; i += keyLength) {
      slice.push(letters[i]);
    }

    let bestShift = 0;
    let minChiSq = Infinity;

    for (let shift = 0; shift < 26; shift++) {
      // Decode slice with this shift
      const counts: Record<string, number> = {};
      for (let i = 0; i < 26; i++) {
        counts[String.fromCharCode(65 + i)] = 0;
      }
      for (const ch of slice) {
        const decCh = String.fromCharCode(65 + (((ch.charCodeAt(0) - 65 - shift) % 26 + 26) % 26));
        counts[decCh] = (counts[decCh] || 0) + 1;
      }

      let chiSq = 0;
      for (let i = 0; i < 26; i++) {
        const ch = String.fromCharCode(65 + i);
        const observed = counts[ch];
        const expected = (ENGLISH_LETTER_FREQUENCIES[ch] / 100) * slice.length;
        const diff = observed - expected;
        chiSq += (diff * diff) / (expected || 0.001);
      }

      if (chiSq < minChiSq) {
        minChiSq = chiSq;
        bestShift = shift;
      }
    }

    derivedKey += String.fromCharCode(65 + bestShift);
  }

  return {
    key: derivedKey,
    plaintext: vigenereDecrypt(ciphertext, derivedKey),
  };
}
