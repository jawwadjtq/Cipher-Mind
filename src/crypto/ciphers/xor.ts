/**
 * XOR Cipher (Bitwise exclusive OR)
 */

export function xorSingleByte(text: string, keyByte: number): string {
  const byte = keyByte & 0xff;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    result += String.fromCharCode(code ^ byte);
  }
  return result;
}

export function xorRepeatingKey(text: string, key: string): string {
  if (!key) return text;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyCode = key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode ^ keyCode);
  }
  return result;
}

/**
 * Converts text into hex representation of XOR
 */
export function xorEncryptToHex(text: string, key: string): string {
  const xored = xorRepeatingKey(text, key);
  let hex = '';
  for (let i = 0; i < xored.length; i++) {
    hex += xored.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Single-byte XOR brute force across printable ASCII range (1 to 255)
 */
export function crackSingleByteXor(text: string): Array<{ key: number; plaintext: string }> {
  const results: Array<{ key: number; plaintext: string }> = [];
  // Focus on keys that produce mostly printable ASCII characters
  for (let k = 1; k < 256; k++) {
    const decoded = xorSingleByte(text, k);
    let printableCount = 0;
    for (let i = 0; i < decoded.length; i++) {
      const code = decoded.charCodeAt(i);
      if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
        printableCount++;
      }
    }
    // Only keep if >= 80% printable characters
    if (printableCount / decoded.length >= 0.8) {
      results.push({ key: k, plaintext: decoded });
    }
  }
  return results;
}
