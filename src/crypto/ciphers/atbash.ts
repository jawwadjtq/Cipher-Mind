/**
 * Atbash Cipher (Hebrew Biblical monoalphabetic substitution)
 * Maps A <-> Z, B <-> Y, C <-> X, etc.
 * Encryption and decryption are identical (self-reciprocal).
 */

export function atbash(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const offset = char.charCodeAt(0) - base;
    return String.fromCharCode(base + (25 - offset));
  });
}
