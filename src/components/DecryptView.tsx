/**
 * CipherMind AI - Manual Decryption Workspace
 * Precise manual decryption with strict parameter validation and error diagnostics
 */

import React, { useState, useEffect } from 'react';
import {
  Unlock,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { caesarDecrypt, rot13, rot47 } from '../crypto/ciphers/caesar';
import { atbash } from '../crypto/ciphers/atbash';
import {
  monoalphabeticDecrypt,
  generateRandomSubstitutionAlphabet,
  normalizeSubstitutionKey,
  STANDARD_ALPHABET,
} from '../crypto/ciphers/monoalphabetic';
import {
  polybiusDecrypt,
  generatePolybiusGrid,
} from '../crypto/ciphers/polybius';
import { affineDecrypt, AFFINE_VALID_A, gcd } from '../crypto/ciphers/affine';
import {
  vigenereDecrypt,
  beaufortCipher,
  autokeyDecrypt,
} from '../crypto/ciphers/vigenere';
import {
  railFenceDecrypt,
  columnarDecrypt,
  reverseText,
} from '../crypto/ciphers/transposition';
import { playfairDecrypt } from '../crypto/ciphers/playfair';
import {
  hillDecrypt2x2,
  isInvertibleHill2x2,
  calculateDeterminant2x2,
  HillMatrix2x2,
} from '../crypto/ciphers/hill';
import { baconDecrypt } from '../crypto/ciphers/bacon';
import { xorSingleByte, xorRepeatingKey } from '../crypto/ciphers/xor';
import { morseDecode } from '../crypto/ciphers/morse';
import {
  base64Decode,
  hexDecode,
  binaryDecode,
  urlDecode,
  htmlEntitiesDecode,
} from '../crypto/ciphers/encodings';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

interface DecryptViewProps {
  onSwitchToAutoSolve: (text: string) => void;
  initialCiphertext?: string;
  initialCipher?: string;
  userLanguage?: SupportedLanguage;
}

export const DecryptView: React.FC<DecryptViewProps> = ({
  onSwitchToAutoSolve,
  initialCiphertext = '',
  initialCipher = 'caesar',
  userLanguage = 'en',
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;
  const [ciphertext, setCiphertext] = useState(
    initialCiphertext || 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ'
  );
  const [selectedCipher, setSelectedCipher] = useState(initialCipher);

  // Parameters
  const [caesarShift, setCaesarShift] = useState<number>(3);
  const [affineA, setAffineA] = useState<number>(5);
  const [affineB, setAffineB] = useState<number>(8);
  const [keyWord, setKeyWord] = useState<string>('LEMON');
  const [railCount, setRailCount] = useState<number>(3);
  const [hillMatrix, setHillMatrix] = useState<HillMatrix2x2>({ a: 3, b: 3, c: 2, d: 5 });
  const [baconMode, setBaconMode] = useState<'26' | '24'>('26');
  const [xorByte, setXorByte] = useState<number>(66);
  const [substitutionKey, setSubstitutionKey] = useState<string>('ZEBRAS');
  const [polybiusKey, setPolybiusKey] = useState<string>('');

  const [plaintext, setPlaintext] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setErrorMessage(null);
    if (!ciphertext.trim()) {
      setPlaintext('');
      return;
    }

    try {
      let dec = '';

      switch (selectedCipher) {
        case 'caesar':
          dec = caesarDecrypt(ciphertext, caesarShift);
          break;
        case 'monoalphabetic':
          dec = monoalphabeticDecrypt(ciphertext, substitutionKey);
          break;
        case 'polybius':
          dec = polybiusDecrypt(ciphertext, polybiusKey);
          break;
        case 'rot13':
          dec = rot13(ciphertext);
          break;
        case 'rot47':
          dec = rot47(ciphertext);
          break;
        case 'atbash':
          dec = atbash(ciphertext);
          break;
        case 'affine':
          if (gcd(affineA, 26) !== 1) {
            throw new Error(`Multiplier a=${affineA} is not coprime to 26 (gcd is ${gcd(affineA, 26)}).`);
          }
          dec = affineDecrypt(ciphertext, affineA, affineB);
          break;
        case 'vigenere':
          if (!keyWord.trim()) throw new Error('Vigenère requires an alphabetic key.');
          dec = vigenereDecrypt(ciphertext, keyWord);
          break;
        case 'beaufort':
          if (!keyWord.trim()) throw new Error('Beaufort requires an alphabetic key.');
          dec = beaufortCipher(ciphertext, keyWord);
          break;
        case 'autokey':
          if (!keyWord.trim()) throw new Error('Autokey requires an alphabetic seed key.');
          dec = autokeyDecrypt(ciphertext, keyWord);
          break;
        case 'rail_fence':
          dec = railFenceDecrypt(ciphertext, railCount);
          break;
        case 'columnar':
          if (!keyWord.trim()) throw new Error('Columnar transposition requires a key.');
          dec = columnarDecrypt(ciphertext, keyWord);
          break;
        case 'playfair':
          if (!keyWord.trim()) throw new Error('Playfair requires a keyword.');
          dec = playfairDecrypt(ciphertext, keyWord);
          break;
        case 'hill':
          if (!isInvertibleHill2x2(hillMatrix)) {
            const det = calculateDeterminant2x2(hillMatrix);
            throw new Error(
              `Hill 2x2 matrix is not invertible modulo 26. Determinant is ${det}, which shares common factors with 26.`
            );
          }
          dec = hillDecrypt2x2(ciphertext, hillMatrix);
          break;
        case 'bacon':
          dec = baconDecrypt(ciphertext, baconMode);
          break;
        case 'xor':
          dec = xorSingleByte(ciphertext, xorByte);
          break;
        case 'morse':
          dec = morseDecode(ciphertext);
          break;
        case 'base64':
          dec = base64Decode(ciphertext);
          break;
        case 'hex':
          dec = hexDecode(ciphertext);
          break;
        case 'binary':
          dec = binaryDecode(ciphertext);
          break;
        case 'reverse':
          dec = reverseText(ciphertext);
          break;
        default:
          dec = caesarDecrypt(ciphertext, 3);
      }

      setPlaintext(dec);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Decryption failed.');
      setPlaintext('');
    }
  }, [
    ciphertext,
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
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-6 border-b border-slate-800/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          {t.decryptTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.decryptSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================
            LEFT COLUMN: Ciphertext & Algorithm Params
            ========================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
            {/* Algorithm Choice */}
            <div className="mb-4">
              <label htmlFor="manual-algorithm-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {t.targetDecryptAlgo}
              </label>
              <select
                id="manual-algorithm-select"
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
                  <option value="autokey">Autokey Cipher (Plaintext Seed)</option>
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
                  <option value="xor">XOR (Single Byte)</option>
                </optgroup>
              </select>
            </div>

            {/* Ciphertext Input */}
            <div className="mb-4">
              <label htmlFor="ciphertext-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Ciphertext to Decrypt
              </label>
              <textarea
                id="ciphertext-input"
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                rows={4}
                placeholder="Paste ciphertext to decrypt..."
                className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Algorithm Parameters Box */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Required Decryption Parameters</span>

              {/* Caesar */}
              {selectedCipher === 'caesar' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <label htmlFor="manual-caesar-shift-range">Alphabet Shift (k)</label>
                    <span className="font-mono text-indigo-400 font-bold tabular-nums">
                      {caesarShift} ({String.fromCharCode(65 + caesarShift)})
                    </span>
                  </div>
                  <input
                    id="manual-caesar-shift-range"
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
                      <label htmlFor="dec-substitution-key-input" className="text-xs text-slate-300 font-medium">
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
                      id="dec-substitution-key-input"
                      type="text"
                      value={substitutionKey}
                      onChange={(e) => setSubstitutionKey(e.target.value.toUpperCase())}
                      placeholder="e.g. ZEBRAS or 26-letter substitution alphabet..."
                      className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs text-slate-100 font-mono tracking-wider focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  {(() => {
                    const norm = normalizeSubstitutionKey(substitutionKey);
                    return (
                      <div className="rounded border border-slate-800/80 bg-slate-950/80 p-2.5 font-mono text-[10px]">
                        <div className="text-slate-400 mb-1 flex items-center justify-between">
                          <span>Alphabet Inversion Map:</span>
                          <span className={norm.valid ? 'text-emerald-400' : 'text-amber-400'}>
                            {norm.valid ? 'Active Key' : norm.error}
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

              {/* Polybius Square */}
              {selectedCipher === 'polybius' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="dec-polybius-key-input" className="block text-xs text-slate-400 mb-1">
                      Optional Polybius Key (Leave blank for standard 5x5 grid)
                    </label>
                    <input
                      id="dec-polybius-key-input"
                      type="text"
                      value={polybiusKey}
                      onChange={(e) => setPolybiusKey(e.target.value.toUpperCase())}
                      placeholder="e.g. CIPHER..."
                      className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="rounded border border-slate-800/80 bg-slate-950/80 p-2.5">
                    <div className="text-[11px] text-slate-400 mb-1.5 font-medium">5x5 Coordinate Matrix:</div>
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

              {/* Affine */}
              {selectedCipher === 'affine' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label htmlFor="manual-affine-a-select" className="block text-slate-400 mb-1">Multiplier a (Coprime to 26)</label>
                    <select
                      id="manual-affine-a-select"
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
                    <label htmlFor="manual-affine-b-input" className="block text-slate-400 mb-1">Shift b (0 to 25)</label>
                    <input
                      id="manual-affine-b-input"
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

              {/* Keywords */}
              {['vigenere', 'beaufort', 'autokey', 'playfair', 'columnar'].includes(selectedCipher) && (
                <div>
                  <label htmlFor="manual-key-input" className="block text-xs text-slate-400 mb-1">Secret Key</label>
                  <input
                    id="manual-key-input"
                    type="text"
                    value={keyWord}
                    onChange={(e) => setKeyWord(e.target.value.toUpperCase())}
                    placeholder="Enter key..."
                    className="w-full rounded border border-slate-800 bg-slate-900 p-2 font-mono text-xs text-slate-200 uppercase tracking-wider focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Rail Fence */}
              {selectedCipher === 'rail_fence' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <label htmlFor="manual-rail-count-range">Number of Rails</label>
                    <span className="font-mono text-indigo-400 font-bold tabular-nums">
                      {railCount} Rails
                    </span>
                  </div>
                  <input
                    id="manual-rail-count-range"
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
                    <span>2x2 Matrix Elements</span>
                    {isInvertibleHill2x2(hillMatrix) ? (
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Invertible (det={calculateDeterminant2x2(hillMatrix)})
                      </span>
                    ) : (
                      <span className="text-rose-400 font-mono text-[11px] flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Not Invertible
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
            </div>

            {/* Switch to Auto-Solve Callout */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Don't know the exact key or cipher?</span>
              <button
                type="button"
                onClick={() => onSwitchToAutoSolve(ciphertext)}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t.switchToAutoSolve}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: Decrypted Plaintext
            ========================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Decrypted Output
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!plaintext}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? t.copied : t.copyPlaintext}</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-3 rounded-lg border border-rose-800/50 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100 leading-relaxed min-h-36 overflow-x-auto selection:bg-indigo-500/30">
              <pre className="whitespace-pre-wrap break-words">
                {plaintext || 'Decrypted plaintext will appear here once valid parameters are entered.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
