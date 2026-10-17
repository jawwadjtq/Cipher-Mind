/**
 * International Morse Code Encoder & Decoder
 */

export const MORSE_TABLE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', ' ': '/'
};

export const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_TABLE).map(([k, v]) => [v, k])
);

export function morseEncode(text: string): string {
  const upper = text.toUpperCase();
  const tokens: string[] = [];

  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    if (ch === ' ') {
      tokens.push('/');
    } else if (MORSE_TABLE[ch]) {
      tokens.push(MORSE_TABLE[ch]);
    }
  }

  return tokens.join(' ');
}

export function morseDecode(morseCode: string): string {
  // Normalize whitespace: replace slashes or double spaces with ' / '
  const normalized = morseCode
    .trim()
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s{2,}/g, ' / ');

  const tokens = normalized.split(/\s+/);
  let result = '';

  for (const token of tokens) {
    if (token === '/' || token === '|') {
      result += ' ';
    } else if (REVERSE_MORSE[token]) {
      result += REVERSE_MORSE[token];
    } else {
      result += '?';
    }
  }

  return result.replace(/\s+/g, ' ').trim();
}

export function isLikelyMorse(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  // Contains only dots, dashes, spaces, slashes
  const validMorseChars = (trimmed.match(/[.\-_/|\s]/g) || []).length;
  return validMorseChars / trimmed.length > 0.9 && /[.-]/.test(trimmed);
}
