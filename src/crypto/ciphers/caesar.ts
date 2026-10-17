/**
 * Caesar & ROT Cipher Family
 */

export function caesarEncrypt(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + s) % 26) + base);
  });
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, -shift);
}

export function rot13(text: string): string {
  return caesarEncrypt(text, 13);
}

export function rot5(text: string): string {
  // Shifts digits 0-9 by 5
  return text.replace(/[0-9]/g, (char) => {
    const num = char.charCodeAt(0) - 48;
    return String.fromCharCode(((num + 5) % 10) + 48);
  });
}

export function rot47(text: string): string {
  // Rotates ASCII 33 (!) to 126 (~) by 47
  return text.replace(/[\x21-\x7E]/g, (char) => {
    const code = char.charCodeAt(0);
    return String.fromCharCode(33 + ((code - 33 + 47) % 94));
  });
}

/**
 * Returns all 26 Caesar shift decryptions
 */
export function crackCaesarAllShifts(ciphertext: string): Array<{ shift: number; plaintext: string }> {
  const results: Array<{ shift: number; plaintext: string }> = [];
  for (let shift = 0; shift < 26; shift++) {
    results.push({
      shift,
      plaintext: caesarDecrypt(ciphertext, shift),
    });
  }
  return results;
}
