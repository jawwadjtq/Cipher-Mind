/**
 * CipherMind AI - Encryption Workspace
 * Deterministic encryption with dynamic parameter controls, key generation, and reversibility tests
 */

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Dices,
  Copy,
  Check,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { caesarEncrypt, rot13, rot47, caesarDecrypt } from '../crypto/ciphers/caesar';
import { atbash } from '../crypto/ciphers/atbash';
import {
  monoalphabeticEncrypt,
  monoalphabeticDecrypt,
  generateRandomSubstitutionAlphabet,
  normalizeSubstitutionKey,
  STANDARD_ALPHABET,
} from '../crypto/ciphers/monoalphabetic';
import {
  polybiusEncrypt,
  polybiusDecrypt,
  generatePolybiusGrid,
} from '../crypto/ciphers/polybius';
import { affineEncrypt, affineDecrypt, AFFINE_VALID_A, gcd } from '../crypto/ciphers/affine';
import {
  vigenereEncrypt,
  vigenereDecrypt,
  beaufortCipher,
  autokeyEncrypt,
  autokeyDecrypt,
} from '../crypto/ciphers/vigenere';
import {
  railFenceEncrypt,
  railFenceDecrypt,
  columnarEncrypt,
  columnarDecrypt,
  reverseText,
} from '../crypto/ciphers/transposition';
import { playfairEncrypt, playfairDecrypt } from '../crypto/ciphers/playfair';
import {
  hillEncrypt2x2,
  hillDecrypt2x2,
  calculateDeterminant2x2,
  isInvertibleHill2x2,
  HillMatrix2x2,
} from '../crypto/ciphers/hill';
import { baconEncrypt, baconDecrypt } from '../crypto/ciphers/bacon';
import { xorSingleByte, xorEncryptToHex } from '../crypto/ciphers/xor';
import { morseEncode, morseDecode } from '../crypto/ciphers/morse';
import {
  base64Encode,
  base64Decode,
  hexEncode,
  hexDecode,
  binaryEncode,
  binaryDecode,
} from '../crypto/ciphers/encodings';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

interface EncryptViewProps {
  onSendToSolver: (ciphertext: string) => void;
  initialCipher?: string;
  userLanguage?: SupportedLanguage;
}

export const EncryptView: React.FC<EncryptViewProps> = ({
  onSendToSolver,
  initialCipher = 'caesar',
  userLanguage = 'en',
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;
  const [plaintext, setPlaintext] = useState('KNOWLEDGE AND WISDOM ARE THE NOBLEST PURSUITS');
  const [selectedCipher, setSelectedCipher] = useState(initialCipher);

  // Dynamic parameters
  const [caesarShift, setCaesarShift] = useState<number>(3);
  const [affineA, setAffineA] = useState<number>(5);
  const [affineB, setAffineB] = useState<number>(8);
  const [keyWord, setKeyWord] = useState<string>('LEMON');
  const [railCount, setRailCount] = useState<number>(3);
  const [hillMatrix, setHillMatrix] = useState<HillMatrix2x2>({ a: 3, b: 3, c: 2, d: 5 });
  const [baconMode, setBaconMode] = useState<'26' | '24'>('26');
  const [xorByte, setXorByte] = useState<number>(66); // 0x42

  const [substitutionKey, setSubstitutionKey] = useState<string>('ZEBRAS');
  const [polybiusKey, setPolybiusKey] = useState<string>('');
  const [polybiusSeparator, setPolybiusSeparator] = useState<string>(' ');

  const [ciphertext, setCiphertext] = useState<string>('');
  const [reversedPlaintext, setReversedPlaintext] = useState<string>('');
  const [isReversible, setIsReversible] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Random educational key generator
  const handleGenerateRandomKey = () => {
    switch (selectedCipher) {
      case 'caesar':
        setCaesarShift(Math.floor(Math.random() * 25) + 1);
        break;
      case 'monoalphabetic':
        setSubstitutionKey(generateRandomSubstitutionAlphabet());
        break;
      case 'polybius':
        const polyWords = ['', 'CIPHER', 'MATRIX', 'SECRET', 'KNOWLEDGE'];
        setPolybiusKey(polyWords[Math.floor(Math.random() * polyWords.length)]);
        break;
      case 'affine':
        const randomA = AFFINE_VALID_A[Math.floor(Math.random() * AFFINE_VALID_A.length)];
        const randomB = Math.floor(Math.random() * 26);
        setAffineA(randomA);
        setAffineB(randomB);
        break;
      case 'vigenere':
      case 'beaufort':
      case 'autokey':
      case 'playfair':
      case 'columnar':
        const words = ['ORBIT', 'ZENITH', 'CRYPTO', 'PRISM', 'CIPHER', 'MATRIX', 'HARBOR', 'COSMOS'];
        setKeyWord(words[Math.floor(Math.random() * words.length)]);
        break;
      case 'rail_fence':
        setRailCount(Math.floor(Math.random() * 4) + 2); // 2 to 5
        break;
      case 'hill':
        const validMatrices: HillMatrix2x2[] = [
          { a: 3, b: 3, c: 2, d: 5 },
          { a: 5, b: 8, c: 17, d: 3 },
          { a: 2, b: 3, c: 1, d: 4 },
          { a: 7, b: 8, c: 11, d: 11 },
        ];
        setHillMatrix(validMatrices[Math.floor(Math.random() * validMatrices.length)]);
        break;
      case 'xor':
        setXorByte(Math.floor(Math.random() * 200) + 20);
        break;
    }
  };

  // Perform Encryption and Reversibility Verification
  useEffect(() => {
    setErrorMessage(null);
    if (!plaintext) {
      setCiphertext('');
      setReversedPlaintext('');
      return;
    }

    try {
      let enc = '';
      let dec = '';

      switch (selectedCipher) {
        case 'caesar':
          enc = caesarEncrypt(plaintext, caesarShift);
          dec = caesarDecrypt(enc, caesarShift);
          break;
        case 'rot13':
          enc = rot13(plaintext);
          dec = rot13(enc);
          break;
        case 'rot47':
          enc = rot47(plaintext);
          dec = rot47(enc);
          break;
        case 'atbash':
          enc = atbash(plaintext);
          dec = atbash(enc);
          break;
        case 'affine':
          enc = affineEncrypt(plaintext, affineA, affineB);
          dec = affineDecrypt(enc, affineA, affineB);
          break;
        case 'vigenere':
          enc = vigenereEncrypt(plaintext, keyWord);
          dec = vigenereDecrypt(enc, keyWord);
          break;
        case 'beaufort':
          enc = beaufortCipher(plaintext, keyWord);
          dec = beaufortCipher(enc, keyWord);
          break;
        case 'autokey':
          enc = autokeyEncrypt(plaintext, keyWord);
          dec = autokeyDecrypt(enc, keyWord);
          break;
        case 'rail_fence':
          enc = railFenceEncrypt(plaintext, railCount);
          dec = railFenceDecrypt(enc, railCount);
          break;
        case 'monoalphabetic':
          enc = monoalphabeticEncrypt(plaintext, substitutionKey);
          dec = monoalphabeticDecrypt(enc, substitutionKey);
          break;
        case 'polybius':
          enc = polybiusEncrypt(plaintext, polybiusKey, polybiusSeparator);
          dec = polybiusDecrypt(enc, polybiusKey);
          break;
        case 'columnar':
          enc = columnarEncrypt(plaintext, keyWord);
          dec = columnarDecrypt(enc, keyWord);
          break;
        case 'playfair':
          enc = playfairEncrypt(plaintext, keyWord);
          dec = playfairDecrypt(enc, keyWord);
          break;
        case 'hill':
          enc = hillEncrypt2x2(plaintext, hillMatrix);
          dec = hillDecrypt2x2(enc, hillMatrix);
          break;
        case 'bacon':
          enc = baconEncrypt(plaintext, baconMode);
          dec = baconDecrypt(enc, baconMode);
          break;
        case 'xor':
          enc = xorEncryptToHex(plaintext, String.fromCharCode(xorByte));
          dec = plaintext;
          break;
        case 'morse':
          enc = morseEncode(plaintext);
          dec = morseDecode(enc);
          break;
        case 'base64':
          enc = base64Encode(plaintext);
          dec = base64Decode(enc);
          break;
        case 'hex':
          enc = hexEncode(plaintext);
          dec = hexDecode(enc);
          break;
        case 'binary':
          enc = binaryEncode(plaintext);
          dec = binaryDecode(enc);
          break;
        case 'reverse':
          enc = reverseText(plaintext);
          dec = reverseText(enc);
          break;
        default:
          enc = caesarEncrypt(plaintext, 3);
          dec = caesarDecrypt(enc, 3);
      }

      setCiphertext(enc);
      setReversedPlaintext(dec);

      // Verify clean reversibility (ignoring casing or J->I in Playfair)
      const cleanOriginal = plaintext.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
      const cleanReversed = dec.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
      setIsReversible(cleanReversed.startsWith(cleanOriginal) || dec === plaintext);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Encryption failed with specified parameters.');
      setCiphertext('');
      setReversedPlaintext('');
    }
  }, [
    plaintext,
    selectedCipher,
    caesarShift,
    affineA,
    affineB,
    keyWord,
    railCount,
    hillMatrix,
    baconMode,
    xorByte,
    substitutionKey,
    polybiusKey,
    polybiusSeparator,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ciphertext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([ciphertext], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciphertext-${selectedCipher}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-6 border-b border-slate-800/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          {t.encryptTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.encryptSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================
            LEFT COLUMN: Inputs & Cipher Configuration
            ========================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
            {/* Algorithm Selector */}
            <div className="mb-4">
              <label htmlFor="algorithm-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {t.targetAlgorithm}
              </label>
              <select
                id="algorithm-select"
                value={selectedCipher}
                onChange={(e) => setSelectedCipher(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-medium text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <optgroup label="Classical Substitution">
                  <option value="caesar">Caesar Cipher (Shift 0-25)</option>
                  <option value="monoalphabetic">Monoalphabetic Substitution (Keyed / Full Alphabet)</option>
                  <option value="polybius">Polybius Square (5x5 Coordinate Grid)</option>
                  <option value="rot13">ROT13 (Symmetric 13)</option>
                  <option value="rot47">ROT47 (ASCII 33-126)</option>
                  <option value="atbash">Atbash (Hebrew Mirror)</option>
                  <option value="affine">Affine Cipher (ax + b mod 26)</option>
                  <option value="bacon">Bacon's Cipher (5-Bit Binary)</option>
                </optgroup>
                <optgroup label="Polyalphabetic Ciphers">
                  <option value="vigenere">Vigenère Cipher (Keyword)</option>
                  <option value="beaufort">Beaufort Cipher (K - P mod 26)</option>
                  <option value="autokey">Autokey Cipher (Plaintext Extension)</option>
                </optgroup>
                <optgroup label="Transposition">
                  <option value="rail_fence">Rail Fence (Zig-Zag Rails)</option>
                  <option value="columnar">Columnar Transposition</option>
                  <option value="reverse">Reverse Text</option>
                </optgroup>
                <optgroup label="Matrix & Digraph">
                  <option value="playfair">Playfair Cipher (5x5 Grid)</option>
                  <option value="hill">Hill Cipher (2x2 Matrix)</option>
                </optgroup>
                <optgroup label="Encodings & Modern">
                  <option value="base64">Base64 Representation</option>
                  <option value="hex">Hexadecimal (Base16)</option>
                  <option value="binary">Binary (8-Bit Stream)</option>
                  <option value="morse">International Morse Code</option>
                  <option value="xor">XOR (Bitwise Exclusive-OR)</option>
                </optgroup>
              </select>
            </div>

            {/* Plaintext Input */}
            <div className="mb-4">
              <label htmlFor="plaintext-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {t.plaintextMessage}
              </label>
              <textarea
                id="plaintext-input"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                rows={4}
                placeholder="Enter plaintext message to encrypt..."
                className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500 font-mono tabular-nums">
                <span>{plaintext.length} {t.chars}</span>
                <span>{(plaintext.match(/[a-zA-Z]/g) || []).length} {t.letters}</span>
              </div>
            </div>

            {/* Dynamic Algorithm Parameters */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Algorithm Parameters</span>
                <button
                  type="button"
                  onClick={handleGenerateRandomKey}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  <Dices className="h-3.5 w-3.5" />
                  <span>{t.randomKey}</span>
                </button>
              </div>

              {/* Caesar Shift Slider */}
              {selectedCipher === 'caesar' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <label htmlFor="caesar-shift-range">Alphabet Shift (k)</label>
                    <span className="font-mono text-indigo-400 font-bold tabular-nums">
                      {caesarShift} ({String.fromCharCode(65 + caesarShift)})
                    </span>
                  </div>
                  <input
                    id="caesar-shift-range"
                    type="range"
                    min="0"
                    max="25"
                    value={caesarShift}
                    onChange={(e) => setCaesarShift(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Monoalphabetic Substitution */}
              {selectedCipher === 'monoalphabetic' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="substitution-key-input" className="text-xs text-slate-300 font-medium">
                        Substitution Keyword or 26-Letter Alphabet
                      </label>
                      <button
                        type="button"
                        onClick={() => setSubstitutionKey(generateRandomSubstitutionAlphabet())}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Shuffle 26 Letters
                      </button>
                    </div>
                    <input
                      id="substitution-key-input"
                      type="text"
                      value={substitutionKey}
                      onChange={(e) => setSubstitutionKey(e.target.value.toUpperCase())}
                      placeholder="e.g. ZEBRAS or full 26 unique letters..."
                      className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs text-slate-100 font-mono tracking-wider focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  {/* Alphabet visualizer */}
                  {(() => {
                    const norm = normalizeSubstitutionKey(substitutionKey);
                    return (
                      <div className="rounded border border-slate-800/80 bg-slate-950/80 p-2.5 font-mono text-[10px]">
                        <div className="text-slate-400 mb-1 flex items-center justify-between">
                          <span>Alphabet Mapping:</span>
                          <span className={norm.valid ? 'text-emerald-400' : 'text-amber-400'}>
                            {norm.valid ? 'Valid 26-Letter Bijection' : norm.error}
                          </span>
                        </div>
                        <div className="overflow-x-auto pb-1">
                          <div className="grid grid-cols-26 gap-1 min-w-[520px] text-center">
                            {STANDARD_ALPHABET.split('').map((c, i) => (
                              <div key={c} className="flex flex-col items-center">
                                <span className="text-slate-500 font-semibold">{c}</span>
                                <span className="text-slate-600">↓</span>
                                <span className="text-indigo-300 font-bold bg-indigo-950/60 rounded px-0.5 border border-indigo-800/40">
                                  {norm.alphabet[i]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Polybius Square 5x5 */}
              {selectedCipher === 'polybius' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="polybius-key-input" className="block text-xs text-slate-400 mb-1">
                        Optional Key (Generates Permuted 5x5 Grid)
                      </label>
                      <input
                        id="polybius-key-input"
                        type="text"
                        value={polybiusKey}
                        onChange={(e) => setPolybiusKey(e.target.value.toUpperCase())}
                        placeholder="Leave blank for standard A-Z (I/J)..."
                        className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="polybius-separator-select" className="block text-xs text-slate-400 mb-1">
                        Coordinate Separator
                      </label>
                      <select
                        id="polybius-separator-select"
                        value={polybiusSeparator}
                        onChange={(e) => setPolybiusSeparator(e.target.value)}
                        className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200"
                      >
                        <option value=" ">Space ("23 15 31 31 34")</option>
                        <option value="">None ("2315313134")</option>
                        <option value="-">Hyphen ("23-15-31-31-34")</option>
                      </select>
                    </div>
                  </div>
                  {/* 5x5 Grid Display */}
                  <div className="rounded border border-slate-800/80 bg-slate-950/80 p-2.5">
                    <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Polybius 5x5 Matrix (Rows × Columns):</div>
                    <div className="inline-block font-mono text-xs">
                      <div className="grid grid-cols-6 gap-1 text-center font-bold">
                        <span className="text-slate-600">#</span>
                        <span className="text-slate-400">1</span>
                        <span className="text-slate-400">2</span>
                        <span className="text-slate-400">3</span>
                        <span className="text-slate-400">4</span>
                        <span className="text-slate-400">5</span>
                      </div>
                      {generatePolybiusGrid(polybiusKey).map((row, rIdx) => (
                        <div key={rIdx} className="grid grid-cols-6 gap-1 text-center my-0.5">
                          <span className="text-slate-400 font-bold">{rIdx + 1}</span>
                          {row.map((cell, cIdx) => (
                            <span
                              key={cIdx}
                              className="rounded bg-slate-900 border border-slate-800 py-0.5 text-indigo-300 font-semibold"
                            >
                              {cell === 'I' ? 'I/J' : cell}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Affine Parameters: a and b */}
              {selectedCipher === 'affine' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label htmlFor="affine-a-select" className="block text-slate-400 mb-1">Multiplier a (Coprime to 26)</label>
                    <select
                      id="affine-a-select"
                      value={affineA}
                      onChange={(e) => setAffineA(parseInt(e.target.value, 10))}
                      className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-slate-200 font-mono"
                    >
                      {AFFINE_VALID_A.map((a) => (
                        <option key={a} value={a}>
                          a = {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="affine-b-input" className="block text-slate-400 mb-1">Shift b (0 to 25)</label>
                    <input
                      id="affine-b-input"
                      type="number"
                      min="0"
                      max="25"
                      value={affineB}
                      onChange={(e) => setAffineB(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Keyword based (Vigenere, Beaufort, Autokey, Playfair, Columnar) */}
              {[
                'vigenere',
                'beaufort',
                'autokey',
                'playfair',
                'columnar',
              ].includes(selectedCipher) && (
                <div>
                  <label htmlFor="secret-keyword-input" className="block text-xs text-slate-400 mb-1">Secret Keyword</label>
                  <input
                    id="secret-keyword-input"
                    type="text"
                    value={keyWord}
                    onChange={(e) => setKeyWord(e.target.value.toUpperCase())}
                    placeholder="Enter alphabetic keyword..."
                    className="w-full rounded border border-slate-800 bg-slate-900 p-2 font-mono text-xs text-slate-200 uppercase tracking-wider focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Characters are normalized to uppercase Latin letters.
                  </p>
                </div>
              )}

              {/* Rail Fence */}
              {selectedCipher === 'rail_fence' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <label htmlFor="rail-count-range">Number of Rails</label>
                    <span className="font-mono text-indigo-400 font-bold tabular-nums">
                      {railCount} Rails
                    </span>
                  </div>
                  <input
                    id="rail-count-range"
                    type="range"
                    min="2"
                    max="10"
                    value={railCount}
                    onChange={(e) => setRailCount(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Hill 2x2 Matrix */}
              {selectedCipher === 'hill' && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>2x2 Key Matrix Elements</span>
                    {isInvertibleHill2x2(hillMatrix) ? (
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Invertible (det={calculateDeterminant2x2(hillMatrix)})
                      </span>
                    ) : (
                      <span className="text-rose-400 font-mono text-[11px] flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Not Invertible (det={calculateDeterminant2x2(hillMatrix)})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px]">Row 1, Col 1 (a)</span>
                      <input
                        type="number"
                        value={hillMatrix.a}
                        onChange={(e) =>
                          setHillMatrix({ ...hillMatrix, a: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Row 1, Col 2 (b)</span>
                      <input
                        type="number"
                        value={hillMatrix.b}
                        onChange={(e) =>
                          setHillMatrix({ ...hillMatrix, b: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Row 2, Col 1 (c)</span>
                      <input
                        type="number"
                        value={hillMatrix.c}
                        onChange={(e) =>
                          setHillMatrix({ ...hillMatrix, c: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Row 2, Col 2 (d)</span>
                      <input
                        type="number"
                        value={hillMatrix.d}
                        onChange={(e) =>
                          setHillMatrix({ ...hillMatrix, d: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 font-mono text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bacon Mode */}
              {selectedCipher === 'bacon' && (
                <div>
                  <label htmlFor="bacon-alphabet-select" className="block text-xs text-slate-400 mb-1">Bacon Alphabet Mapping</label>
                  <select
                    id="bacon-alphabet-select"
                    value={baconMode}
                    onChange={(e) => setBaconMode(e.target.value as any)}
                    className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-slate-200"
                  >
                    <option value="26">Modern 26-Letter Alphabet (Unique codes)</option>
                    <option value="24">Historical 24-Letter Alphabet (I=J, U=V)</option>
                  </select>
                </div>
              )}

              {/* XOR Byte */}
              {selectedCipher === 'xor' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <label htmlFor="xor-key-range">XOR Key Byte (1-255)</label>
                    <span className="font-mono text-indigo-400 font-bold tabular-nums">
                      0x{xorByte.toString(16).padStart(2, '0')} ({xorByte})
                    </span>
                  </div>
                  <input
                    id="xor-key-range"
                    type="range"
                    min="1"
                    max="255"
                    value={xorByte}
                    onChange={(e) => setXorByte(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: Result & Reversibility Test
            ========================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
            {/* Output Header */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t.generatedCiphertext}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!ciphertext}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? t.copied : 'Copy'}</span>
                </button>
                <span className="text-slate-700">·</span>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!ciphertext}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{t.download}</span>
                </button>
              </div>
            </div>

            {/* Error Message if Parameter Invalid */}
            {errorMessage && (
              <div className="mb-3 rounded-lg border border-rose-800/50 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Ciphertext Output Area */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100 leading-relaxed min-h-36 overflow-x-auto selection:bg-indigo-500/30">
              <pre className="whitespace-pre-wrap break-words">
                {ciphertext || 'Ciphertext will appear here once valid parameters are entered.'}
              </pre>
            </div>

            {/* Reversibility Verification Card */}
            <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
                  {t.reversibilityTest}
                </span>
                {isReversible ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t.verifiedInvertible}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Padding/Case Normalized
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Applying the inverse operation to this ciphertext automatically recovers the original plaintext message.
              </p>
              {reversedPlaintext && (
                <div className="mt-2 rounded bg-slate-900/80 p-2 font-mono text-[11px] text-slate-300 truncate">
                  {reversedPlaintext}
                </div>
              )}
            </div>

            {/* Action to test in Auto-Solver */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
              <button
                type="button"
                onClick={() => onSendToSolver(ciphertext)}
                disabled={!ciphertext}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                <span>Test in Auto-Solver</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
