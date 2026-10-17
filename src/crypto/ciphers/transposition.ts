/**
 * Transposition Ciphers: Rail Fence, Columnar Transposition, and Text Reversal
 */

/**
 * Rail Fence (Zig-Zag) Cipher
 */
export function railFenceEncrypt(text: string, rails: number): string {
  if (rails <= 1 || text.length <= rails) return text;

  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < text.length; i++) {
    fence[rail].push(text[i]);
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return fence.map((r) => r.join('')).join('');
}

export function railFenceDecrypt(ciphertext: string, rails: number): string {
  if (rails <= 1 || ciphertext.length <= rails) return ciphertext;

  const n = ciphertext.length;
  // Mark the zigzag pattern with true/false
  const pattern: boolean[][] = Array.from({ length: rails }, () => Array(n).fill(false));
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < n; i++) {
    pattern[rail][i] = true;
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  // Fill in the characters along the rows
  const fence: string[][] = Array.from({ length: rails }, () => Array(n).fill(''));
  let index = 0;
  for (let r = 0; r < rails; r++) {
    for (let c = 0; c < n; c++) {
      if (pattern[r][c] && index < n) {
        fence[r][c] = ciphertext[index++];
      }
    }
  }

  // Read out following the zigzag
  let result = '';
  rail = 0;
  direction = 1;
  for (let i = 0; i < n; i++) {
    result += fence[rail][i];
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return result;
}

/**
 * Columnar Transposition Cipher
 */
export function columnarEncrypt(plaintext: string, rawKey: string): string {
  const key = rawKey.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!key) throw new Error('Columnar key must contain characters.');

  const cols = key.length;
  const rows = Math.ceil(plaintext.length / cols);
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(' '));

  for (let i = 0; i < plaintext.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    grid[r][c] = plaintext[i];
  }

  // Order columns based on alphabetical order of key characters
  const keyOrder = key
    .split('')
    .map((char, index) => ({ char, index }))
    .sort((a, b) => a.char.localeCompare(b.char));

  let ciphertext = '';
  for (const item of keyOrder) {
    const colIndex = item.index;
    for (let r = 0; r < rows; r++) {
      ciphertext += grid[r][colIndex];
    }
  }

  return ciphertext;
}

export function columnarDecrypt(ciphertext: string, rawKey: string): string {
  const key = rawKey.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!key) throw new Error('Columnar key must contain characters.');

  const cols = key.length;
  const rows = Math.ceil(ciphertext.length / cols);
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(' '));

  const keyOrder = key
    .split('')
    .map((char, index) => ({ char, index }))
    .sort((a, b) => a.char.localeCompare(b.char));

  let index = 0;
  for (const item of keyOrder) {
    const colIndex = item.index;
    for (let r = 0; r < rows; r++) {
      if (index < ciphertext.length) {
        grid[r][colIndex] = ciphertext[index++];
      }
    }
  }

  let plaintext = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      plaintext += grid[r][c];
    }
  }

  return plaintext.trimEnd();
}

/**
 * Text Reversal
 */
export function reverseText(text: string): string {
  return text.split('').reverse().join('');
}

export function reverseWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.split('').reverse().join(''))
    .join(' ');
}
