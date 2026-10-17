/**
 * Hill Cipher (2x2 Matrix Linear Algebraic Substitution modulo 26)
 */

import { gcd, MODULAR_INVERSE_26 } from './affine';

export interface HillMatrix2x2 {
  a: number;
  b: number;
  c: number;
  d: number;
}

export function calculateDeterminant2x2(m: HillMatrix2x2): number {
  return ((m.a * m.d - m.b * m.c) % 26 + 26) % 26;
}

export function isInvertibleHill2x2(m: HillMatrix2x2): boolean {
  const det = calculateDeterminant2x2(m);
  return det !== 0 && gcd(det, 26) === 1;
}

export function invertHillMatrix2x2(m: HillMatrix2x2): HillMatrix2x2 {
  const det = calculateDeterminant2x2(m);
  if (gcd(det, 26) !== 1) {
    throw new Error(`Matrix is non-invertible mod 26. Determinant is ${det}, which shares factors with 26.`);
  }

  const detInv = MODULAR_INVERSE_26[det];
  if (!detInv) {
    throw new Error(`No modular inverse for determinant ${det} mod 26.`);
  }

  // Adjugate matrix of [a, b; c, d] is [d, -b; -c, a]
  const invA = ((m.d * detInv) % 26 + 26) % 26;
  const invB = (((-m.b) * detInv) % 26 + 26) % 26;
  const invC = (((-m.c) * detInv) % 26 + 26) % 26;
  const invD = ((m.a * detInv) % 26 + 26) % 26;

  return { a: invA, b: invB, c: invC, d: invD };
}

export function hillEncrypt2x2(plaintext: string, m: HillMatrix2x2): string {
  if (!isInvertibleHill2x2(m)) {
    throw new Error(`Hill matrix is non-invertible mod 26. Det: ${calculateDeterminant2x2(m)}`);
  }

  const clean = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
  const padded = clean.length % 2 === 0 ? clean : clean + 'X';

  let ciphertext = '';
  for (let i = 0; i < padded.length; i += 2) {
    const x = padded.charCodeAt(i) - 65;
    const y = padded.charCodeAt(i + 1) - 65;

    const c1 = ((m.a * x + m.b * y) % 26 + 26) % 26;
    const c2 = ((m.c * x + m.d * y) % 26 + 26) % 26;

    ciphertext += String.fromCharCode(65 + c1) + String.fromCharCode(65 + c2);
  }

  return ciphertext;
}

export function hillDecrypt2x2(ciphertext: string, m: HillMatrix2x2): string {
  const inv = invertHillMatrix2x2(m);
  const clean = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');

  if (clean.length % 2 !== 0) {
    throw new Error('Hill ciphertext must have an even number of characters.');
  }

  let plaintext = '';
  for (let i = 0; i < clean.length; i += 2) {
    const c1 = clean.charCodeAt(i) - 65;
    const c2 = clean.charCodeAt(i + 1) - 65;

    const p1 = ((inv.a * c1 + inv.b * c2) % 26 + 26) % 26;
    const p2 = ((inv.c * c1 + inv.d * c2) % 26 + 26) % 26;

    plaintext += String.fromCharCode(65 + p1) + String.fromCharCode(65 + p2);
  }

  return plaintext;
}

/**
 * Common invertible 2x2 matrices for educational testing
 */
export const POPULAR_HILL_MATRICES: HillMatrix2x2[] = [
  { a: 3, b: 3, c: 2, d: 5 }, // det = 15 - 6 = 9. gcd(9, 26) = 1
  { a: 5, b: 8, c: 17, d: 3 }, // det = 15 - 136 = -121 = 9 mod 26
  { a: 2, b: 3, c: 1, d: 4 }, // det = 8 - 3 = 5. gcd(5, 26) = 1
  { a: 7, b: 8, c: 11, d: 11 }, // det = 77 - 88 = -11 = 15 mod 26
  { a: 9, b: 4, c: 5, d: 7 }, // det = 63 - 20 = 43 = 17 mod 26
];
