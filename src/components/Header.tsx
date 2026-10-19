/**
 * CipherMind AI - Header Component
 * Strict Top Bar Contract: Brand Wordmark | Single-line Nav Tabs | Language Picker & Primary Action
 */

import React from 'react';
import {
  Shield,
  KeyRound,
  Unlock,
  BarChart3,
  BookOpen,
  History,
  CheckCircle2,
  Sparkles,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../locales/translations';

export type ActiveTab = 'autosolve' | 'encrypt' | 'decrypt' | 'cryptanalysis' | 'library';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenDiagnostic: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  userLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenDiagnostic,
  onOpenHistory,
  historyCount,
  userLanguage,
  onSelectLanguage,
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <button
            onClick={() => onSelectTab('autosolve')}
            className="flex items-center gap-2.5 text-left font-bold tracking-tight text-slate-100 hover:text-white transition-colors"
          >
            <div>
              <span className="text-lg">CipherMind</span>
              <span className="ml-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">AI</span>
            </div>
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 shadow-sm">
              Made by Jawad
            </span>
          </button>
        </div>

        {/* Zone 2: Clean Single-line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800/60">
          <button
            onClick={() => onSelectTab('autosolve')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'autosolve'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.navAutoSolve}</span>
          </button>

          <button
            onClick={() => onSelectTab('encrypt')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'encrypt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>{t.navEncrypt}</span>
          </button>

          <button
            onClick={() => onSelectTab('decrypt')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'decrypt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Unlock className="h-3.5 w-3.5" />
            <span>{t.navDecrypt}</span>
          </button>

          <button
            onClick={() => onSelectTab('cryptanalysis')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cryptanalysis'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{t.navCryptanalysis}</span>
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{t.navLibrary}</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Language Selector, History & Self-Test) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User's Choice Language Selector */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 pl-2.5 pr-2 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 transition-colors">
              <Globe className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <select
                aria-label={t.languageSelectLabel}
                value={userLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
                className="appearance-none bg-transparent pr-4 text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-slate-400" />
            </div>
          </div>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            title={t.history}
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t.history}</span>
            {historyCount > 0 && (
              <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-indigo-400">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenDiagnostic}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all whitespace-nowrap shrink-0 hover:shadow-indigo-500/20"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.selfTestSuite}</span>
            <span className="sm:hidden">Test</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex lg:hidden border-t border-slate-800/60 bg-slate-950 px-2 py-1.5 overflow-x-auto gap-1">
        <button
          onClick={() => onSelectTab('autosolve')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'autosolve' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>{t.navAutoSolve}</span>
        </button>
        <button
          onClick={() => onSelectTab('encrypt')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'encrypt' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <KeyRound className="h-3 w-3" />
          <span>{t.navEncrypt}</span>
        </button>
        <button
          onClick={() => onSelectTab('decrypt')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'decrypt' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Unlock className="h-3 w-3" />
          <span>{t.navDecrypt}</span>
        </button>
        <button
          onClick={() => onSelectTab('cryptanalysis')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'cryptanalysis' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="h-3 w-3" />
          <span>{t.navCryptanalysis}</span>
        </button>
        <button
          onClick={() => onSelectTab('library')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'library' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <BookOpen className="h-3 w-3" />
          <span>{t.navLibrary}</span>
        </button>
      </div>
    </header>
  );
};
