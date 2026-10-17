/**
 * CipherMind AI - Cipher Reference Library View
 * Searchable educational encyclopedia of historical ciphers, encodings, and formulas
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  KeyRound,
  Unlock,
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { CIPHER_REGISTRY } from '../crypto/registry';
import { CipherCategory, CipherDefinition } from '../crypto/types';
import { SupportedLanguage, TRANSLATIONS } from '../locales/translations';

interface CipherLibraryViewProps {
  onOpenInEncrypt: (cipherId: string) => void;
  onOpenInDecrypt: (cipherId: string) => void;
  userLanguage?: SupportedLanguage;
}

export const CipherLibraryView: React.FC<CipherLibraryViewProps> = ({
  onOpenInEncrypt,
  onOpenInDecrypt,
  userLanguage = 'en',
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string>('caesar');

  const filteredCiphers = CIPHER_REGISTRY.filter((cipher) => {
    const matchesCategory =
      selectedCategory === 'all' || cipher.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      cipher.name.toLowerCase().includes(query) ||
      cipher.shortDescription.toLowerCase().includes(query) ||
      cipher.historicalContext.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-6 border-b border-slate-800/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          {t.libraryTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.librarySubtitle}
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ciphers by name, formula, or history..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Ciphers' },
            { id: 'substitution', label: 'Substitution' },
            { id: 'polyalphabetic', label: 'Polyalphabetic' },
            { id: 'transposition', label: 'Transposition' },
            { id: 'matrix', label: 'Matrix/Digraph' },
            { id: 'encoding', label: 'Encodings' },
            { id: 'modern_demonstration', label: 'Modern/XOR' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notice on Encodings vs Encryption */}
      <div className="mb-6 rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-3.5 text-xs text-indigo-300 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Cryptographic Distinction:</strong> Digital formats such as <em>Base64</em>, <em>Hexadecimal</em>,
          and <em>Morse Code</em> are <strong>encodings</strong>, not encryption. They represent data for safe
          transmission without a secret key and provide zero confidentiality.
        </p>
      </div>

      {/* Grid of Ciphers */}
      <div className="space-y-4">
        {filteredCiphers.map((cipher) => {
          const isExpanded = expandedId === cipher.id;

          return (
            <div
              key={cipher.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/40 transition-all hover:border-slate-700/80"
            >
              {/* Card Header & Toggle */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : cipher.id)}
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-indigo-400 font-mono text-xs font-bold shrink-0">
                    {cipher.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-100">{cipher.name}</h2>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-800/70 px-2 py-0.5 rounded">
                        {cipher.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cipher.shortDescription}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInEncrypt(cipher.id);
                      }}
                      className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>Encrypt</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInDecrypt(cipher.id);
                      }}
                      className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <Unlock className="h-3 w-3" />
                      <span>Decrypt</span>
                    </button>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {/* Expanded Detail Pane */}
              {isExpanded && (
                <div className="border-t border-slate-800/60 p-4 sm:p-5 space-y-4 text-xs bg-slate-950/40 rounded-b-xl">
                  {/* Historical Background */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                      Historical Context
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{cipher.historicalContext}</p>
                  </div>

                  {/* Mathematical Formula & Key Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800/80">
                      <h3 className="font-semibold text-slate-300 mb-1">Mathematical Formula</h3>
                      <pre className="font-mono text-indigo-300 whitespace-pre-wrap">{cipher.formula}</pre>
                    </div>
                    <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800/80">
                      <h3 className="font-semibold text-slate-300 mb-1">Key Requirements</h3>
                      <p className="text-slate-300">{cipher.keyRequirements}</p>
                    </div>
                  </div>

                  {/* Worked Example */}
                  <div className="rounded-lg bg-slate-900/80 p-3.5 border border-slate-800/80 space-y-2">
                    <h3 className="font-semibold text-slate-300">Worked Step-by-Step Example</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Plaintext</span>
                        <span className="text-emerald-400">{cipher.workedExample.plaintext}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Key</span>
                        <span className="text-amber-400">{typeof cipher.workedExample.key === 'string' ? cipher.workedExample.key : JSON.stringify(cipher.workedExample.key)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Ciphertext</span>
                        <span className="text-indigo-400">{cipher.workedExample.ciphertext}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-[11px] pt-1">{cipher.workedExample.explanation}</p>
                  </div>

                  {/* Vulnerabilities & Cryptanalysis Limitations */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1">
                      Cryptanalysis & Known Limitations
                    </h3>
                    <p className="text-slate-400 leading-relaxed">{cipher.limitations}</p>
                  </div>

                  {/* Mobile Quick Action Buttons */}
                  <div className="flex sm:hidden items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenInEncrypt(cipher.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-md bg-slate-800 py-1.5 text-xs text-slate-200"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>Open in Encrypt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenInDecrypt(cipher.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-md bg-slate-800 py-1.5 text-xs text-slate-200"
                    >
                      <Unlock className="h-3 w-3" />
                      <span>Open in Decrypt</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
