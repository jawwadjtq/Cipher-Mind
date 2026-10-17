/**
 * Affine Cipher
 * Encryption: E(x) = (a*x + b) mod 26
 * Decryption: D(y) = a_inv*(y - b) mod 26
 * Where a must be coprime to 26: gcd(a, 26) = 1
 */

export const AFFINE_VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

export const MODULAR_INVERSE_26: Record<number, number> = {
  1: 1,
  3: 9,
  5: 21,
  7: 15,
  9: 3,
  11: 19,
  15: 7,
  17: 23,
  19: 11,
  21: 5,
  23: 17,
  25: 25,
};

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function affineEncrypt(text: string, a: number, b: number): string {
  if (gcd(a, 26) !== 1) {
    throw new Error(`Multiplier 'a' (${a}) must be coprime to 26. Valid choices: ${AFFINE_VALID_A.join(', ')}`);
  }
  const normB = ((b % 26) + 26) % 26;

  return text.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const x = char.charCodeAt(0) - base;
    const enc = ((a * x + normB) % 26 + 26) % 26;
    return String.fromCharCode(base + enc);
  });
}

export function affineDecrypt(text: string, a: number, b: number): string {
  if (gcd(a, 26) !== 1) {
    throw new Error(`Multiplier 'a' (${a}) must be coprime to 26. Valid choices: ${AFFINE_VALID_A.join(', ')}`);
  }
  const aInv = MODULAR_INVERSE_26[((a % 26) + 26) % 26];
  if (!aInv) {
    throw new Error(`No modular inverse found for a=${a} mod 26`);
  }
  const normB = ((b % 26) + 26) % 26;

  return text.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    const y = char.charCodeAt(0) - base;
    const dec = ((aInv * (y - normB)) % 26 + 26) % 26;
    return String.fromCharCode(base + dec);
  });
}

/**
 * Brute-force crack all 312 combinations of (a, b)
 */
export function crackAffineAllKeys(ciphertext: string): Array<{ a: number; b: number; plaintext: string }> {
  const results: Array<{ a: number; b: number; plaintext: string }> = [];
  for (const a of AFFINE_VALID_A) {
    for (let b = 0; b < 26; b++) {
      results.push({
        a,
        b,
        plaintext: affineDecrypt(ciphertext, a, b),
      });
    }
  }
  return results;
}
