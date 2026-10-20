/**
 * CipherMind AI - Universal Auto-Solver Engine
 * Multi-layer breadth-first cryptanalytic pipeline with deterministic solvers and cycle detection
 */

import {
  crackCaesarAllShifts,
  caesarDecrypt,
  rot13,
  rot5,
  rot47,
} from './ciphers/caesar';
import { atbash } from './ciphers/atbash';
import {
  monoalphabeticDecrypt,
  frequencyMonoalphabeticGuess,
} from './ciphers/monoalphabetic';
import { polybiusDecrypt } from './ciphers/polybius';
import {
  AFFINE_VALID_A,
  affineDecrypt,
  crackAffineAllKeys,
} from './ciphers/affine';
import {
  vigenereDecrypt,
  beaufortCipher,
  autokeyDecrypt,
  COMMON_VIGENERE_KEYS,
  crackVigenereByLength,
} from './ciphers/vigenere';
import {
  railFenceDecrypt,
  reverseText,
  reverseWords,
} from './ciphers/transposition';
import {
  baconDecrypt,
  isLikelyBacon,
} from './ciphers/bacon';
import {
  hillDecrypt2x2,
  POPULAR_HILL_MATRICES,
} from './ciphers/hill';
import {
  crackSingleByteXor,
  xorRepeatingKey,
} from './ciphers/xor';
import {
  morseDecode,
  isLikelyMorse,
} from './ciphers/morse';
import {
  base64Decode,
  hexDecode,
  binaryDecode,
  urlDecode,
  htmlEntitiesDecode,
  decimalAsciiDecode,
  unicodeEscapeDecode,
  isLikelyBase64,
  isLikelyHex,
  isLikelyBinary,
  isLikelyDecimalAscii,
} from './ciphers/encodings';
import {
  calculateChiSquared,
  calculateIoC,
  calculateEntropy,
  findRepeatedNgrams,
  estimateVigenereKeyLengths,
} from './frequencies';
import { scoreCandidate } from './scoring';
import {
  AutoSolveOptions,
  CipherCandidate,
  FrequencyAnalysis,
  ScoringMetrics,
  TransformationStep,
} from './types';

/**
 * Detailed statistical inspection of the input text
 */
export function inspectInput(text: string): FrequencyAnalysis {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const letterCounts: Record<string, number> = {};
  for (let i = 0; i < 26; i++) {
    letterCounts[String.fromCharCode(65 + i)] = 0;
  }
  for (const ch of letters) {
    letterCounts[ch] = (letterCounts[ch] || 0) + 1;
  }

  const letterFrequencies: Record<string, number> = {};
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    letterFrequencies[ch] = letters.length > 0 ? (letterCounts[ch] / letters.length) * 100 : 0;
  }

  const ioc = calculateIoC(text);
  const entropy = calculateEntropy(text);
  const chiSquaredToEnglish = calculateChiSquared(text);

  const repeatedNgrams = findRepeatedNgrams(text, 3, 2);
  const suggestedVigenereKeyLengths = estimateVigenereKeyLengths(repeatedNgrams);

  const words = text.trim().split(/\s+/).filter(Boolean);
  const avgWordLen = words.length > 0
    ? words.reduce((acc, w) => acc + w.length, 0) / words.length
    : 0;

  return {
    letterCounts,
    letterFrequencies,
    totalLetters: letters.length,
    totalCharacters: text.length,
    ioc: Math.round(ioc * 10000) / 10000,
    entropy: Math.round(entropy * 100) / 100,
    chiSquaredToEnglish: Math.round(chiSquaredToEnglish * 100) / 100,
    detectedPatterns: {
      isHex: isLikelyHex(text),
      isBase64: isLikelyBase64(text),
      isBinary: isLikelyBinary(text),
      isMorse: isLikelyMorse(text),
      isUrlEncoded: /%[0-9a-fA-F]{2}/.test(text),
      hasPunctuation: /[^a-zA-Z0-9\s]/.test(text),
      averageWordLength: Math.round(avgWordLen * 10) / 10,
    },
    repeatedNgrams,
    suggestedVigenereKeyLengths,
  };
}

interface PipelineNode {
  currentText: string;
  chain: TransformationStep[];
  depth: number;
}

/**
 * Universal Auto-Solver Pipeline
 * Runs multi-layer breadth-first search through encodings, classical ciphers, and transpositions
 */
export function autoSolveAll(
  ciphertext: string,
  options: AutoSolveOptions = {}
): { candidates: CipherCandidate[]; inspection: FrequencyAnalysis; elapsedMs: number } {
  const startTime = performance.now();
  const maxDepth = options.maxDepth || 2;
  const inspection = inspectInput(ciphertext);

  const candidates: CipherCandidate[] = [];
  const visited = new Set<string>();

  // Normalize string for duplicate detection
  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

  visited.add(normalize(ciphertext));

  // Breadth-first search queue
  const queue: PipelineNode[] = [{ currentText: ciphertext, chain: [], depth: 0 }];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node.depth >= maxDepth) continue;

    const currentText = node.currentText;
    const nextDepth = node.depth + 1;

    // Helper to evaluate and enqueue a transformation
    const evaluateTransform = (
      outputText: string,
      step: Omit<TransformationStep, 'inputText' | 'outputText'>,
      allowEnqueue = true
    ) => {
      const trimmedOutput = outputText.trim();
      if (!trimmedOutput || trimmedOutput === currentText.trim()) return;

      const norm = normalize(trimmedOutput);
      const isAlreadyVisited = visited.has(norm);

      const fullStep: TransformationStep = {
        ...step,
        inputText: currentText,
        outputText,
      };

      const fullChain = [...node.chain, fullStep];

      const targetLang = options.expectedLanguage || 'en';
      // Calculate score for candidate using chosen target language
      const metrics = scoreCandidate(outputText, ciphertext.length, nextDepth, targetLang);

      // Check if user specified a crib (must contain crib)
      if (options.crib && !outputText.toLowerCase().includes(options.crib.toLowerCase())) {
        // Skip adding as high candidate if crib doesn't match
      } else {
        // Construct Candidate
        const candidate: CipherCandidate = {
          id: `${fullStep.cipherId}-${fullChain.map((s) => s.cipherId).join('->')}-${Math.random().toString(36).substring(2, 7)}`,
          plaintext: outputText,
          originalCiphertext: ciphertext,
          transformationChain: fullChain,
          primaryCipherName: fullChain[fullChain.length - 1].cipherName,
          primaryCategory: fullChain[fullChain.length - 1].category,
          depth: nextDepth,
          metrics,
          parametersSummary: formatParametersSummary(fullChain),
          explanation: generateStepExplanation(fullChain, metrics, targetLang),
          isDeterministic: true,
        };

        candidates.push(candidate);
      }

      // Enqueue for deeper multi-layer inspection if score is promising and not visited
      if (allowEnqueue && !isAlreadyVisited && nextDepth < maxDepth) {
        visited.add(norm);
        // Only queue plausible branch expansions (avoid combinatorial explosion)
        // For encodings, always explore layer 2. For ciphers, only explore if readable
        const isEncoding = step.category === 'encoding';
        if (isEncoding || metrics.totalScore >= 35 || metrics.readabilityScore >= 70) {
          queue.push({
            currentText: outputText,
            chain: fullChain,
            depth: nextDepth,
          });
        }
      }
    };

    // ==========================================
    // 1. Digital Encodings
    // ==========================================

    // Base64
    if (isLikelyBase64(currentText)) {
      try {
        const decoded = base64Decode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'base64',
              cipherName: 'Base64 Decode',
              category: 'encoding',
              parameters: { format: 'Base64/UTF-8' },
              description: 'Decoded standard Base64 string into plaintext bytes.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid base64
      }
    }

    // Hexadecimal
    if (isLikelyHex(currentText)) {
      try {
        const decoded = hexDecode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'hex',
              cipherName: 'Hexadecimal Decode',
              category: 'encoding',
              parameters: { radix: 16 },
              description: 'Decoded hexadecimal byte sequence into ASCII/UTF-8 text.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid hex
      }
    }

    // Binary (8-bit)
    if (isLikelyBinary(currentText)) {
      try {
        const decoded = binaryDecode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'binary',
              cipherName: 'Binary (Base2) Decode',
              category: 'encoding',
              parameters: { bits: 8 },
              description: 'Decoded 8-bit binary stream into ASCII/UTF-8 characters.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid binary
      }
    }

    // URL percent-encoding
    if (/%[0-9a-fA-F]{2}/.test(currentText) || currentText.includes('+')) {
      try {
        const decoded = urlDecode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'url',
              cipherName: 'URL Percent Decode',
              category: 'encoding',
              parameters: { standard: 'RFC 3986' },
              description: 'Decoded URL percent-encoded characters.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid URL decode
      }
    }

    // HTML entities
    if (/&[#a-zA-Z0-9]+;/.test(currentText)) {
      try {
        const decoded = htmlEntitiesDecode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'html_entities',
              cipherName: 'HTML Entities Decode',
              category: 'encoding',
              parameters: {},
              description: 'Decoded HTML entity references.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid html decode
      }
    }

    // Decimal ASCII
    if (isLikelyDecimalAscii(currentText)) {
      try {
        const decoded = decimalAsciiDecode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'decimal_ascii',
              cipherName: 'Decimal ASCII Decode',
              category: 'encoding',
              parameters: { base: 10 },
              description: 'Decoded space-separated decimal ASCII codes into characters.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid decimal ascii
      }
    }

    // Unicode Escape Sequences
    if (/\\u[0-9a-fA-F]{4}/.test(currentText)) {
      try {
        const decoded = unicodeEscapeDecode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'unicode_escape',
              cipherName: 'Unicode Escape Decode',
              category: 'encoding',
              parameters: { format: '\\uXXXX' },
              description: 'Decoded Unicode escape sequences into UTF-16 characters.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid unicode
      }
    }

    // Morse Code
    if (isLikelyMorse(currentText)) {
      try {
        const decoded = morseDecode(currentText);
        if (decoded && decoded !== currentText) {
          evaluateTransform(
            decoded,
            {
              cipherId: 'morse',
              cipherName: 'Morse Code Decode',
              category: 'encoding',
              parameters: { alphabet: 'International Morse' },
              description: 'Decoded dots and dashes into alphanumeric text.',
            },
            true
          );
        }
      } catch {
        // Ignore
      }
    }

    // Bacon's cipher
    if (isLikelyBacon(currentText)) {
      try {
        const dec26 = baconDecrypt(currentText, '26');
        if (dec26) {
          evaluateTransform(
            dec26,
            {
              cipherId: 'bacon_26',
              cipherName: "Bacon's Cipher (26-Letter)",
              category: 'substitution',
              parameters: { alphabet: 'Modern 26-Letter' },
              description: "Decoded 5-unit Baconian binary sequences.",
            },
            true
          );
        }
        const dec24 = baconDecrypt(currentText, '24');
        if (dec24 && dec24 !== dec26) {
          evaluateTransform(
            dec24,
            {
              cipherId: 'bacon_24',
              cipherName: "Bacon's Cipher (24-Letter I=J, U=V)",
              category: 'substitution',
              parameters: { alphabet: 'Traditional 24-Letter' },
              description: "Decoded 5-unit Baconian sequences with merged I/J and U/V.",
            },
            true
          );
        }
      } catch {
        // Ignore
      }
    }

    // ==========================================
    // 2. Classical Substitution & Shift Ciphers
    // ==========================================

    // Caesar Cipher: test every shift from 1 to 25
    for (let shift = 1; shift < 26; shift++) {
      const shifted = caesarDecrypt(currentText, shift);
      evaluateTransform(
        shifted,
        {
          cipherId: `caesar_${shift}`,
          cipherName: shift === 13 ? 'ROT13' : `Caesar Cipher (Shift ${shift})`,
          category: 'substitution',
          parameters: { shift, keyLetter: String.fromCharCode(65 + shift) },
          description: `Shifted letters back by ${shift} position${shift > 1 ? 's' : ''} in the Latin alphabet.`,
        },
        shift === 13 // Allow ROT13 to chain deeper
      );
    }

    // ROT47
    try {
      const rot47Dec = rot47(currentText);
      if (rot47Dec !== currentText) {
        evaluateTransform(
          rot47Dec,
          {
            cipherId: 'rot47',
            cipherName: 'ROT47 (ASCII 33-126)',
            category: 'substitution',
            parameters: { shift: 47 },
            description: 'Rotated all printable ASCII characters by 47.',
          },
          false
        );
      }
    } catch {
      // Ignore
    }

    // Atbash Cipher
    const atbashDec = atbash(currentText);
    evaluateTransform(
      atbashDec,
      {
        cipherId: 'atbash',
        cipherName: 'Atbash Cipher',
        category: 'substitution',
        parameters: { mapping: 'A<->Z, B<->Y' },
        description: 'Reversed the standard alphabet mapping (A swapped with Z, B with Y).',
      },
      true
    );

    // Affine Cipher: Brute force test with promising candidates
    for (const a of AFFINE_VALID_A) {
      if (a === 1) continue; // a=1 is standard Caesar, already tested
      for (let b = 0; b < 26; b++) {
        const affDec = affineDecrypt(currentText, a, b);
        // Only keep affine candidates that have decent score to keep search fast
        const prelimMetrics = scoreCandidate(affDec, ciphertext.length, nextDepth);
        if (prelimMetrics.totalScore >= 40) {
          evaluateTransform(
            affDec,
            {
              cipherId: `affine_${a}_${b}`,
              cipherName: `Affine Cipher (a=${a}, b=${b})`,
              category: 'substitution',
              parameters: { a, b, formula: `E(x) = (${a}x + ${b}) mod 26` },
              description: `Inverted Affine transformation with multiplier a=${a} and shift b=${b}.`,
            },
            false
          );
        }
      }
    }

    // Polybius Square: Test if input consists of digit pairs (1-5)
    const polyDigits = currentText.replace(/[^1-5]/g, '');
    if (polyDigits.length >= 4 && polyDigits.length % 2 === 0 && polyDigits.length >= currentText.replace(/[^0-9a-zA-Z]/g, '').length * 0.8) {
      try {
        const polyDec = polybiusDecrypt(currentText);
        if (polyDec && polyDec.length > 0) {
          evaluateTransform(
            polyDec,
            {
              cipherId: 'polybius_standard',
              cipherName: 'Polybius Square (5x5)',
              category: 'substitution',
              parameters: { grid: 'Standard 5x5 (A-Z, I=J)' },
              description: 'Decoded coordinate numeral pairs from standard Polybius 5x5 square.',
            },
            true
          );
        }
      } catch {
        // Ignore invalid coordinate sequences
      }
    }

    // Monoalphabetic Substitution: Keyed alphabets & Frequency heuristic
    if (options.knownKey) {
      try {
        const monoKnown = monoalphabeticDecrypt(currentText, options.knownKey);
        evaluateTransform(
          monoKnown,
          {
            cipherId: `mono_key_${options.knownKey}`,
            cipherName: `Monoalphabetic Substitution (Key: ${options.knownKey})`,
            category: 'substitution',
            parameters: { key: options.knownKey },
            description: `Decrypted using substitution alphabet derived from key "${options.knownKey}".`,
          },
          true
        );
      } catch {
        // Ignore invalid keys
      }
    }

    // Test prominent historical keyed alphabets
    const sampleKeyedWords = ['ZEBRAS', 'KEYWORD', 'SECRET', 'CRYPTO', 'CIPHER', 'MATRIX'];
    for (const kw of sampleKeyedWords) {
      try {
        const monoDec = monoalphabeticDecrypt(currentText, kw);
        const prelim = scoreCandidate(monoDec, ciphertext.length, nextDepth);
        if (prelim.totalScore >= 35) {
          evaluateTransform(
            monoDec,
            {
              cipherId: `mono_keyed_${kw}`,
              cipherName: `Monoalphabetic Substitution (Key: ${kw})`,
              category: 'substitution',
              parameters: { keyword: kw },
              description: `Decrypted using keyed substitution alphabet generated from "${kw}".`,
            },
            false
          );
        }
      } catch {
        // Continue
      }
    }

    // Frequency-based monoalphabetic heuristic alignment
    if (currentText.length >= 20) {
      try {
        const freqGuess = frequencyMonoalphabeticGuess(currentText);
        const prelim = scoreCandidate(freqGuess, ciphertext.length, nextDepth);
        if (prelim.totalScore >= 35) {
          evaluateTransform(
            freqGuess,
            {
              cipherId: 'mono_frequency_heuristic',
              cipherName: 'Monoalphabetic Substitution (Frequency Fit)',
              category: 'substitution',
              parameters: { method: 'ETAOIN Frequency Alignment' },
              description: 'Substituted letters mapping highest observed ciphertext frequencies to standard English frequencies.',
            },
            false
          );
        }
      } catch {
        // Continue
      }
    }

    // ==========================================
    // 3. Polyalphabetic Ciphers (Vigenère, Beaufort, Autokey)
    // ==========================================

    // If user provided a known key or crib, test it directly
    const candidateKeys = [...COMMON_VIGENERE_KEYS];
    if (options.knownKey) {
      candidateKeys.unshift(options.knownKey);
    }

    for (const key of candidateKeys) {
      try {
        const vigDec = vigenereDecrypt(currentText, key);
        evaluateTransform(
          vigDec,
          {
            cipherId: `vigenere_${key}`,
            cipherName: `Vigenère Cipher (Key: "${key}")`,
            category: 'polyalphabetic',
            parameters: { key, keyLength: key.length },
            description: `Decrypted with polyalphabetic Vigenère key "${key}".`,
          },
          false
        );

        const beauDec = beaufortCipher(currentText, key);
        evaluateTransform(
          beauDec,
          {
            cipherId: `beaufort_${key}`,
            cipherName: `Beaufort Cipher (Key: "${key}")`,
            category: 'polyalphabetic',
            parameters: { key, formula: 'D(y) = (K - C) mod 26' },
            description: `Decrypted with reciprocal Beaufort cipher and key "${key}".`,
          },
          false
        );

        const autoDec = autokeyDecrypt(currentText, key);
        evaluateTransform(
          autoDec,
          {
            cipherId: `autokey_${key}`,
            cipherName: `Autokey Cipher (Seed: "${key}")`,
            category: 'polyalphabetic',
            parameters: { seed: key },
            description: `Decrypted with plaintext-extended autokey seeded by "${key}".`,
          },
          false
        );
      } catch {
        // Ignore key errors
      }
    }

    // Automated Vigenère Coset frequency solver based on estimated key lengths
    for (const kLen of inspection.suggestedVigenereKeyLengths.slice(0, 3)) {
      if (kLen >= 2 && kLen <= 8) {
        const { key: derivedKey, plaintext: crackedPlain } = crackVigenereByLength(currentText, kLen);
        if (derivedKey && crackedPlain) {
          evaluateTransform(
            crackedPlain,
            {
              cipherId: `vigenere_kasiski_${derivedKey}`,
              cipherName: `Vigenère (Solved Key: "${derivedKey}")`,
              category: 'polyalphabetic',
              parameters: { key: derivedKey, keyLength: kLen, method: 'Kasiski Coset Frequency' },
              description: `Recovered key "${derivedKey}" using Kasiski examination and coset frequency fitting.`,
            },
            false
          );
        }
      }
    }

    // ==========================================
    // 4. Transposition Ciphers
    // ==========================================

    // Rail Fence (depth 2 to 8)
    for (let rails = 2; rails <= Math.min(8, Math.floor(currentText.length / 2)); rails++) {
      try {
        const rfDec = railFenceDecrypt(currentText, rails);
        evaluateTransform(
          rfDec,
          {
            cipherId: `rail_fence_${rails}`,
            cipherName: `Rail Fence (${rails} Rails)`,
            category: 'transposition',
            parameters: { rails },
            description: `Zig-zag transposition reconstructed across ${rails} rails.`,
          },
          false
        );
      } catch {
        // Ignore
      }
    }

    // Text Reversal (whole string)
    const reversed = reverseText(currentText);
    evaluateTransform(
      reversed,
      {
        cipherId: 'reverse_full',
        cipherName: 'Reversed Text',
        category: 'transposition',
        parameters: { direction: 'backward' },
        description: 'Read entire text in reverse order.',
      },
      true
    );

    // Word-by-word Reversal
    if (currentText.includes(' ')) {
      const reversedW = reverseWords(currentText);
      evaluateTransform(
        reversedW,
        {
          cipherId: 'reverse_words',
          cipherName: 'Reversed Words',
          category: 'transposition',
          parameters: { scope: 'word' },
          description: 'Reversed individual characters in each word while preserving word boundaries.',
        },
        false
      );
    }

    // ==========================================
    // 5. Matrix Ciphers (Hill 2x2 with popular matrices)
    // ==========================================
    const cleanLetters = currentText.toUpperCase().replace(/[^A-Z]/g, '');
    if (cleanLetters.length >= 4 && cleanLetters.length % 2 === 0) {
      for (let i = 0; i < POPULAR_HILL_MATRICES.length; i++) {
        const m = POPULAR_HILL_MATRICES[i];
        try {
          const hillDec = hillDecrypt2x2(currentText, m);
          const prelimMetrics = scoreCandidate(hillDec, ciphertext.length, nextDepth);
          if (prelimMetrics.totalScore >= 35) {
            evaluateTransform(
              hillDec,
              {
                cipherId: `hill_preset_${i}`,
                cipherName: `Hill Cipher 2x2 Matrix`,
                category: 'matrix',
                parameters: { matrix: `[${m.a}, ${m.b}; ${m.c}, ${m.d}]` },
                description: `Decrypted with 2x2 modular linear algebra matrix.`,
              },
              false
            );
          }
        } catch {
          // Ignore
        }
      }
    }

    // ==========================================
    // 6. XOR (Single-byte brute force)
    // ==========================================
    // Only attempt if text looks binary or if hex was already processed
    if (node.depth === 0 && (inspection.detectedPatterns.isHex || currentText.length < 500)) {
      const xorHits = crackSingleByteXor(currentText);
      for (const hit of xorHits) {
        const prelimMetrics = scoreCandidate(hit.plaintext, ciphertext.length, nextDepth);
        if (prelimMetrics.totalScore >= 45) {
          evaluateTransform(
            hit.plaintext,
            {
              cipherId: `xor_byte_${hit.key}`,
              cipherName: `XOR (Key Byte: 0x${hit.key.toString(16).padStart(2, '0')})`,
              category: 'modern_demonstration',
              parameters: { keyByte: hit.key, hex: `0x${hit.key.toString(16)}` },
              description: `Bitwise exclusive-OR with byte 0x${hit.key.toString(16)}.`,
            },
            true
          );
        }
      }
    }
  }

  // Deduplicate candidates with identical plaintext, keeping the one with fewest steps / highest score
  const uniqueMap = new Map<string, CipherCandidate>();

  for (const cand of candidates) {
    const key = normalize(cand.plaintext);
    const existing = uniqueMap.get(key);
    if (!existing || cand.metrics.totalScore > existing.metrics.totalScore) {
      uniqueMap.set(key, cand);
    }
  }

  const finalCandidates = Array.from(uniqueMap.values());

  // Rank strictly: Most accurate and correct answer first!
  finalCandidates.sort((a, b) => {
    // 1. Total score descending
    if (b.metrics.totalScore !== a.metrics.totalScore) {
      return b.metrics.totalScore - a.metrics.totalScore;
    }
    // 2. Proportion of recognized dictionary words descending
    if (b.metrics.wordMatchRatio !== a.metrics.wordMatchRatio) {
      return b.metrics.wordMatchRatio - a.metrics.wordMatchRatio;
    }
    // 3. Absolute count of recognized words descending
    if (b.metrics.recognizedWords.length !== a.metrics.recognizedWords.length) {
      return b.metrics.recognizedWords.length - a.metrics.recognizedWords.length;
    }
    // 4. Closeness to expected frequency distribution (lower chi-squared is better)
    if (a.metrics.chiSquared !== b.metrics.chiSquared) {
      return a.metrics.chiSquared - b.metrics.chiSquared;
    }
    // 5. Simpler pipeline first (Occam's razor: 1 layer before 2 layers)
    return a.depth - b.depth;
  });

  const elapsedMs = Math.round(performance.now() - startTime);

  return {
    candidates: finalCandidates,
    inspection,
    elapsedMs,
  };
}

function formatParametersSummary(chain: TransformationStep[]): string {
  return chain
    .map((step) => {
      const paramList = Object.entries(step.parameters)
        .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(', ');
      return paramList ? `${step.cipherName} (${paramList})` : step.cipherName;
    })
    .join(' ➔ ');
}

export function generateStepExplanation(chain: TransformationStep[], metrics: ScoringMetrics, targetLang = 'en'): string {
  const stepLabelMap: Record<string, string> = {
    en: 'Step',
    es: 'Paso',
    fr: 'Étape',
    de: 'Schritt',
    it: 'Passo',
    pt: 'Passo',
    ar: 'الخطوة',
    zh: '第',
    ja: 'ステップ',
    ru: 'Шаг',
    hi: 'चरण',
    la: 'Gradus',
  };

  const appliedLabelMap: Record<string, string> = {
    en: 'Applied',
    es: 'Aplicado',
    fr: 'Appliqué',
    de: 'Angewendet',
    it: 'Applicato',
    pt: 'Aplicado',
    ar: 'تم تطبيق',
    zh: '应用',
    ja: '適用',
    ru: 'Применен',
    hi: 'लागू किया',
    la: 'Adhibitum',
  };

  const stepWord = stepLabelMap[targetLang] || 'Step';
  const appliedWord = appliedLabelMap[targetLang] || 'Applied';

  const stepsText = chain
    .map((s, idx) => {
      if (targetLang === 'zh') return `第 ${idx + 1} 步：应用 ${s.cipherName} (${s.description})`;
      if (targetLang === 'ja') return `ステップ ${idx + 1}：${s.cipherName} を適用 (${s.description})`;
      return `${stepWord} ${idx + 1}: ${appliedWord} ${s.cipherName} (${s.description})`;
    })
    .join('. ');

  const langNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ru: 'Russian',
    hi: 'Hindi',
    la: 'Latin',
  };
  const langName = langNames[targetLang] || 'English';

  let scoreComment = '';
  if (targetLang === 'es') {
    if (metrics.totalScore >= 75) {
      scoreComment = `Solución precisa (${metrics.totalScore}/100): ${metrics.recognizedWords.length} palabras reconocidas (${metrics.recognizedWords.slice(0, 5).join(', ')}...), ajuste de frecuencia Chi-cuadrado: ${metrics.frequencyScore}/100, IoC: ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `Solución plausible (${metrics.totalScore}/100): Estructura de letras válida con IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `Confianza moderada (${metrics.totalScore}/100): Estructura parcial o vocabulario específico.`;
    }
    return `${stepsText}. Verificación: ${scoreComment}`;
  }

  if (targetLang === 'fr') {
    if (metrics.totalScore >= 75) {
      scoreComment = `Solution exacte (${metrics.totalScore}/100) : ${metrics.recognizedWords.length} mots reconnus (${metrics.recognizedWords.slice(0, 5).join(', ')}...), ajustement Chi-deux : ${metrics.frequencyScore}/100, IoC : ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `Solution plausible (${metrics.totalScore}/100) : Structure de lettres valide avec IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `Confiance modérée (${metrics.totalScore}/100) : Structure partielle ou vocabulaire inhabituel.`;
    }
    return `${stepsText}. Vérification : ${scoreComment}`;
  }

  if (targetLang === 'de') {
    if (metrics.totalScore >= 75) {
      scoreComment = `Genaue Lösung (${metrics.totalScore}/100): ${metrics.recognizedWords.length} erkannte Wörter (${metrics.recognizedWords.slice(0, 5).join(', ')}...), Chi-Quadrat-Anpassung: ${metrics.frequencyScore}/100, IoC: ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `Plausible Lösung (${metrics.totalScore}/100): Gültige Buchstabenstruktur mit IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `Mäßiges Vertrauen (${metrics.totalScore}/100): Teilweise linguistische Struktur.`;
    }
    return `${stepsText}. Überprüfung: ${scoreComment}`;
  }

  if (targetLang === 'it') {
    if (metrics.totalScore >= 75) {
      scoreComment = `Soluzione accurata (${metrics.totalScore}/100): ${metrics.recognizedWords.length} parole riconosciute (${metrics.recognizedWords.slice(0, 5).join(', ')}...), conformità Chi-quadro: ${metrics.frequencyScore}/100, IoC: ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `Soluzione plausibile (${metrics.totalScore}/100): Struttura valida con IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `Fiducia moderata (${metrics.totalScore}/100): Struttura parziale o vocabolario insolito.`;
    }
    return `${stepsText}. Verifica: ${scoreComment}`;
  }

  if (targetLang === 'pt') {
    if (metrics.totalScore >= 75) {
      scoreComment = `Solução precisa (${metrics.totalScore}/100): ${metrics.recognizedWords.length} palavras reconhecidas (${metrics.recognizedWords.slice(0, 5).join(', ')}...), ajuste de frequência Qui-quadrado: ${metrics.frequencyScore}/100, IoC: ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `Solução plausível (${metrics.totalScore}/100): Estrutura de letras válida com IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `Confiança moderada (${metrics.totalScore}/100): Estrutura linguística parcial.`;
    }
    return `${stepsText}. Verificação: ${scoreComment}`;
  }

  if (targetLang === 'ar') {
    if (metrics.totalScore >= 75) {
      scoreComment = `حل دقيق (${metrics.totalScore}/100): تم التعرف على ${metrics.recognizedWords.length} كلمة (${metrics.recognizedWords.slice(0, 5).join(', ')}...)، وملاءمة توزيع كاي تربيع: ${metrics.frequencyScore}/100، ومؤشر التطابق (IoC): ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `حل محتمل (${metrics.totalScore}/100): بنية أحرف صالحة مع IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `ثقة متوسطة (${metrics.totalScore}/100): بنية جزئية أو كلمات غير اعتيادية.`;
    }
    return `${stepsText}. التحقق: ${scoreComment}`;
  }

  if (targetLang === 'zh') {
    if (metrics.totalScore >= 75) {
      scoreComment = `精确解 (${metrics.totalScore}/100)：成功识别 ${metrics.recognizedWords.length} 个单词 (${metrics.recognizedWords.slice(0, 5).join(', ')}...)，卡方字母频率契合度：${metrics.frequencyScore}/100，重合指数 (IoC)：${metrics.ioc}。`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `合理解 (${metrics.totalScore}/100)：具有标准字母结构，IoC 为 ${metrics.ioc}。`;
    } else {
      scoreComment = `中等置信度 (${metrics.totalScore}/100)：部分语言结构或非常用词汇。`;
    }
    return `${stepsText}。验证：${scoreComment}`;
  }

  if (targetLang === 'ja') {
    if (metrics.totalScore >= 75) {
      scoreComment = `正確な復号解 (${metrics.totalScore}/100)：${metrics.recognizedWords.length} 個の認識された単語 (${metrics.recognizedWords.slice(0, 5).join(', ')}...)、カイ二乗頻度適合度：${metrics.frequencyScore}/100、一致指数 (IoC)：${metrics.ioc}。`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `妥当な解 (${metrics.totalScore}/100)：有効な文字構造、IoC は ${metrics.ioc}。`;
    } else {
      scoreComment = `中程度の信頼度 (${metrics.totalScore}/100)：部分的な言語構造または特異な語彙。`;
    }
    return `${stepsText}。検証：${scoreComment}`;
  }

  if (targetLang === 'ru') {
    if (metrics.totalScore >= 75) {
      scoreComment = `Точное решение (${metrics.totalScore}/100): Распознано слов: ${metrics.recognizedWords.length} (${metrics.recognizedWords.slice(0, 5).join(', ')}...), соответствие Хи-квадрат: ${metrics.frequencyScore}/100, индекс совпадений (IoC): ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `Правдоподобное решение (${metrics.totalScore}/100): Достоверная структура с IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `Умеренная уверенность (${metrics.totalScore}/100): Частичная лингвистическая структура.`;
    }
    return `${stepsText}. Проверка: ${scoreComment}`;
  }

  if (targetLang === 'hi') {
    if (metrics.totalScore >= 75) {
      scoreComment = `सटीक समाधान (${metrics.totalScore}/100): ${metrics.recognizedWords.length} पहचाने गए शब्द (${metrics.recognizedWords.slice(0, 5).join(', ')}...), काई-वर्ग आवृत्ति उपयुक्तता: ${metrics.frequencyScore}/100, संयोग सूचकांक (IoC): ${metrics.ioc}।`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `संभावित समाधान (${metrics.totalScore}/100): वैध वर्ण संरचना, IoC ${metrics.ioc}।`;
    } else {
      scoreComment = `मध्यम विश्वास (${metrics.totalScore}/100): आंशिक भाषाई संरचना।`;
    }
    return `${stepsText}। सत्यापन: ${scoreComment}`;
  }

  if (targetLang === 'la') {
    if (metrics.totalScore >= 75) {
      scoreComment = `Solutio accurata (${metrics.totalScore}/100): ${metrics.recognizedWords.length} verba agnita (${metrics.recognizedWords.slice(0, 5).join(', ')}...), Chi-quadratum: ${metrics.frequencyScore}/100, IoC: ${metrics.ioc}.`;
    } else if (metrics.totalScore >= 50) {
      scoreComment = `Solutio probabilis (${metrics.totalScore}/100): Structura litterarum valida cum IoC ${metrics.ioc}.`;
    } else {
      scoreComment = `Fides moderata (${metrics.totalScore}/100): Structura partialis.`;
    }
    return `${stepsText}. Probatio: ${scoreComment}`;
  }

  // Default English
  if (metrics.totalScore >= 75) {
    scoreComment = `Accurate solution (${metrics.totalScore}/100): ${metrics.recognizedWords.length} recognized ${langName} vocabulary words (${metrics.recognizedWords.slice(0, 5).join(', ')}...), Chi-squared frequency fit: ${metrics.frequencyScore}/100, IoC: ${metrics.ioc}.`;
  } else if (metrics.totalScore >= 50) {
    scoreComment = `Plausible solution (${metrics.totalScore}/100): Valid letter structure with IoC ${metrics.ioc} against ${langName} standard.`;
  } else {
    scoreComment = `Low confidence (${metrics.totalScore}/100): Partial linguistic structure or unusual vocabulary.`;
  }

  return `${stepsText}. Verification: ${scoreComment}`;
}
