/**
 * CipherMind AI - Candidate Scorer Engine
 * Multidimensional statistical and lexical scoring system
 */

import {
  calculateChiSquared,
  calculateIoC,
  calculateEntropy,
  COMMON_BIGRAMS,
  COMMON_TRIGRAMS,
  getLanguageDictionary,
  getExpectedIoC,
  ENGLISH_IOC,
} from './frequencies';
import { ScoringMetrics } from './types';

/**
 * Evaluates candidate plaintext for linguistic plausibility in the expected language
 */
export function scoreCandidate(
  text: string,
  originalLength: number,
  depth = 1,
  language = 'en'
): ScoringMetrics {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) {
    return {
      totalScore: 0,
      dictionaryScore: 0,
      frequencyScore: 0,
      iocScore: 0,
      readabilityScore: 0,
      ngramScore: 0,
      recognizedWords: [],
      totalWords: 0,
      wordMatchRatio: 0,
      chiSquared: 9999,
      ioc: 0,
    };
  }

  // 1. Readability & Printable sanity
  let printableCount = 0;
  let letterCount = 0;
  let spaceCount = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      printableCount++;
    }
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      letterCount++;
    }
    if (code === 32) {
      spaceCount++;
    }
  }

  const printableRatio = printableCount / text.length;
  if (printableRatio < 0.75) {
    // If not mostly printable ASCII, penalize drastically
    return {
      totalScore: Math.round(printableRatio * 15),
      dictionaryScore: 0,
      frequencyScore: 0,
      iocScore: 0,
      readabilityScore: Math.round(printableRatio * 30),
      ngramScore: 0,
      recognizedWords: [],
      totalWords: 0,
      wordMatchRatio: 0,
      chiSquared: 9999,
      ioc: 0,
    };
  }

  // 2. Tokenize into words and check dictionary matches using target language dictionary
  const rawWords = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const dictionary = getLanguageDictionary(language);
  const recognizedWords: string[] = [];
  let totalCharsInRecognized = 0;
  let totalCharsInWords = 0;

  for (const word of rawWords) {
    totalCharsInWords += word.length;
    if (dictionary.has(word)) {
      recognizedWords.push(word);
      totalCharsInRecognized += word.length;
    }
  }

  const totalWords = rawWords.length;
  const wordCountRatio = totalWords > 0 ? recognizedWords.length / totalWords : 0;
  const charWeightRatio = totalCharsInWords > 0 ? totalCharsInRecognized / totalCharsInWords : 0;
  const wordMatchRatio = (wordCountRatio * 0.4 + charWeightRatio * 0.6);

  // Dictionary score (0 to 100)
  const dictionaryScore = Math.min(100, Math.round(wordMatchRatio * 100));

  // 3. Frequency Analysis (Chi-Squared vs target language)
  const chiSq = calculateChiSquared(text, language);
  let frequencyScore = 0;
  if (letterCount >= 8) {
    if (chiSq < 20) {
      frequencyScore = 100;
    } else if (chiSq < 40) {
      frequencyScore = 90 - (chiSq - 20) * 1.5;
    } else if (chiSq < 80) {
      frequencyScore = 60 - (chiSq - 40) * 0.75;
    } else if (chiSq < 150) {
      frequencyScore = 30 - (chiSq - 80) * 0.35;
    } else {
      frequencyScore = Math.max(0, 10 - (chiSq - 150) * 0.05);
    }
  } else {
    frequencyScore = dictionaryScore;
  }
  frequencyScore = Math.round(Math.max(0, Math.min(100, frequencyScore)));

  // 4. Index of Coincidence (IoC compared against target language expectation)
  const ioc = calculateIoC(text);
  const expectedIoC = getExpectedIoC(language);
  let iocScore = 0;
  if (letterCount >= 15) {
    const diff = Math.abs(ioc - expectedIoC);
    if (diff < 0.008) {
      iocScore = 100;
    } else if (diff < 0.015) {
      iocScore = 80;
    } else if (diff < 0.025) {
      iocScore = 55;
    } else {
      iocScore = Math.max(0, 30 - diff * 300);
    }
  } else {
    iocScore = dictionaryScore;
  }
  iocScore = Math.round(Math.max(0, Math.min(100, iocScore)));

  // 5. N-gram scoring (Bigrams and Trigrams)
  let ngramHits = 0;
  let totalNgrams = 0;
  const upperClean = text.toUpperCase().replace(/[^A-Z]/g, '');

  for (let i = 0; i < upperClean.length - 1; i++) {
    const bigram = upperClean.slice(i, i + 2);
    totalNgrams++;
    if (COMMON_BIGRAMS.has(bigram)) {
      ngramHits++;
    }
  }
  for (let i = 0; i < upperClean.length - 2; i++) {
    const trigram = upperClean.slice(i, i + 3);
    if (COMMON_TRIGRAMS.has(trigram)) {
      ngramHits += 1.5;
    }
  }

  const ngramRatio = totalNgrams > 0 ? Math.min(1, ngramHits / (totalNgrams * 0.6)) : 0;
  const ngramScore = Math.round(ngramRatio * 100);

  // 6. Readability: realistic average word length (3.5 to 7.5 is ideal for English)
  let readabilityScore = Math.round(printableRatio * 80);
  if (totalWords > 0) {
    const avgLen = totalCharsInWords / totalWords;
    if (avgLen >= 3.0 && avgLen <= 8.5) {
      readabilityScore += 20;
    } else if (avgLen > 14) {
      // Very long unbroken strings without spaces
      readabilityScore -= 30;
    }
  }
  readabilityScore = Math.round(Math.max(0, Math.min(100, readabilityScore)));

  // Composite Weighted Score
  let composite = 0;
  if (totalWords >= 2 && wordMatchRatio >= 0.5) {
    // Strong dictionary match with multiple words
    composite =
      dictionaryScore * 0.65 +
      frequencyScore * 0.15 +
      ngramScore * 0.10 +
      readabilityScore * 0.10;
  } else if (totalWords >= 2 && wordMatchRatio >= 0.25) {
    // Moderate dictionary match
    composite =
      dictionaryScore * 0.50 +
      frequencyScore * 0.20 +
      ngramScore * 0.15 +
      readabilityScore * 0.15;
  } else if (totalWords >= 2 && wordMatchRatio < 0.25) {
    // Spaced text where words are NOT recognized (random gibberish with spaces)
    const baseline =
      frequencyScore * 0.35 +
      iocScore * 0.25 +
      ngramScore * 0.20 +
      readabilityScore * 0.20;
    // Cap at 38 because random letter groups are not valid English
    composite = Math.min(38, baseline * 0.45);
  } else if (totalWords === 1 && wordMatchRatio > 0.8) {
    // Single recognized word
    composite =
      dictionaryScore * 0.60 +
      frequencyScore * 0.20 +
      readabilityScore * 0.20;
  } else {
    // Continuous cipher block with no spaces (e.g. classical continuous ciphertext)
    composite =
      frequencyScore * 0.45 +
      iocScore * 0.25 +
      ngramScore * 0.20 +
      readabilityScore * 0.10;
  }

  // Slight penalty for excessive transformation depth (Occam's razor in cryptanalysis)
  if (depth > 1) {
    composite -= (depth - 1) * 3;
  }

  const totalScore = Math.round(Math.max(0, Math.min(100, composite)));

  return {
    totalScore,
    dictionaryScore,
    frequencyScore,
    iocScore,
    readabilityScore,
    ngramScore,
    recognizedWords: Array.from(new Set(recognizedWords)),
    totalWords,
    wordMatchRatio: Math.round(wordMatchRatio * 100) / 100,
    chiSquared: Math.round(chiSq * 100) / 100,
    ioc: Math.round(ioc * 10000) / 10000,
  };
}
