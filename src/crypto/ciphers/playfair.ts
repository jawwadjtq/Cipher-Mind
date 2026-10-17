/**
 * Playfair Cipher (5x5 digraph substitution)
 * Replaces 'J' with 'I' in standard Playfair table.
 */

export interface PlayfairKeyMatrix {
  matrix: string[][];
  positions: Record<string, { row: number; col: number }>;
}

export function generatePlayfairMatrix(rawKey: string): PlayfairKeyMatrix {
  const cleanKey = (rawKey + 'ABCDEFGHIKLMNOPQRSTUVWXYZ')
    .toUpperCase()
    .replace(/J/g, 'I')
    .replace(/[^A-Z]/g, '');

  const seen = new Set<string>();
  const letters: string[] = [];

  for (const ch of cleanKey) {
    if (!seen.has(ch)) {
      seen.add(ch);
      letters.push(ch);
    }
    if (letters.length === 25) break;
  }

  const matrix: string[][] = [];
  const positions: Record<string, { row: number; col: number }> = {};

  for (let r = 0; r < 5; r++) {
    matrix[r] = [];
    for (let c = 0; c < 5; c++) {
      const char = letters[r * 5 + c];
      matrix[r][c] = char;
      positions[char] = { row: r, col: c };
    }
  }

  return { matrix, positions };
}

export function playfairEncrypt(plaintext: string, rawKey: string): string {
  const { matrix, positions } = generatePlayfairMatrix(rawKey);
  const clean = plaintext.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');

  // Form digraphs
  const digraphs: Array<[string, string]> = [];
  let i = 0;
  while (i < clean.length) {
    const a = clean[i];
    if (i + 1 >= clean.length) {
      digraphs.push([a, a === 'X' ? 'Z' : 'X']);
      i++;
    } else {
      const b = clean[i + 1];
      if (a === b) {
        digraphs.push([a, a === 'X' ? 'Q' : 'X']);
        i++;
      } else {
        digraphs.push([a, b]);
        i += 2;
      }
    }
  }

  let ciphertext = '';
  for (const [a, b] of digraphs) {
    const posA = positions[a];
    const posB = positions[b];

    if (!posA || !posB) continue;

    if (posA.row === posB.row) {
      // Same row: shift right
      ciphertext += matrix[posA.row][(posA.col + 1) % 5];
      ciphertext += matrix[posB.row][(posB.col + 1) % 5];
    } else if (posA.col === posB.col) {
      // Same column: shift down
      ciphertext += matrix[(posA.row + 1) % 5][posA.col];
      ciphertext += matrix[(posB.row + 1) % 5][posB.col];
    } else {
      // Rectangle: swap columns
      ciphertext += matrix[posA.row][posB.col];
      ciphertext += matrix[posB.row][posA.col];
    }
  }

  return ciphertext;
}

export function playfairDecrypt(ciphertext: string, rawKey: string): string {
  const { matrix, positions } = generatePlayfairMatrix(rawKey);
  const clean = ciphertext.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');

  if (clean.length % 2 !== 0) {
    throw new Error('Playfair ciphertext must contain an even number of letters.');
  }

  let plaintext = '';
  for (let i = 0; i < clean.length; i += 2) {
    const a = clean[i];
    const b = clean[i + 1];
    const posA = positions[a];
    const posB = positions[b];

    if (!posA || !posB) continue;

    if (posA.row === posB.row) {
      // Same row: shift left
      plaintext += matrix[posA.row][(posA.col - 1 + 5) % 5];
      plaintext += matrix[posB.row][(posB.col - 1 + 5) % 5];
    } else if (posA.col === posB.col) {
      // Same column: shift up
      plaintext += matrix[(posA.row - 1 + 5) % 5][posA.col];
      plaintext += matrix[(posB.row - 1 + 5) % 5][posB.col];
    } else {
      // Rectangle: swap columns
      plaintext += matrix[posA.row][posB.col];
      plaintext += matrix[posB.row][posA.col];
    }
  }

  return plaintext;
}
