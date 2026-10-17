/**
 * CipherMind AI - Candidate Step-by-Step Detail Modal
 * Full inspection of intermediate outputs, parameters, and transformation layers
 */

import React, { useState } from 'react';
import { X, Copy, Check, ArrowDown, Layers, CheckCircle2 } from 'lucide-react';
import { CipherCandidate } from '../crypto/types';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

interface CandidateDetailModalProps {
  candidate: CipherCandidate | null;
  onClose: () => void;
  onUseAsInput: (text: string) => void;
  userLanguage?: SupportedLanguage;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onUseAsInput,
  userLanguage = 'en',
}) => {
  if (!candidate) return null;
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">{candidate.primaryCipherName}</h2>
              <span className="rounded bg-indigo-950/60 border border-indigo-700/40 px-2 py-0.5 text-xs font-mono text-indigo-300">
                Score {candidate.metrics.totalScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.stepsDesc}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Explanation Banner */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h4 className="font-semibold text-slate-300 mb-1">Algorithmic Assessment</h4>
            <p className="text-slate-400 leading-relaxed">{candidate.explanation}</p>
          </div>

          {/* Transformation Step Pipeline */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Transformation Pipeline ({candidate.transformationChain.length} {t.stepsTitle})</span>
            </h4>

            <div className="space-y-3">
              {candidate.transformationChain.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {t.step} {idx + 1}: {step.cipherName}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                      {step.category}
                    </span>
                  </div>

                  <p className="text-slate-400">{step.description}</p>

                  {/* Parameters list */}
                  {Object.keys(step.parameters).length > 0 && (
                    <div className="rounded bg-slate-950/80 p-2 font-mono text-[11px] text-slate-300 border border-slate-800/60">
                      Parameters:{' '}
                      {Object.entries(step.parameters)
                        .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
                        .join(', ')}
                    </div>
                  )}

                  {/* Intermediate output preview */}
                  <div>
                    <span className="text-slate-500 block mb-0.5">Intermediate Output:</span>
                    <pre className="rounded bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800/60 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                      {step.outputText}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Plaintext Result */}
          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Final Decrypted Plaintext
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-400 hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="rounded bg-slate-950 p-3 font-mono text-xs text-slate-100 whitespace-pre-wrap break-words border border-slate-800">
              {candidate.plaintext}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-900"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onUseAsInput(candidate.plaintext);
              onClose();
            }}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-semibold text-white hover:bg-indigo-500"
          >
            Use Plaintext as Input
          </button>
        </div>
      </div>
    </div>
  );
};
