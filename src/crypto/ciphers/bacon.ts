/**
 * Bacon's Cipher (Baconian steganographic substitution)
 * Supports both 24-letter (I=J, U=V) and modern 26-letter alphabet modes.
 */

const BACON_26: Record<string, string> = {
  A: 'AAAAA', B: 'AAAAB', C: 'AAABA', D: 'AAABB', E: 'AABAA',
  F: 'AABAB', G: 'AABBA', H: 'AABBB', I: 'ABAAA', J: 'ABAAB',
  K: 'ABABA', L: 'ABABB', M: 'ABBAA', N: 'ABBAB', O: 'ABBBA',
  P: 'ABBBB', Q: 'BAAAA', R: 'BAAAB', S: 'BAABA', T: 'BAABB',
  U: 'BABAA', V: 'BABAB', W: 'BABBA', X: 'BABBB', Y: 'BBAAA',
  Z: 'BBAAB',
};

const BACON_24: Record<string, string> = {
  A: 'AAAAA', B: 'AAAAB', C: 'AAABA', D: 'AAABB', E: 'AABAA',
  F: 'AABAB', G: 'AABBA', H: 'AABBB',
  I: 'ABAAA', J: 'ABAAA', // I and J share ABAAA
  K: 'ABAAB', L: 'ABABA', M: 'ABABB', N: 'ABBAA', O: 'ABBBA',
  P: 'ABBBB', Q: 'BAAAA', R: 'BAAAB', S: 'BAABA', T: 'BAABB',
  U: 'BABAA', V: 'BABAA', // U and V share BABAA
  W: 'BABAB', X: 'BABBA', Y: 'BABBB', Z: 'BBAAA',
};

// Inverted lookup tables
const REV_BACON_26: Record<string, string> = Object.fromEntries(
  Object.entries(BACON_26).map(([k, v]) => [v, k])
);
const REV_BACON_24: Record<string, string> = Object.fromEntries(
  Object.entries(BACON_24).map(([k, v]) => [v, k])
);

export function baconEncrypt(text: string, mode: '26' | '24' = '26'): string {
  const table = mode === '24' ? BACON_24 : BACON_26;
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const chunks: string[] = [];

  for (const ch of clean) {
    if (table[ch]) {
      chunks.push(table[ch]);
    }
  }

  return chunks.join(' ');
}

export function baconDecrypt(ciphertext: string, mode: '26' | '24' = '26'): string {
  const revTable = mode === '24' ? REV_BACON_24 : REV_BACON_26;
  // Normalize: allow 'A'/'B', '0'/'1', or case-based
  let binaryString = '';

  // Check if text is mostly composed of A and B (or 0 and 1)
  const stripped = ciphertext.replace(/[^a-zA-Z0-9]/g, '');
  const isExplicitAB = /^[ABab01\s]+$/.test(ciphertext.trim());

  if (isExplicitAB) {
    binaryString = stripped
      .toUpperCase()
      .replace(/0/g, 'A')
      .replace(/1/g, 'B');
  } else {
    // Steganographic case-based: uppercase = A, lowercase = B
    binaryString = ciphertext
      .replace(/[^a-zA-Z]/g, '')
      .split('')
      .map((ch) => (ch >= 'A' && ch <= 'Z' ? 'A' : 'B'))
      .join('');
  }

  let result = '';
  for (let i = 0; i <= binaryString.length - 5; i += 5) {
    const chunk = binaryString.slice(i, i + 5);
    const decoded = revTable[chunk] || '?';
    result += decoded;
  }

  return result;
}

export function isLikelyBacon(text: string): boolean {
  const clean = text.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length < 5) return false;
  const abCount = (clean.match(/[abAB01]/g) || []).length;
  return abCount / clean.length > 0.85 && clean.length % 5 === 0;
}
