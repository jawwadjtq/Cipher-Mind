/**
 * CipherMind AI - Cryptographic Types & Interfaces
 */

export type CipherCategory =
  | 'substitution'
  | 'polyalphabetic'
  | 'transposition'
  | 'matrix'
  | 'encoding'
  | 'modern_demonstration';

export interface TransformationStep {
  cipherId: string;
  cipherName: string;
  category: CipherCategory;
  parameters: Record<string, any>;
  inputText: string;
  outputText: string;
  description: string;
}

export interface ScoringMetrics {
  totalScore: number; // 0 to 100
  dictionaryScore: number; // 0 to 100
  frequencyScore: number; // 0 to 100 (Chi-squared fitness)
  iocScore: number; // 0 to 100
  readabilityScore: number; // 0 to 100
  ngramScore: number; // 0 to 100
  recognizedWords: string[];
  totalWords: number;
  wordMatchRatio: number;
  chiSquared: number;
  ioc: number;
}

export interface CipherCandidate {
  id: string;
  plaintext: string;
  originalCiphertext: string;
  transformationChain: TransformationStep[];
  primaryCipherName: string;
  primaryCategory: CipherCategory;
  depth: number;
  metrics: ScoringMetrics;
  parametersSummary: string;
  explanation: string;
  isDeterministic: boolean;
  aiExplanation?: string;
}

export interface CipherDefinition {
  id: string;
  name: string;
  category: CipherCategory;
  shortDescription: string;
  historicalContext: string;
  formula: string;
  keyRequirements: string;
  limitations: string;
  workedExample: {
    plaintext: string;
    key: string | Record<string, any>;
    ciphertext: string;
    explanation: string;
  };
  supportedInAutoSolver: boolean;
}

export interface FrequencyAnalysis {
  letterCounts: Record<string, number>;
  letterFrequencies: Record<string, number>;
  totalLetters: number;
  totalCharacters: number;
  ioc: number; // Index of Coincidence
  entropy: number;
  chiSquaredToEnglish: number;
  detectedPatterns: {
    isHex: boolean;
    isBase64: boolean;
    isBinary: boolean;
    isMorse: boolean;
    isUrlEncoded: boolean;
    hasPunctuation: boolean;
    averageWordLength: number;
  };
  repeatedNgrams: Array<{ ngram: string; count: number; distances: number[] }>;
  suggestedVigenereKeyLengths: number[];
}

export interface AutoSolveOptions {
  maxDepth?: number;
  expectedLanguage?: string;
  crib?: string;
  knownKey?: string;
  filterLowConfidence?: boolean;
}
