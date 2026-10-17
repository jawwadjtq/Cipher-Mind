/**
 * CipherMind AI - History & Session Drawer Modal
 * Session history with clear-all controls and privacy safeguards
 */

import React from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, History } from 'lucide-react';
import { CipherCandidate } from '../crypto/types';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

export interface HistoryItem {
  id: string;
  timestamp: string;
  inputSnippet: string;
  topCipher?: string;
  topScore?: number;
  totalCandidates: number;
  fullInput: string;
}

interface HistoryModalProps {
  history: HistoryItem[];
  onClose: () => void;
  onClearHistory: () => void;
  onSelectHistoryItem: (text: string) => void;
  userLanguage?: SupportedLanguage;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onClose,
  onClearHistory,
  onSelectHistoryItem,
  userLanguage = 'en',
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t.history}</h2>
              <p className="text-xs text-slate-400">
                Temporary local session runs. Stored in memory; not transmitted to any external database.
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

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-3.5 flex items-center justify-between gap-3 hover:border-slate-700/80 hover:bg-slate-900/50 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-200 truncate">
                      {item.topCipher || 'Analysis Run'}
                    </span>
                    {typeof item.topScore === 'number' && (
                      <span className="rounded bg-indigo-950/60 border border-indigo-700/40 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300">
                        Score {item.topScore}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-400 truncate">
                    {item.inputSnippet}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectHistoryItem(item.fullInput);
                    onClose();
                  }}
                  className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                >
                  <span>Load</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <p>No analysis history yet in this session.</p>
              <p className="text-[11px] text-slate-600">
                Run an auto-solve operation to see results archived here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          {history.length > 0 ? (
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Session History</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
