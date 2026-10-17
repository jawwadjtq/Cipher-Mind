/**
 * CipherMind AI - Automated Diagnostic Test Runner Modal
 * Interactive in-browser verification suite for all supported algorithms and pipeline features
 */

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Play, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { runCipherDiagnosticTests, TestResult } from '../crypto/__tests__/ciphers.test';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

interface DiagnosticTestModalProps {
  onClose: () => void;
  userLanguage?: SupportedLanguage;
}

export const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({
  onClose,
  userLanguage = 'en',
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [tests, setTests] = useState<TestResult[]>(() => runCipherDiagnosticTests());

  const handleRunAll = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runCipherDiagnosticTests();
      setTests(results);
      setIsRunning(false);
    }, 50);
  };

  const passedCount = tests.filter((t) => t.passed).length;
  const totalCount = tests.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t.selfTestSuite}</h2>
              <p className="text-xs text-slate-400">
                Automated deterministic unit tests verifying all 15 ciphers and auto-solver pipelines.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Summary Bar */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 mb-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span
              className={`font-semibold ${allPassed ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {passedCount} / {totalCount} Tests Passed ({Math.round((passedCount / totalCount) * 100)}%)
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-slate-400">
              Total execution time:{' '}
              {tests.reduce((acc, t) => acc + t.durationMs, 0).toFixed(1)}ms
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunAll}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 font-sans text-xs text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Re-run Tests</span>
          </button>
        </div>

        {/* Test List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {tests.map((test, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/30 p-2.5 hover:bg-slate-900/50"
            >
              <div className="flex items-center gap-2.5">
                {test.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-slate-200">{test.name}</span>
                  <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                    {test.category}
                  </span>
                  {!test.passed && (
                    <p className="text-[11px] text-rose-400 mt-0.5">{test.message}</p>
                  )}
                </div>
              </div>

              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                {test.durationMs}ms
              </span>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end text-xs">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
