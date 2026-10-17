/**
 * CipherMind AI - Candidate Comparison Modal
 * Side-by-side comparative analysis of candidate plaintext outputs and statistical metrics
 */

import React from 'react';
import { X, Check, Copy, ArrowRight, Layers } from 'lucide-react';
import { CipherCandidate } from '../crypto/types';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

interface CandidateCompareModalProps {
  candidates: CipherCandidate[];
  onClose: () => void;
  onUseAsInput: (text: string) => void;
  userLanguage?: SupportedLanguage;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  candidates,
  onClose,
  onUseAsInput,
  userLanguage = 'en',
}) => {
  if (candidates.length === 0) return null;
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{t.compareTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.compareDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Columns Grid */}
        <div className="flex-1 overflow-y-auto">
          <div
            className={`grid gap-4 ${
              candidates.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {candidates.map((cand, idx) => {
              const score = cand.metrics.totalScore;
              const scoreColor =
                score >= 75
                  ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30'
                  : score >= 45
                  ? 'text-amber-400 bg-amber-950/20 border-amber-500/30'
                  : 'text-slate-400 bg-slate-900/40 border-slate-700/40';

              return (
                <div
                  key={cand.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold">
                          Candidate #{idx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-200 mt-0.5">
                          {cand.primaryCipherName}
                        </h4>
                      </div>
                      <div
                        className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold ${scoreColor}`}
                      >
                        Score {score}/100
                      </div>
                    </div>

                    {/* Parameters */}
                    <div className="rounded bg-slate-950/70 p-2 font-mono text-[11px] text-slate-300 border border-slate-800/60">
                      {cand.parametersSummary}
                    </div>

                    {/* Plaintext Box */}
                    <div>
                      <span className="text-xs font-medium text-slate-400 block mb-1">
                        Plaintext Output
                      </span>
                      <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto border border-slate-800 selection:bg-indigo-500/30">
                        <pre className="whitespace-pre-wrap break-words">{cand.plaintext}</pre>
                      </div>
                    </div>

                    {/* Comparative Metrics Table */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                        <span>Recognized Words</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {cand.metrics.recognizedWords.length}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                        <span>Word Match Ratio</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {Math.round(cand.metrics.wordMatchRatio * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                        <span>Chi-Sq Fitness</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {cand.metrics.frequencyScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                        <span>Index of Coincidence</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {cand.metrics.ioc}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-400">
                        <span>Pipeline Depth</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {cand.depth} layer{cand.depth > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUseAsInput(cand.plaintext);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 py-1.5 text-xs font-medium text-white transition-colors"
                    >
                      <span>Use as Input</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
