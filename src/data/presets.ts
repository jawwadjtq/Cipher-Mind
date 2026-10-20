/**
 * CipherMind AI - Educational Demo Presets & Sample Ciphertexts
 * All examples feature peaceful, educational, historical, and mathematical themes.
 */

export interface DemoPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  expectedPlaintext: string;
  ciphertext: string;
  expectedCipher: string;
  tags: string[];
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'caesar_shift_3',
    name: 'Caesar Cipher (Shift 3)',
    category: 'Substitution',
    description: 'Classical Roman military shift used by Julius Caesar for administrative correspondence.',
    expectedPlaintext: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
    ciphertext: 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ',
    expectedCipher: 'Caesar Cipher (Shift 3)',
    tags: ['Caesar', 'Monoalphabetic', 'Shift'],
  },
  {
    id: 'rot13_curiosity',
    name: 'ROT13 Internet Classic',
    category: 'Substitution',
    description: 'The symmetric shift of 13 widely used in early computer forums to obscure puzzle spoilers.',
    expectedPlaintext: 'CURIOSITY AND MATHEMATICS UNLOCK THE SECRETS OF THE UNIVERSE',
    ciphertext: 'PHEVBFVGL NAQ ZNGURZNGVPF HAYBPX GUR FRPERGF BS GUR HAVIREFR',
    expectedCipher: 'ROT13',
    tags: ['ROT13', 'Symmetric', 'Usenet'],
  },
  {
    id: 'atbash_wisdom',
    name: 'Ancient Atbash Transmutation',
    category: 'Substitution',
    description: 'Hebrew Biblical monoalphabetic substitution reversing the standard alphabet order.',
    expectedPlaintext: 'KNOWLEDGE IS THE FOUNDATION OF ALL LIBERTY AND PROGRESS',
    ciphertext: 'PMLDOVWTV RH GSV ULFMWZGRLM LU ZOO ORYVIGB ZMW KILTIVHH',
    expectedCipher: 'Atbash Cipher',
    tags: ['Atbash', 'Biblical', 'Mirror'],
  },
  {
    id: 'affine_coordinates',
    name: 'Affine Linear Transformation',
    category: 'Substitution',
    description: 'Modular arithmetic transformation E(x) = (5x + 8) mod 26 combining scaling and shifting.',
    expectedPlaintext: 'MEET AT THE ASTRONOMICAL OBSERVATORY AT DUSK',
    ciphertext: 'CIIV EI VRI EMVTMZMCKME MHEITNIVMTQ EI LUEO',
    expectedCipher: 'Affine Cipher (a=5, b=8)',
    tags: ['Affine', 'Modular Arithmetic', 'Algebra'],
  },
  {
    id: 'vigenere_lemon',
    name: 'Vigenère Polyalphabetic Cipher',
    category: 'Polyalphabetic',
    description: 'Renaissance polyalphabetic cipher encrypted using the classical keyword "LEMON".',
    expectedPlaintext: 'DISCOVER THE HIDDEN SECRETS OF CLASSICAL SCHOLARSHIP',
    ciphertext: 'OIAGSZPI ETL TWRORZ DICVIPD ZQ TWSDEWVEW DNTWZODTDTI',
    expectedCipher: 'Vigenère Cipher (Key: "LEMON")',
    tags: ['Vigenere', 'Polyalphabetic', 'Keyword'],
  },
  {
    id: 'rail_fence_3',
    name: 'Rail Fence Zig-Zag Transposition',
    category: 'Transposition',
    description: 'Geometrical zig-zag pattern written across 3 diagonal rails.',
    expectedPlaintext: 'DEFEND THE ANCIENT ARCHIVES AND HISTORICAL SCROLLS',
    ciphertext: 'DNNEIEISCLFEDHACNTACVSDITRLLSATTHHRHO',
    expectedCipher: 'Rail Fence (3 Rails)',
    tags: ['Rail Fence', 'Transposition', 'Geometry'],
  },
  {
    id: 'base64_caesar_chain',
    name: 'Multi-Layer: Base64 → Caesar Shift 7',
    category: 'Multi-layer',
    description: 'Two-stage nested encoding: plaintext is shifted by 7, then packed into Base64 format.',
    expectedPlaintext: 'THE EXPEDITION REACHED THE MOUNTAIN SUMMIT SAFELY',
    ciphertext: 'QU9MIEVYV0tLSUJVT1AgWVhIQ09MRyBNT0FVT1ZVTlAgWkFUTVBMIFpITU1T',
    expectedCipher: 'Base64 Decode ➔ Caesar (Shift 7)',
    tags: ['Multi-layer', 'Base64', 'Caesar', 'Pipeline'],
  },
  {
    id: 'hex_rot13_chain',
    name: 'Multi-Layer: Hexadecimal → ROT13',
    category: 'Multi-layer',
    description: 'Plaintext rotated via ROT13 and represented as hexadecimal byte pairs.',
    expectedPlaintext: 'PHILOSOPHY BEGINS IN WONDER AND INQUIRY',
    ciphertext: '43 55 56 59 42 46 42 43 55 59 20 4f 52 54 56 41 46 20 56 41 20 4a 42 41 51 52 45 20 4e 41 51 20 56 41 44 55 56 45 59',
    expectedCipher: 'Hexadecimal Decode ➔ ROT13',
    tags: ['Multi-layer', 'Hex', 'ROT13'],
  },
  {
    id: 'international_morse',
    name: 'International Morse Code',
    category: 'Encoding',
    description: 'Telegraphic standard dits and dahs separated by spaces and slashes.',
    expectedPlaintext: 'WELCOME TO CIPHERMIND AI WORKBENCH',
    ciphertext: '.-- . .-.. -.-. --- -- . / - --- / -.-. .. .--. .... . .-. -- .. -. -.. / .- .. / .-- --- .-. -.- -... . -. -.-. ....',
    expectedCipher: 'Morse Code Decode',
    tags: ['Morse Code', 'Telegraph', 'Encoding'],
  },
  {
    id: 'bacon_steganography',
    name: "Bacon's 5-Bit Steganographic Binary",
    category: 'Substitution',
    description: 'Francis Bacon binary substitution where each letter is represented by 5 A/B tokens.',
    expectedPlaintext: 'EXPLORE KNOWLEDGE',
    ciphertext: 'AABAA BABBA ABBBB ABABA BAAAB AABAA / ABAAA ABBBA BABBA BABAA ABABA AABAA AAABB AABBA AABAA',
    expectedCipher: "Bacon's Cipher (26-Letter)",
    tags: ['Bacon', 'Binary', 'Steganography'],
  },
  {
    id: 'monoalphabetic_zebra',
    name: 'Monoalphabetic Substitution (Key: ZEBRAS)',
    category: 'Substitution',
    description: 'Classical monoalphabetic mapping generated from the historical keyword ZEBRAS.',
    expectedPlaintext: 'DISCOVER THE ANCIENT SECRETS',
    ciphertext: 'RFPBLUAO QDA ZKBFAKQ PABOAQP',
    expectedCipher: 'Monoalphabetic Substitution (Key: ZEBRAS)',
    tags: ['Monoalphabetic', 'Keyed Alphabet', 'Substitution'],
  },
  {
    id: 'polybius_square_grid',
    name: 'Polybius Square 5x5 Coordinate Pairs',
    category: 'Substitution',
    description: 'Ancient Greek optical coordinate cipher mapping letters to 5x5 matrix row and column pairs.',
    expectedPlaintext: 'DISCOVER THE ANCIENT SECRETS',
    ciphertext: '22 34 45 25 15 53 12 21 / 51 33 12 / 23 42 25 34 12 42 51 / 45 12 25 21 12 51 45',
    expectedCipher: 'Polybius Square (5x5)',
    tags: ['Polybius', 'Coordinates', 'Classical Grid'],
  },
];
