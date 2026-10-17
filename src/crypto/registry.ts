/**
 * CipherMind AI - Cipher Reference Library Registry
 * Comprehensive educational metadata, historical backgrounds, formulas, and worked examples
 */

import { CipherDefinition } from './types';

export const CIPHER_REGISTRY: CipherDefinition[] = [
  {
    id: 'caesar',
    name: 'Caesar Cipher',
    category: 'substitution',
    shortDescription: 'One of the oldest and simplest monoalphabetic shift substitution ciphers.',
    historicalContext:
      'Attributed to Julius Caesar around 58 BC, who used a shift of 3 to protect military dispatches across the Roman Republic. Suetonius recorded that Caesar replaced A with D, B with E, and so forth.',
    formula: 'E(x) = (x + k) mod 26 \n D(y) = (y - k) mod 26',
    keyRequirements: 'An integer shift value k between 0 and 25 (or a single letter key).',
    limitations:
      'Vulnerable to brute force (only 26 possible shifts). Highly susceptible to single-letter frequency analysis.',
    workedExample: {
      plaintext: 'DEFEND THE EAST WALL',
      key: 'Shift = 3',
      ciphertext: 'GHIHQG WKH HDVW ZDOO',
      explanation: 'Each letter is advanced 3 positions forward in the Latin alphabet: D->G, E->H, F->I, etc.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'rot13',
    name: 'ROT13',
    category: 'substitution',
    shortDescription: 'A special Caesar shift of 13 positions that is its own inverse.',
    historicalContext:
      'Popularized in Usenet newsgroups in the 1980s to obscure spoilers, puzzle answers, and offensive remarks while remaining easily readable by humans upon request.',
    formula: 'E(x) = D(x) = (x + 13) mod 26',
    keyRequirements: 'Fixed shift of 13. No key required.',
    limitations: 'Provides zero cryptographic security. Can be recognized and decoded instantly.',
    workedExample: {
      plaintext: 'HELLO WORLD',
      key: 'None (Fixed 13)',
      ciphertext: 'URYYB JBEYQ',
      explanation: 'Applying ROT13 twice restores the original text (H+13 = U, U+13 = H).',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'atbash',
    name: 'Atbash Cipher',
    category: 'substitution',
    shortDescription: 'A traditional Hebrew monoalphabetic substitution that maps the alphabet to its reverse.',
    historicalContext:
      'Originating in ancient Hebrew scriptures (e.g. Book of Jeremiah, where "Babel" was encoded as "Sheshach"). The name comes from Aleph-Tav-Bet-Shin (first-last-second-second-to-last letters).',
    formula: 'E(x) = D(x) = 25 - x mod 26',
    keyRequirements: 'No key required; the mapping is symmetric and self-reciprocal.',
    limitations: 'Fixed single permutation. Trivial to identify and invert once recognized.',
    workedExample: {
      plaintext: 'SECRET',
      key: 'Self-reciprocal',
      ciphertext: 'HVXIVG',
      explanation: 'S (18) maps to 25-18 = 7 (H); E (4) maps to 25-4 = 21 (V); C (2) maps to 25-2 = 23 (X).',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'affine',
    name: 'Affine Cipher',
    category: 'substitution',
    shortDescription: 'A monoalphabetic substitution combining modular multiplication and addition.',
    historicalContext:
      'Generalization of the Caesar cipher representing the simplest linear transformation over the modular ring Z_26.',
    formula: 'E(x) = (a*x + b) mod 26 \n D(y) = a^(-1) * (y - b) mod 26',
    keyRequirements:
      'Two integers (a, b) where gcd(a, 26) = 1 (12 valid choices for a: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25) and 0 <= b <= 25.',
    limitations:
      'Key space of only 312 keys (12 * 26). Easily broken by brute-force or solving two linear equations from frequency analysis.',
    workedExample: {
      plaintext: 'ATTACK',
      key: 'a = 5, b = 8',
      ciphertext: 'IJJIKQ',
      explanation: 'A (0): (5*0 + 8) mod 26 = 8 (I). T (19): (5*19 + 8) = 103 = 25 mod 26 (Z).',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'vigenere',
    name: 'Vigenère Cipher',
    category: 'polyalphabetic',
    shortDescription: 'The classic "chiffre indéchiffrable" (indecipherable cipher) using a repeating keyword.',
    historicalContext:
      'Originally invented by Giovan Battista Bellaso in 1553, later misattributed to Blaise de Vigenère in the 19th century. Remained unbroken until Friedrich Kasiski published a general attack in 1863.',
    formula: 'C_i = (P_i + K_(i mod m)) mod 26 \n P_i = (C_i - K_(i mod m)) mod 26',
    keyRequirements: 'A secret keyword of letters (e.g. "LEMON").',
    limitations:
      'Vulnerable to Kasiski examination and Index of Coincidence analysis to find key length, then frequency analysis per column.',
    workedExample: {
      plaintext: 'ATTACKATDAWN',
      key: 'LEMON',
      ciphertext: 'LXFOPVEFRNHR',
      explanation: 'Key "LEMON" repeats: L shifts A by 11 -> L; E shifts T by 4 -> X; M shifts T by 12 -> F.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'beaufort',
    name: 'Beaufort Cipher',
    category: 'polyalphabetic',
    shortDescription: 'A reciprocal variant of the Vigenère cipher created by Sir Francis Beaufort.',
    historicalContext:
      'Created by Sir Francis Beaufort (creator of the Beaufort wind scale) in 1857. Differs from Vigenère by subtracting plaintext from the key rather than adding.',
    formula: 'E(x) = D(x) = (K_i - P_i) mod 26',
    keyRequirements: 'A secret keyword of letters.',
    limitations: 'Self-reciprocal operation shares the same structural vulnerabilities as Vigenère to Kasiski analysis.',
    workedExample: {
      plaintext: 'SECRET',
      key: 'KEY',
      ciphertext: 'SMCBIJ',
      explanation: 'For S (18) and K (10): (10 - 18) = -8 = 18 mod 26 (S). Decryption uses identical formula.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'rail_fence',
    name: 'Rail Fence Cipher',
    category: 'transposition',
    shortDescription: 'A zig-zag transposition cipher that reorganizes characters across diagonal rails.',
    historicalContext:
      'Used during the American Civil War by confederate and union forces for tactical telegraph messages. Characters are written in a zig-zag down and up across rails, then read off row by row.',
    formula: 'Geometric zig-zag mapping across N rows.',
    keyRequirements: 'An integer representing the number of rails (depth >= 2).',
    limitations:
      'Preserves original character frequencies exactly (Chi-squared to English remains identical). Trivial to crack by trying rail counts up to text length.',
    workedExample: {
      plaintext: 'WE ARE DISCOVERED FLEE AT ONCE',
      key: 'Rails = 3',
      ciphertext: 'WECRLTEERDSOEEFEAOCAIVDEN',
      explanation: 'Text bounces across 3 rows: Top rail, Middle rail, Bottom rail.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'columnar',
    name: 'Columnar Transposition',
    category: 'transposition',
    shortDescription: 'Arranges plaintext into a matrix and reads columns in alphabetical key order.',
    historicalContext:
      'A workhorse of military field ciphers in WWI and WWII, often combined with substitution as a double transposition cipher.',
    formula: 'Permutation of column indices defined by sorted alphabetical order of the key.',
    keyRequirements: 'A keyword or permutation vector defining the column ordering.',
    limitations:
      'Does not alter character frequencies. Single columnar transposition is vulnerable to anagramming and digram frequency reconstruction.',
    workedExample: {
      plaintext: 'DEFEND THE EAST WALL',
      key: 'ZEBRA',
      ciphertext: 'EHAL FTL DSW EEAT NA',
      explanation: 'Matrix columns are read in order: A(5), B(3), E(2), R(4), Z(1).',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'playfair',
    name: 'Playfair Cipher',
    category: 'matrix',
    shortDescription: 'The first practical digraphic substitution cipher, operating on pairs of letters in a 5x5 grid.',
    historicalContext:
      'Invented in 1854 by Charles Wheatstone, but named after Lord Playfair who promoted its adoption by the British military during the Second Boer War and World War I.',
    formula: 'Digraph geometric rectangle/row/column rules on a 5x5 key matrix (I=J).',
    keyRequirements: 'A keyword used to populate the 5x5 grid.',
    limitations:
      'Significantly harder to break than monoalphabetic ciphers, but vulnerable to digram frequency analysis because reverse digraphs often produce predictable patterns.',
    workedExample: {
      plaintext: 'HIDE THE GOLD',
      key: 'MONARCHY',
      ciphertext: 'BMOD ZBXN HESV',
      explanation: 'Letters are grouped into pairs (HI, DE, TH, EG, OL, DZ) and substituted via grid geometry.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'hill',
    name: 'Hill Cipher',
    category: 'matrix',
    shortDescription: 'Polygraphic substitution cipher based on modular linear algebra and matrix multiplication.',
    historicalContext:
      'Invented in 1929 by mathematician Lester S. Hill. It was the first polygraphic cipher in which it was practical to operate on more than three symbols simultaneously.',
    formula: 'C = K * P mod 26 \n P = K^(-1) * C mod 26',
    keyRequirements: 'An n x n invertible matrix modulo 26 (i.e. gcd(det(K), 26) = 1).',
    limitations:
      'Completely vulnerable to known-plaintext attacks: with n pairs of plaintext-ciphertext vectors, the secret matrix K can be recovered by solving linear systems.',
    workedExample: {
      plaintext: 'ACT',
      key: '2x2 Matrix [3, 3; 2, 5]',
      ciphertext: 'POH',
      explanation: 'Vector [0, 2] is multiplied by [[3,3],[2,5]] mod 26 to produce ciphertext digraphs.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'bacon',
    name: "Bacon's Cipher",
    category: 'substitution',
    shortDescription: 'A steganographic binary substitution method using 5-character combinations of two states.',
    historicalContext:
      'Developed by Sir Francis Bacon in 1605. Bacon designed it so that the two states (A and B) could be hidden in arbitrary typeface styles, capitalization, or formatting.',
    formula: 'Each letter is mapped to a 5-bit binary sequence of A and B.',
    keyRequirements: 'Choice of 24-letter (I=J, U=V) or modern 26-letter alphabet.',
    limitations: 'Ciphertext is 5 times longer than plaintext. Highly distinctive 5-unit binary structure.',
    workedExample: {
      plaintext: 'STRIKE',
      key: '26-Letter Bacon',
      ciphertext: 'BAABA BAABB BAAAB ABAAA ABABA AABAA',
      explanation: 'S->BAABA, T->BAABB, R->BAAAB, I->ABAAA, K->ABABA, E->AABAA.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'xor',
    name: 'XOR Cipher',
    category: 'modern_demonstration',
    shortDescription: 'Bitwise exclusive-OR transformation, the fundamental building block of modern symmetric ciphers.',
    historicalContext:
      'Proposed by Gilbert Vernam in 1917. When used with a truly random, single-use key of equal length to the plaintext, it becomes the One-Time Pad (OTP), the only mathematically unbreakable cipher proved by Claude Shannon.',
    formula: 'C_i = P_i XOR K_i \n P_i = C_i XOR K_i',
    keyRequirements: 'A single byte (for brute-force) or arbitrary byte string key.',
    limitations:
      'Single-byte XOR is easily broken in milliseconds by frequency analysis. Repeating keys are vulnerable to Kasiski/IoC analysis.',
    workedExample: {
      plaintext: 'CRYPTO',
      key: 'Byte 0x42',
      ciphertext: '01 10 1b 12 16 2d (hex)',
      explanation: 'Each ASCII byte is XORed with 0x42 (e.g. "C" (0x43) XOR 0x42 = 0x01).',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'base64',
    name: 'Base64 Representation',
    category: 'encoding',
    shortDescription: 'Binary-to-text encoding scheme that represents binary data in an ASCII string format.',
    historicalContext:
      'Developed for MIME email transfer (RFC 2045) to transmit arbitrary binary data safely through 7-bit ASCII transmission channels without corruption.',
    formula: 'Groups of 3 bytes (24 bits) are split into 4 6-bit index values into the 64-character table.',
    keyRequirements: 'Standard 64-character alphabet (A-Z, a-z, 0-9, +, /) with = padding.',
    limitations:
      'Base64 is an ENCODING, NOT ENCRYPTION. It provides zero confidentiality and can be decoded by anyone without a key.',
    workedExample: {
      plaintext: 'Attack at dawn',
      key: 'None (RFC 4648 standard)',
      ciphertext: 'QXR0YWNrIGF0IGRhd24=',
      explanation: 'Each 3-byte block is encoded into 4 printable ASCII characters with = padding.',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'hexadecimal',
    name: 'Hexadecimal Representation (Base16)',
    category: 'encoding',
    shortDescription: 'Base-16 positional numeral system representing bytes as pairs of nibbles (0-9, A-F).',
    historicalContext:
      'Adopted widely in modern computer architecture (introduced with IBM System/360 in 1964) as a human-friendly representation of binary data.',
    formula: 'Byte value (0-255) represented as two base-16 digits: High nibble * 16 + Low nibble.',
    keyRequirements: 'None. Radix 16.',
    limitations: 'Encoding format only. Provides no security or confidentiality.',
    workedExample: {
      plaintext: 'HELLO',
      key: 'None',
      ciphertext: '48 65 6c 6c 6f',
      explanation: 'H (72 = 0x48), E (101 = 0x65), L (108 = 0x6c), L (108 = 0x6c), O (111 = 0x6f).',
    },
    supportedInAutoSolver: true,
  },
  {
    id: 'morse',
    name: 'International Morse Code',
    category: 'encoding',
    shortDescription: 'Telecommunication encoding method utilizing sequences of short and long signals (dots and dashes).',
    historicalContext:
      'Developed in the 1830s and 1840s by Samuel Morse and Alfred Vail for the electric telegraph. Standardized internationally in 1865.',
    formula: 'Standardized lookups of dits (.) and dahs (-).',
    keyRequirements: 'None. International ITU Morse standard.',
    limitations: 'Communication protocol, not encryption. Transmitted in the clear.',
    workedExample: {
      plaintext: 'SOS',
      key: 'None',
      ciphertext: '... --- ...',
      explanation: 'S is encoded as three short pulses (...), O is encoded as three long pulses (---).',
    },
    supportedInAutoSolver: true,
  },
];
