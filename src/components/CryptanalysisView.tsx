/**
 * CipherMind AI - Cryptanalysis Inspector
 * In-depth statistical analysis: Frequency bars, IoC meter, Kasiski n-gram repetitions, entropy
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Activity,
  Hash,
  Binary,
  Layers,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { inspectInput } from '../crypto/solver';
import { ENGLISH_LETTER_FREQUENCIES, ENGLISH_IOC, RANDOM_IOC } from '../crypto/frequencies';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

interface CryptanalysisViewProps {
  initialText?: string;
  onSendToSolver: (text: string) => void;
  userLanguage?: SupportedLanguage;
}

export const CryptanalysisView: React.FC<CryptanalysisViewProps> = ({
  initialText = '',
  onSendToSolver,
  userLanguage = 'en',
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;
  const [text, setText] = useState(
    initialText || 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ'
  );

  const inspection = inspectInput(text);

  // Maximum frequency for bar scaling
  const maxFreq = Math.max(
    ...Object.values(inspection.letterFrequencies),
    ...Object.values(ENGLISH_LETTER_FREQUENCIES),
    15
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            {t.analysisTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t.analysisSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSendToSolver(text)}
          disabled={!text.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t.autoSolveAll}</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="mb-6 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
        <label htmlFor="cryptanalysis-text-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Ciphertext for Statistical Analysis
        </label>
        <textarea
          id="cryptanalysis-text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Paste ciphertext to analyze frequency and structure..."
          className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Index of Coincidence */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
          <span className="text-xs text-slate-400 block mb-1">Index of Coincidence (IoC)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {inspection.ioc}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            English: ~0.0667 · Random: ~0.0385
          </span>
          <div className="mt-2 text-[11px]">
            {inspection.ioc >= 0.058 ? (
              <span className="text-emerald-400 font-medium">Likely Monoalphabetic (Shift/Sub)</span>
            ) : inspection.ioc >= 0.045 ? (
              <span className="text-amber-400 font-medium">Likely Polyalphabetic (Vigenère)</span>
            ) : (
              <span className="text-slate-400 font-medium">High Entropy or Random / Short</span>
            )}
          </div>
        </div>

        {/* Metric 2: Chi-Squared vs English */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
          <span className="text-xs text-slate-400 block mb-1">Chi-Squared (vs English)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
              {inspection.chiSquaredToEnglish}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Lower is closer to natural English
          </span>
          <div className="mt-2 text-[11px]">
            {inspection.chiSquaredToEnglish < 35 ? (
              <span className="text-emerald-400 font-medium">Close English Fit (&lt;35)</span>
            ) : (
              <span className="text-slate-400 font-medium">Shifted / Encrypted (&gt;35)</span>
            )}
          </div>
        </div>

        {/* Metric 3: Shannon Entropy */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
          <span className="text-xs text-slate-400 block mb-1">Shannon Entropy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-violet-400 tabular-nums">
              {inspection.entropy}
            </span>
            <span className="text-xs text-slate-500">bits</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Uniform 26-char max: 4.70 bits
          </span>
          <div className="mt-2 text-[11px] text-slate-400">
            Natural English is typically 3.5 - 4.2
          </div>
        </div>

        {/* Metric 4: Character Totals */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
          <span className="text-xs text-slate-400 block mb-1">Corpus Size</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
              {inspection.totalLetters}
            </span>
            <span className="text-xs text-slate-500">letters</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Total Chars: {inspection.totalCharacters}
          </span>
          <div className="mt-2 text-[11px] text-slate-400">
            Avg Word: {inspection.detectedPatterns.averageWordLength} chars
          </div>
        </div>
      </div>

      {/* Letter Frequency Distribution Chart */}
      <div className="mb-6 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Monogram Frequency Distribution (A - Z)
            </h3>
            <p className="text-xs text-slate-400">
              Observed frequencies (purple) compared against standard English baseline (dotted blue).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-indigo-500" />
              <span className="text-slate-300">Observed %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-slate-600" />
              <span className="text-slate-400">English Standard %</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 min-w-[620px] pt-4 px-2 border-b border-slate-800 font-mono text-[11px]">
            {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((char) => {
              const obs = inspection.letterFrequencies[char] || 0;
              const exp = ENGLISH_LETTER_FREQUENCIES[char] || 0;
              const obsHeight = Math.min(100, (obs / maxFreq) * 100);
              const expHeight = Math.min(100, (exp / maxFreq) * 100);

              return (
                <div key={char} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-0.5 h-full relative">
                    {/* Observed Frequency Bar */}
                    <div
                      style={{ height: `${obsHeight}%` }}
                      className="w-full max-w-[12px] bg-indigo-500 rounded-t-sm transition-all group-hover:bg-indigo-400"
                      title={`${char}: Observed ${obs.toFixed(1)}% (Count: ${inspection.letterCounts[char]})`}
                    />
                    {/* Expected Standard Bar */}
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-full max-w-[6px] bg-slate-700/80 rounded-t-sm transition-all"
                      title={`${char}: Standard English ${exp.toFixed(1)}%`}
                    />
                  </div>
                  <span className="text-slate-300 font-bold">{char}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kasiski Examination & N-gram Repetitions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Kasiski Examination (Repeated N-Grams)
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Identifies repeated patterns of 3+ letters to estimate likely polyalphabetic key lengths.
          </p>

          {inspection.repeatedNgrams.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {inspection.repeatedNgrams.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 text-xs font-mono border border-slate-800/60"
                >
                  <span className="font-bold text-indigo-400">{item.ngram}</span>
                  <span className="text-slate-400">Repeated {item.count}×</span>
                  <span className="text-slate-500">
                    Distances: {item.distances.slice(0, 3).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-slate-950/60 p-4 text-center text-xs text-slate-500">
              No repeated 3-grams found in this sample length. Longer ciphertexts reveal clearer periodic intervals.
            </div>
          )}

          {inspection.suggestedVigenereKeyLengths.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs">
              <span className="text-slate-400">Estimated Vigenère Key Lengths: </span>
              <span className="font-mono font-bold text-indigo-300">
                {inspection.suggestedVigenereKeyLengths.join(', ')} letters
              </span>
            </div>
          )}
        </div>

        {/* Encoding & Format Signatures */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Encoding & Format Signatures
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Heuristic detection of digital representations and special character classes.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800/60">
              <span className="text-slate-300">Base64 / Base64URL Pattern</span>
              <span
                className={`font-mono text-xs font-semibold ${
                  inspection.detectedPatterns.isBase64 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {inspection.detectedPatterns.isBase64 ? 'Detected' : 'Negative'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800/60">
              <span className="text-slate-300">Hexadecimal Sequence</span>
              <span
                className={`font-mono text-xs font-semibold ${
                  inspection.detectedPatterns.isHex ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {inspection.detectedPatterns.isHex ? 'Detected' : 'Negative'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800/60">
              <span className="text-slate-300">8-Bit Binary Stream</span>
              <span
                className={`font-mono text-xs font-semibold ${
                  inspection.detectedPatterns.isBinary ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {inspection.detectedPatterns.isBinary ? 'Detected' : 'Negative'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800/60">
              <span className="text-slate-300">International Morse Code</span>
              <span
                className={`font-mono text-xs font-semibold ${
                  inspection.detectedPatterns.isMorse ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {inspection.detectedPatterns.isMorse ? 'Detected' : 'Negative'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
