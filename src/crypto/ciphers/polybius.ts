/**
 * Polybius Square Cipher
 * 5x5 coordinate grid cipher invented in ancient Greece by Polybius.
 * Maps letters A-Z (merging I and J) into row-column coordinate pairs (11 to 55).
 */

export function generatePolybiusGrid(keyword: string = ''): string[][] {
  const cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // No J
  const seen = new Set<string>();
  const letters: string[] = [];

  for (const char of cleanKey) {
    if (!seen.has(char) && alphabet.includes(char)) {
      seen.add(char);
      letters.push(char);
    }
  }

  for (const char of alphabet) {
    if (!seen.has(char)) {
      seen.add(char);
      letters.push(char);
    }
  }

  const grid: string[][] = [];
  for (let r = 0; r < 5; r++) {
    grid.push(letters.slice(r * 5, (r + 1) * 5));
  }
  return grid;
}

/**
 * Encrypts plaintext using Polybius Square.
 * Outputs coordinate pairs separated by space (or custom separator).
 */
export function polybiusEncrypt(plaintext: string, keyword: string = '', separator: string = ' '): string {
  const grid = generatePolybiusGrid(keyword);
  const letterMap: Record<string, string> = {};

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const char = grid[r][c];
      const coords = `${r + 1}${c + 1}`;
      letterMap[char] = coords;
      if (char === 'I') {
        letterMap['J'] = coords;
      }
    }
  }

  const tokens: string[] = [];
  for (const ch of plaintext.toUpperCase()) {
    if (letterMap[ch]) {
      tokens.push(letterMap[ch]);
    } else if (ch === ' ') {
      tokens.push('/');
    } else if (/[0-9]/.test(ch)) {
      tokens.push(ch);
    }
  }

  return tokens.join(separator);
}

/**
 * Decrypts Polybius coordinates (e.g., '23 15 31 31 34' or '2315313134') into plaintext.
 */
export function polybiusDecrypt(ciphertext: string, keyword: string = ''): string {
  const grid = generatePolybiusGrid(keyword);
  const cleanDigits = ciphertext.replace(/[^1-5/ ]/g, '');

  let result = '';
  // Check if separated by spaces or slash
  const words = cleanDigits.split('/');

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    const digitsOnly = word.replace(/[^1-5]/g, '');

    for (let i = 0; i < digitsOnly.length - 1; i += 2) {
      const row = parseInt(digitsOnly[i], 10) - 1;
      const col = parseInt(digitsOnly[i + 1], 10) - 1;

      if (row >= 0 && row < 5 && col >= 0 && col < 5) {
        result += grid[row][col];
      }
    }

    if (w < words.length - 1) {
      result += ' ';
    }
  }

  return result.trim();
}
