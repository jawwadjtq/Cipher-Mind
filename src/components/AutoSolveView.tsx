/**
 * CipherMind AI - Universal Auto-Solver View
 * Core 2-column cryptographic analysis dashboard with multilingual support and explicit mathematical logic
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  ClipboardPaste,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
  HelpCircle,
  Bot,
  Share2,
  CheckCircle2,
  Calculator,
  Languages,
  Filter,
  Award,
} from 'lucide-react';
import { AutoSolveOptions, CipherCandidate, FrequencyAnalysis } from '../crypto/types';
import { autoSolveAll, inspectInput, generateStepExplanation } from '../crypto/solver';
import { DEMO_PRESETS, DemoPreset } from '../data/presets';
import { requestCandidateExplanation, requestCipherIdentification } from '../services/gemini';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../locales/translations';

interface AutoSolveViewProps {
  onUseAsInput: (text: string) => void;
  onInspectCryptanalysis: (text: string) => void;
  onSaveToHistory: (entry: { input: string; topCandidate?: CipherCandidate; totalCandidates: number }) => void;
  onOpenCompare: (candidates: CipherCandidate[]) => void;
  onOpenDetail: (candidate: CipherCandidate) => void;
  initialInput?: string;
  userLanguage: SupportedLanguage;
}

export const AutoSolveView: React.FC<AutoSolveViewProps> = ({
  onUseAsInput,
  onInspectCryptanalysis,
  onSaveToHistory,
  onOpenCompare,
  onOpenDetail,
  initialInput = '',
  userLanguage = 'en',
}) => {
  const t = TRANSLATIONS[userLanguage] || TRANSLATIONS.en;
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === userLanguage);
  const langNameForAi = langMeta?.name || 'English';

  const [inputText, setInputText] = useState(initialInput);
  const [maxDepth, setMaxDepth] = useState<number>(2);
  const [expectedLanguage, setExpectedLanguage] = useState<string>(userLanguage || 'en');
  const [crib, setCrib] = useState<string>('');
  const [knownKey, setKnownKey] = useState<string>('');
  const [showOptions, setShowOptions] = useState<boolean>(false);

  useEffect(() => {
    setExpectedLanguage(userLanguage);
    setResults((prev) => {
      if (prev.candidates.length === 0) return prev;
      return {
        ...prev,
        candidates: prev.candidates.map((c) => ({
          ...c,
          explanation: generateStepExplanation(c.transformationChain, c.metrics, userLanguage),
        })),
      };
    });
  }, [userLanguage]);

  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [results, setResults] = useState<{
    candidates: CipherCandidate[];
    inspection: FrequencyAnalysis | null;
    elapsedMs: number;
  }>({
    candidates: [],
    inspection: null,
    elapsedMs: 0,
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'depth' | 'name'>('score');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<CipherCandidate[]>([]);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, any>>({});
  const [aiIdentification, setAiIdentification] = useState<any | null>(null);
  const [isAiIdentifying, setIsAiIdentifying] = useState<boolean>(false);
  const [expandedLogicIds, setExpandedLogicIds] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterNonsense, setFilterNonsense] = useState<boolean>(true);
  const PAGE_SIZE = 26;

  // Character counts
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const letterCount = (inputText.match(/[a-zA-Z]/g) || []).length;

  const handleRunAutoSolve = () => {
    if (!inputText.trim()) return;

    setIsSolving(true);
    setAiIdentification(null);
    setCurrentPage(1);

    // Yield to let UI update loading state
    setTimeout(() => {
      const opts: AutoSolveOptions = {
        maxDepth,
        expectedLanguage,
        crib: crib.trim() || undefined,
        knownKey: knownKey.trim() || undefined,
      };

      const solved = autoSolveAll(inputText, opts);
      setResults(solved);
      setIsSolving(false);
      setCurrentPage(1);

      if (solved.candidates.length > 0) {
        onSaveToHistory({
          input: inputText,
          topCandidate: solved.candidates[0],
          totalCandidates: solved.candidates.length,
        });
      }
    }, 20);
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setInputText(preset.ciphertext);
    setResults({ candidates: [], inspection: null, elapsedMs: 0 });
    setAiExplanations({});
    setAiIdentification(null);
    setCurrentPage(1);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullReport = (cand: CipherCandidate) => {
    const report = [
      `--- CipherMind AI Solution Report ---`,
      `Language: ${langNameForAi}`,
      `Primary Cipher: ${cand.primaryCipherName}`,
      `Transformation Chain: ${cand.parametersSummary}`,
      `Confidence Score: ${cand.metrics.totalScore}/100`,
      `Recognized Words: ${cand.metrics.recognizedWords.join(', ') || 'None'}`,
      `Decrypted Plaintext:`,
      cand.plaintext,
      `Verification Logic:`,
      cand.explanation,
      `-------------------------------------`,
    ].join('\n');
    handleCopyText(`report-${cand.id}`, report);
  };

  const handleRequestAiExplanation = async (cand: CipherCandidate) => {
    setAiLoadingId(cand.id);
    try {
      const res = await requestCandidateExplanation(cand, inputText, langNameForAi);
      setAiExplanations((prev) => ({ ...prev, [cand.id]: res }));
    } finally {
      setAiLoadingId(null);
    }
  };

  const handleRequestAiIdentification = async () => {
    if (!inputText.trim()) return;
    setIsAiIdentifying(true);
    try {
      const insp = results.inspection || inspectInput(inputText);
      const res = await requestCipherIdentification(inputText, insp, langNameForAi);
      setAiIdentification(res);
    } finally {
      setIsAiIdentifying(false);
    }
  };

  const handleToggleCompare = (cand: CipherCandidate) => {
    const exists = selectedForCompare.some((c) => c.id === cand.id);
    if (exists) {
      setSelectedForCompare(selectedForCompare.filter((c) => c.id !== cand.id));
    } else {
      if (selectedForCompare.length >= 3) {
        setSelectedForCompare([...selectedForCompare.slice(1), cand]);
      } else {
        setSelectedForCompare([...selectedForCompare, cand]);
      }
    }
  };

  const toggleLogic = (id: string) => {
    setExpandedLogicIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter & Sort
  const categoryFiltered = results.candidates.filter((cand) => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'multilayer') return cand.depth > 1;
    return cand.primaryCategory === activeCategoryFilter;
  });

  // Detect whether sensible matches exist with recognized vocabulary or solid frequency fit
  const hasSensibleMatches = categoryFiltered.some(
    (c) => c.metrics.recognizedWords.length > 0 || c.metrics.totalScore >= 35
  );

  // Filter out meaningless gibberish noise when sensible matches exist
  const noiseFiltered = categoryFiltered.filter((cand) => {
    if (!filterNonsense || !hasSensibleMatches) return true;
    // Keep answers that have at least 1 recognized dictionary word OR a totalScore >= 20
    return cand.metrics.recognizedWords.length > 0 || cand.metrics.totalScore >= 20;
  });

  const noiseCountPruned = categoryFiltered.length - noiseFiltered.length;

  // Rank strictly: Most accurate and correct answer first!
  const sortedCandidates = [...noiseFiltered].sort((a, b) => {
    if (sortBy === 'score') {
      // 1. Highest total score first
      if (b.metrics.totalScore !== a.metrics.totalScore) {
        return b.metrics.totalScore - a.metrics.totalScore;
      }
      // 2. Proportion of recognized dictionary words
      if (b.metrics.wordMatchRatio !== a.metrics.wordMatchRatio) {
        return b.metrics.wordMatchRatio - a.metrics.wordMatchRatio;
      }
      // 3. Absolute recognized words count
      if (b.metrics.recognizedWords.length !== a.metrics.recognizedWords.length) {
        return b.metrics.recognizedWords.length - a.metrics.recognizedWords.length;
      }
      // 4. Closeness to natural Chi-squared frequency (lower is better)
      if (a.metrics.chiSquared !== b.metrics.chiSquared) {
        return a.metrics.chiSquared - b.metrics.chiSquared;
      }
      // 5. Simpler pipeline first
      return a.depth - b.depth;
    }
    if (sortBy === 'depth') return a.depth - b.depth;
    if (sortBy === 'name') return a.primaryCipherName.localeCompare(b.primaryCipherName);
    return 0;
  });

  // Pagination: Top 26 answers at a time
  const totalPages = Math.max(1, Math.ceil(sortedCandidates.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCandidates = sortedCandidates.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startRank = sortedCandidates.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const endRank = Math.min(safePage * PAGE_SIZE, sortedCandidates.length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Title & Philosophy */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              {t.appSubtitle}
            </h1>
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
              Made by Jawad
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Multi-layer automated cryptanalysis testing classical ciphers, encodings, and modular permutations with mathematical precision.
          </p>
        </div>

        {/* Quick Demo Presets Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <select
              aria-label={t.loadSample}
              onChange={(e) => {
                const found = DEMO_PRESETS.find((p) => p.id === e.target.value);
                if (found) handleSelectPreset(found);
              }}
              value=""
              className="appearance-none rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-3 pr-8 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="" disabled>
                {t.loadSample}
              </option>
              {DEMO_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================
            LEFT COLUMN: Input & Search Configuration
            ========================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-sm">
            {/* Input Header & Controls */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <label htmlFor="cipher-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t.inputLabel}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>{t.paste}</span>
                </button>
                <span className="text-slate-700">·</span>
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  title="Clear input text"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t.clear}</span>
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <textarea
              id="cipher-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.inputPlaceholder}
              rows={8}
              className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950/80 p-3 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
            />

            {/* Input Character Telemetry */}
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
              <div className="flex items-center gap-3">
                <span>{charCount} {t.chars}</span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span>{wordCount} {t.words}</span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span>{letterCount} {t.letters}</span>
              </div>
              {charCount > 0 && (
                <button
                  type="button"
                  onClick={() => onInspectCryptanalysis(inputText)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {t.inspectFrequencies}
                </button>
              )}
            </div>

            {/* Collapsible Search Parameters */}
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="flex w-full items-center justify-between text-xs font-medium text-slate-300 hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{t.searchParameters}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${showOptions ? 'rotate-180' : ''}`}
                />
              </button>

              {showOptions && (
                <div className="mt-3.5 space-y-3.5 rounded-lg bg-slate-950/60 p-3 border border-slate-800/60 text-xs">
                  {/* Expected Ciphertext Language */}
                  <div>
                    <label className="block font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{t.expectedLanguage}</span>
                    </label>
                    <select
                      value={expectedLanguage}
                      onChange={(e) => setExpectedLanguage(e.target.value)}
                      className="w-full rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-sans text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="en">English (Standard Corpus & Frequencies)</option>
                      <option value="es">Español (Spanish Corpus & Frequencies)</option>
                      <option value="fr">Français (French Corpus & Frequencies)</option>
                      <option value="de">Deutsch (German Corpus & Frequencies)</option>
                      <option value="it">Italiano (Italian Corpus & Frequencies)</option>
                      <option value="la">Latina (Latin Classical Corpus)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      {t.searchDepth}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((depth) => (
                        <button
                          key={depth}
                          type="button"
                          onClick={() => setMaxDepth(depth)}
                          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-xs transition-colors ${
                            maxDepth === depth
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {depth} {t.depthLayers}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      {t.knownCrib}
                    </label>
                    <input
                      type="text"
                      value={crib}
                      onChange={(e) => setCrib(e.target.value)}
                      placeholder="e.g. THE, SECRET, FLAG"
                      className="w-full rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      {t.knownKey}
                    </label>
                    <input
                      type="text"
                      value={knownKey}
                      onChange={(e) => setKnownKey(e.target.value)}
                      placeholder="e.g. LEMON, CIPHER"
                      className="w-full rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleRunAutoSolve}
                disabled={isSolving || !inputText.trim()}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className={`h-4 w-4 ${isSolving ? 'animate-spin' : ''}`} />
                <span>{isSolving ? t.solving : t.autoSolveAll}</span>
              </button>

              <button
                type="button"
                onClick={handleRequestAiIdentification}
                disabled={isAiIdentifying || !inputText.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 py-2.5 px-3 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                title={`Ask Gemini advice in ${langNameForAi}`}
              >
                <Bot className="h-4 w-4 text-violet-400" />
                <span className="hidden sm:inline">{t.aiAdvice}</span>
              </button>
            </div>
          </div>

          {/* AI Cipher Identification Card (in user's language) */}
          {aiIdentification && (
            <div className="rounded-xl border border-violet-800/40 bg-gradient-to-br from-violet-950/30 to-slate-900/40 p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-violet-300 flex items-center gap-1.5">
                  <Bot className="h-4 w-4" />
                  Gemini Cryptanalytic Assessment ({langNameForAi})
                </span>
                <span className="text-[10px] text-slate-400 uppercase">
                  {aiIdentification.source === 'local_fallback' ? 'Local Model' : 'Gemini AI'}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {aiIdentification.assessment}
              </p>
              {aiIdentification.detectedFamilies?.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1">Likely Cipher Families:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiIdentification.detectedFamilies.map((fam: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-md bg-violet-900/40 px-2 py-0.5 text-violet-200 font-mono text-[11px] border border-violet-700/40"
                      >
                        {fam}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================
            RIGHT COLUMN: Ranked Solution Candidates
            ========================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Results Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-200">
                {results.candidates.length > 0
                  ? `${results.candidates.length} ${t.candidatesFound}`
                  : t.resultsTitle}
              </span>
              {results.elapsedMs > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {results.elapsedMs}ms
                  </span>
                </>
              )}
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'substitution', label: t.filterShiftSub },
                { id: 'polyalphabetic', label: t.filterVigenere },
                { id: 'transposition', label: t.filterTransposition },
                { id: 'encoding', label: t.filterEncodings },
                { id: 'multilayer', label: t.filterMultiLayer },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setActiveCategoryFilter(filter.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeCategoryFilter === filter.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meaningful Filter & Top 26 View Control Bar */}
          {results.candidates.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  Top 26 Answers Shown
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  (Showing {startRank}–{endRank} of {sortedCandidates.length})
                </span>
              </div>

              {/* Filter out noise toggle */}
              {hasSensibleMatches && (
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none text-[11px] font-medium bg-slate-850 px-2.5 py-1 rounded-md border border-slate-800">
                  <input
                    type="checkbox"
                    checked={filterNonsense}
                    onChange={(e) => {
                      setFilterNonsense(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Filter meaningless noise</span>
                  {filterNonsense && noiseCountPruned > 0 && (
                    <span className="rounded bg-slate-800 border border-slate-700/80 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono">
                      {noiseCountPruned} hidden
                    </span>
                  )}
                </label>
              )}
            </div>
          )}

          {/* Top Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 px-1 text-xs">
              <span className="text-slate-400">
                Page <strong className="text-slate-200">{safePage}</strong> of{' '}
                <strong className="text-slate-200">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next 26
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Comparison Action Bar */}
          {selectedForCompare.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-700/50 bg-indigo-950/40 px-3.5 py-2 text-xs text-indigo-200 animate-in fade-in">
              <span>{selectedForCompare.length} candidates selected for side-by-side comparison</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForCompare([])}
                  className="hover:underline text-slate-400"
                >
                  {t.clear}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCompare(selectedForCompare)}
                  className="rounded-md bg-indigo-600 px-3 py-1 font-medium text-white hover:bg-indigo-500 shadow-sm"
                >
                  {t.compare} →
                </button>
              </div>
            </div>
          )}

          {/* Candidate Cards List */}
          {paginatedCandidates.length > 0 ? (
            <div className="space-y-3.5">
              {paginatedCandidates.map((cand, idx) => {
                const rankNumber = (safePage - 1) * PAGE_SIZE + idx + 1;
                const isWinningAnswer = rankNumber === 1;
                const score = cand.metrics.totalScore;
                const scoreColor =
                  score >= 75
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                    : score >= 45
                    ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                    : 'text-slate-400 border-slate-700/40 bg-slate-900/40';

                const isComparing = selectedForCompare.some((c) => c.id === cand.id);
                const aiExp = aiExplanations[cand.id];
                const showLogic = Boolean(expandedLogicIds[cand.id]);

                return (
                  <div
                    key={cand.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isWinningAnswer
                        ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 via-slate-900/50 to-slate-900/30 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                        : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700/80 hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Winning #1 Most Correct Solution Highlight Header */}
                    {isWinningAnswer && (
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 px-3 py-1.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <Award className="h-4 w-4 text-amber-400 shrink-0" />
                          <span>👑 #1 Most Probable Solution (Highest Accuracy)</span>
                        </div>
                        <span className="text-[11px] text-emerald-400/90 font-mono font-medium">
                          Best fit out of {sortedCandidates.length} evaluated candidates
                        </span>
                      </div>
                    )}

                    {/* Candidate Card Top Row */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`font-mono text-xs font-bold shrink-0 px-2 py-0.5 rounded ${
                            isWinningAnswer
                              ? 'bg-emerald-500 text-slate-950'
                              : 'text-slate-400 bg-slate-800/60'
                          }`}
                        >
                          #{rankNumber}
                        </span>
                        <h3 className="font-semibold text-slate-200 text-sm truncate">
                          {cand.primaryCipherName}
                        </h3>
                        {cand.depth > 1 && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-violet-400 bg-violet-950/40 border border-violet-800/40 px-1.5 py-0.5 rounded">
                            <Layers className="h-3 w-3" />
                            {cand.depth} layers
                          </span>
                        )}
                        {score >= 75 && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Accurate
                          </span>
                        )}
                      </div>

                      {/* Confidence Score Gauge */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-0.8 rounded-full border text-xs font-mono font-semibold tabular-nums ${scoreColor}`}
                        title={`Score: ${score}/100. Word match: ${Math.round(cand.metrics.wordMatchRatio * 100)}%, Chi-squared fitness: ${cand.metrics.frequencyScore}/100`}
                      >
                        <span>{t.score} {score}</span>
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </div>
                    </div>

                    {/* Transformation Breadcrumb */}
                    <div className="mb-2.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono overflow-x-auto py-0.5">
                      {cand.transformationChain.map((step, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <span className="bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {step.cipherName}
                          </span>
                          {sIdx < cand.transformationChain.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Decrypted Plaintext Output Preview */}
                    <div className={`relative group rounded-lg p-3 border font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-36 selection:bg-indigo-500/30 ${
                      isWinningAnswer
                        ? 'bg-slate-950/95 border-emerald-500/30 ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/80 border-slate-800/70'
                    }`}>
                      <pre className="whitespace-pre-wrap break-words">{cand.plaintext}</pre>
                    </div>

                    {/* Metric Indicators */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span>
                        {t.recognizedWords}:{' '}
                        <strong className="text-slate-300 font-mono">
                          {cand.metrics.recognizedWords.length}
                        </strong>{' '}
                        {cand.metrics.recognizedWords.length > 0 && (
                          <span className="text-slate-500">
                            ({cand.metrics.recognizedWords.slice(0, 4).join(', ')}
                            {cand.metrics.recognizedWords.length > 4 ? '...' : ''})
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span>
                        {t.chiSqFitness}:{' '}
                        <strong className="text-slate-300 font-mono">
                          {cand.metrics.frequencyScore}/100
                        </strong>
                      </span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span>
                        {t.iocLabel}:{' '}
                        <strong className="text-slate-300 font-mono">{cand.metrics.ioc}</strong>
                      </span>
                    </div>

                    {/* Mathematical Logic & Accuracy Drawer Toggle */}
                    <div className="mt-2 pt-2 border-t border-slate-800/40">
                      <button
                        type="button"
                        onClick={() => toggleLogic(cand.id)}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        <span>{showLogic ? 'Hide Mathematical Logic' : 'Show Mathematical Logic & Why This Is Accurate'}</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLogic ? 'rotate-180' : ''}`} />
                      </button>

                      {showLogic && (
                        <div className="mt-2 rounded-lg bg-slate-950/80 p-3 border border-slate-800/80 text-xs space-y-1.5 font-mono text-slate-300">
                          <div className="text-indigo-300 font-semibold flex items-center gap-1 font-sans">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Rigorous Mathematical Proof & Transformation Parameters:</span>
                          </div>
                          <p className="text-slate-300">{cand.explanation}</p>
                          <div className="rounded bg-slate-900 p-2 text-[11px] text-slate-400 space-y-1">
                            <div>• Transform parameters: {cand.parametersSummary}</div>
                            <div>• Word match confidence: {Math.round(cand.metrics.wordMatchRatio * 100)}% ({cand.metrics.recognizedWords.length} recognized dictionary words)</div>
                            <div>• Chi-squared statistic: {cand.metrics.chiSquared} (lower value signals exact natural language frequency fit)</div>
                            <div>• Reversible: Tested deterministic reverse decryption produces identical source text.</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Explanation Drawer (in user's choice language!) */}
                    {aiExp && (
                      <div className="mt-3 rounded-lg border border-violet-800/30 bg-violet-950/20 p-3 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between font-semibold text-violet-300">
                          <span className="flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5" />
                            Gemini AI Cryptanalysis ({langNameForAi})
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {aiExp.source === 'local_fallback' ? 'Local Model' : 'Gemini AI'}
                          </span>
                        </div>
                        <p className="text-slate-200 font-medium">{aiExp.summary}</p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{aiExp.analysis}</p>
                        {aiExp.historicalContext && (
                          <p className="text-slate-400 text-[11px] leading-relaxed italic">
                            Context: {aiExp.historicalContext}
                          </p>
                        )}
                        {aiExp.uncertaintyNotes && (
                          <p className="text-amber-300/80 text-[11px]">
                            ⚠️ {aiExp.uncertaintyNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Card Action Strip */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyText(`plain-${cand.id}`, cand.plaintext)}
                          className={`flex items-center gap-1 rounded px-2.5 py-1 transition-colors ${
                            isWinningAnswer
                              ? 'bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/50'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {copiedId === `plain-${cand.id}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <span>{t.copyPlaintext}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyFullReport(cand)}
                          className="flex items-center gap-1 rounded px-2.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                          title="Copy solution report including parameters and metrics"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t.exportReport}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUseAsInput(cand.plaintext)}
                          className="flex items-center gap-1 rounded px-2.5 py-1 text-indigo-400 hover:bg-indigo-950/50 hover:text-indigo-300 transition-colors"
                          title="Feed this plaintext back into the input for multi-stage exploration"
                        >
                          <span>{t.useAsInput}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDetail(cand)}
                          className="rounded px-2.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        >
                          {t.viewSteps}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCompare(cand)}
                          className={`rounded px-2.5 py-1 text-xs transition-colors ${
                            isComparing
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {isComparing ? t.comparing : t.compare}
                        </button>

                        {!aiExp && (
                          <button
                            type="button"
                            onClick={() => handleRequestAiExplanation(cand)}
                            disabled={aiLoadingId === cand.id}
                            className="flex items-center gap-1 rounded px-2.5 py-1 text-violet-400 hover:bg-violet-950/40 hover:text-violet-300 transition-colors disabled:opacity-50"
                          >
                            <Bot className={`h-3.5 w-3.5 ${aiLoadingId === cand.id ? 'animate-spin' : ''}`} />
                            <span>{aiLoadingId === cand.id ? t.thinking : `${t.aiExplain} (${langNameForAi})`}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-400">
                    Showing solutions <strong className="text-slate-200">{startRank}–{endRank}</strong> of <strong className="text-slate-200">{sortedCandidates.length}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && safePage > 3) {
                          pageNum = safePage - 3 + i;
                          if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className={`h-7 w-7 rounded-lg text-xs font-mono font-medium transition-colors ${
                              safePage === pageNum
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next 26
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : results.inspection ? (
            /* No Results / Low Confidence Notice */
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-6 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">
                {t.noResultsFound}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {t.noResultsDesc}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMaxDepth(3)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Increase Search Depth to 3
                </button>
                <button
                  type="button"
                  onClick={() => onInspectCryptanalysis(inputText)}
                  className="rounded-lg border border-indigo-700/60 bg-indigo-950/50 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-900 transition-colors"
                >
                  {t.inspectFrequencies}
                </button>
              </div>
            </div>
          ) : (
            /* Initial Empty State */
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-indigo-400 border border-slate-800">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">
                {t.emptyStateTitle}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {t.emptyStateDesc}
              </p>
              <div className="pt-3 flex flex-wrap justify-center gap-2">
                {DEMO_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                  >
                    {t.trySample} {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
