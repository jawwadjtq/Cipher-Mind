/**
 * CipherMind AI - Automated Verification & Test Suite
 * Validates deterministic algorithm implementations, reversibility, and edge cases
 */

import { caesarDecrypt, caesarEncrypt, crackCaesarAllShifts, rot13, rot47 } from '../ciphers/caesar';
import { atbash } from '../ciphers/atbash';
import { affineDecrypt, affineEncrypt, gcd, crackAffineAllKeys } from '../ciphers/affine';
import { vigenereDecrypt, vigenereEncrypt, beaufortCipher, autokeyDecrypt, autokeyEncrypt } from '../ciphers/vigenere';
import { railFenceDecrypt, railFenceEncrypt, reverseText } from '../ciphers/transposition';
import { baconDecrypt, baconEncrypt } from '../ciphers/bacon';
import { playfairDecrypt, playfairEncrypt } from '../ciphers/playfair';
import { hillDecrypt2x2, hillEncrypt2x2, isInvertibleHill2x2 } from '../ciphers/hill';
import { xorSingleByte, xorRepeatingKey } from '../ciphers/xor';
import { morseDecode, morseEncode } from '../ciphers/morse';
import { base64Decode, base64Encode, hexDecode, hexEncode, binaryDecode, binaryEncode } from '../ciphers/encodings';
import { autoSolveAll } from '../solver';

export interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export function runCipherDiagnosticTests(): TestResult[] {
  const results: TestResult[] = [];

  function test(name: string, category: string, fn: () => void) {
    const start = performance.now();
    try {
      fn();
      results.push({
        name,
        category,
        passed: true,
        message: 'Passed successfully',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    } catch (err: any) {
      results.push({
        name,
        category,
        passed: false,
        message: err?.message || 'Assertion failed',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    }
  }

  // 1. Caesar Cipher Tests
  test('Caesar Reversibility', 'Caesar', () => {
    const original = 'Hello World! Quantum Physics 2026.';
    const encrypted = caesarEncrypt(original, 7);
    const decrypted = caesarDecrypt(encrypted, 7);
    if (decrypted !== original) throw new Error(`Expected "${original}", got "${decrypted}"`);
  });

  test('Caesar 26 Shifts Enumeration', 'Caesar', () => {
    const shifts = crackCaesarAllShifts('WKH TXLFN EURZQ');
    if (shifts.length !== 26) throw new Error(`Expected 26 shifts, got ${shifts.length}`);
    const shift3 = shifts.find((s) => s.shift === 3);
    if (!shift3 || !shift3.plaintext.includes('THE QUICK BROWN')) {
      throw new Error('Shift 3 failed to recover plaintext');
    }
  });

  // 2. ROT13 & ROT47 Tests
  test('ROT13 Self-Inverting', 'Caesar', () => {
    const text = 'Discover the wonders of science.';
    const once = rot13(text);
    const twice = rot13(once);
    if (twice !== text) throw new Error('ROT13 is not self-inverting');
  });

  test('ROT47 Reversibility', 'Caesar', () => {
    const text = 'Hello_World!#123';
    const enc = rot47(text);
    const dec = rot47(enc);
    if (dec !== text) throw new Error('ROT47 failed reversibility');
  });

  // 3. Atbash Test
  test('Atbash Reversibility', 'Substitution', () => {
    const text = 'The Secret Library of Alexandria';
    const enc = atbash(text);
    const dec = atbash(enc);
    if (dec !== text) throw new Error('Atbash failed self-reversibility');
  });

  // 4. Affine Cipher Tests
  test('Affine Reversibility', 'Substitution', () => {
    const text = 'MATHEMATICS IS UNIVERSAL';
    const a = 5;
    const b = 8;
    const enc = affineEncrypt(text, a, b);
    const dec = affineDecrypt(enc, a, b);
    if (dec !== text) throw new Error(`Affine reversibility failed: ${dec} !== ${text}`);
  });

  test('Affine Invalid Coprime Detection', 'Substitution', () => {
    let errorCaught = false;
    try {
      affineEncrypt('TEST', 4, 3); // 4 shares factor 2 with 26
    } catch {
      errorCaught = true;
    }
    if (!errorCaught) throw new Error('Failed to reject non-coprime multiplier a=4');
  });

  // 5. Vigenère & Polyalphabetic Tests
  test('Vigenère Reversibility with Keyword', 'Polyalphabetic', () => {
    const text = 'DISCOVER THE SECRETS OF NATURE';
    const key = 'LEMON';
    const enc = vigenereEncrypt(text, key);
    const dec = vigenereDecrypt(enc, key);
    if (dec !== text) throw new Error(`Vigenère failed: ${dec}`);
  });

  test('Beaufort Cipher Reversibility', 'Polyalphabetic', () => {
    const text = 'NAVIGATION BY CELESTIAL STARS';
    const key = 'HORIZON';
    const enc = beaufortCipher(text, key);
    const dec = beaufortCipher(enc, key);
    if (dec !== text) throw new Error('Beaufort self-reciprocal failed');
  });

  test('Autokey Cipher Reversibility', 'Polyalphabetic', () => {
    const text = 'MEET AT SUNRISE';
    const key = 'DAWN';
    const enc = autokeyEncrypt(text, key);
    const dec = autokeyDecrypt(enc, key);
    if (dec !== text) throw new Error(`Autokey failed: ${dec}`);
  });

  // 6. Transposition Tests
  test('Rail Fence 3 Rails Reversibility', 'Transposition', () => {
    const text = 'DEFEND THE EAST GATE';
    const rails = 3;
    const enc = railFenceEncrypt(text, rails);
    const dec = railFenceDecrypt(enc, rails);
    if (dec !== text) throw new Error(`Rail fence failed: ${dec}`);
  });

  test('Text Reversal', 'Transposition', () => {
    const text = 'ALGORITHM';
    if (reverseText(reverseText(text)) !== text) throw new Error('Reversal failed');
  });

  // 7. Matrix / Hill Cipher Tests
  test('Hill 2x2 Invertibility & Roundtrip', 'Matrix', () => {
    const matrix = { a: 3, b: 3, c: 2, d: 5 }; // det = 9, coprime to 26
    if (!isInvertibleHill2x2(matrix)) throw new Error('Valid matrix reported non-invertible');
    const text = 'HELP';
    const enc = hillEncrypt2x2(text, matrix);
    const dec = hillDecrypt2x2(enc, matrix);
    if (dec !== text) throw new Error(`Hill 2x2 failed: ${dec}`);
  });

  // 8. Playfair Cipher
  test('Playfair Encryption & Decryption', 'Matrix', () => {
    const key = 'MONARCHY';
    const text = 'HIDETHEGOLD';
    const enc = playfairEncrypt(text, key);
    const dec = playfairDecrypt(enc, key);
    // Playfair replaces J with I and appends padding X if odd length
    if (!dec.startsWith('HIDETHEGOLD')) {
      throw new Error(`Playfair failed to recover prefix: ${dec}`);
    }
  });

  // 9. Bacon's Cipher
  test('Bacon 26-Letter Roundtrip', 'Substitution', () => {
    const text = 'CIPHER';
    const enc = baconEncrypt(text, '26');
    const dec = baconDecrypt(enc, '26');
    if (dec !== text) throw new Error(`Bacon 26 failed: ${dec}`);
  });

  // 10. Morse Code
  test('Morse Code Roundtrip', 'Encoding', () => {
    const text = 'HELLO WORLD 2026';
    const enc = morseEncode(text);
    const dec = morseDecode(enc);
    if (dec !== text) throw new Error(`Morse code failed: ${dec}`);
  });

  // 11. Digital Encodings
  test('Base64 Encoding & Decoding', 'Encoding', () => {
    const text = 'Secret message with symbols: !@#$%^&*()';
    const enc = base64Encode(text);
    const dec = base64Decode(enc);
    if (dec !== text) throw new Error(`Base64 failed: ${dec}`);
  });

  test('Hexadecimal Encoding & Decoding', 'Encoding', () => {
    const text = 'Cryptographic Workbench';
    const enc = hexEncode(text);
    const dec = hexDecode(enc);
    if (dec !== text) throw new Error(`Hex failed: ${dec}`);
  });

  test('Binary 8-Bit Encoding & Decoding', 'Encoding', () => {
    const text = 'Code';
    const enc = binaryEncode(text);
    const dec = binaryDecode(enc);
    if (dec !== text) throw new Error(`Binary failed: ${dec}`);
  });

  // 12. XOR Cipher
  test('Single-Byte XOR Reversibility', 'Modern', () => {
    const text = 'Academic Research';
    const key = 0x5a;
    const enc = xorSingleByte(text, key);
    const dec = xorSingleByte(enc, key);
    if (dec !== text) throw new Error('XOR single byte failed');
  });

  // 13. Auto-Solver Pipeline End-to-End
  test('Auto-Solver Solves Caesar Shift 3', 'Auto-Solver', () => {
    const ciphertext = 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ';
    const res = autoSolveAll(ciphertext, { maxDepth: 2 });
    if (res.candidates.length === 0) throw new Error('No candidates found');
    const top = res.candidates[0];
    if (!top.plaintext.includes('THE QUICK BROWN FOX')) {
      throw new Error(`Top candidate was not Caesar shift 3: ${top.plaintext}`);
    }
    if (top.metrics.totalScore < 70) {
      throw new Error(`Expected score >= 70, got ${top.metrics.totalScore}`);
    }
  });

  test('Auto-Solver Solves Multi-Layer Base64 + Caesar', 'Auto-Solver', () => {
    // "KNOWLEDGE IS POWER" shifted by 3 -> "NQRZOHGJH LV SRZHU" -> Base64
    const plain = 'KNOWLEDGE IS POWER';
    const shifted = caesarEncrypt(plain, 3);
    const b64 = base64Encode(shifted);
    const res = autoSolveAll(b64, { maxDepth: 2 });
    const match = res.candidates.find((c) => c.plaintext.includes(plain));
    if (!match) {
      throw new Error('Auto-solver failed to find multi-layer Base64 + Caesar solution');
    }
  });

  return results;
}
