/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { AutoSolveView } from './components/AutoSolveView';
import { EncryptView } from './components/EncryptView';
import { DecryptView } from './components/DecryptView';
import { CryptanalysisView } from './components/CryptanalysisView';
import { CipherLibraryView } from './components/CipherLibraryView';
import { HistoryModal, HistoryItem } from './components/HistoryModal';
import { CandidateCompareModal } from './components/CandidateCompareModal';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { DiagnosticTestModal } from './components/DiagnosticTestModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CipherCandidate } from './crypto/types';
import { SupportedLanguage } from './locales/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('autosolve');
  const [sharedInput, setSharedInput] = useState<string>('');
  const [activeCipherForWorkspaces, setActiveCipherForWorkspaces] = useState<string>('caesar');
  const [userLanguage, setUserLanguage] = useState<SupportedLanguage>('en');

  // Modals state
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [compareCandidates, setCompareCandidates] = useState<CipherCandidate[]>([]);
  const [detailCandidate, setDetailCandidate] = useState<CipherCandidate | null>(null);

  // Local Session History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleSaveToHistory = (entry: {
    input: string;
    topCandidate?: CipherCandidate;
    totalCandidates: number;
  }) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inputSnippet: entry.input.substring(0, 48) + (entry.input.length > 48 ? '...' : ''),
      topCipher: entry.topCandidate?.primaryCipherName,
      topScore: entry.topCandidate?.metrics.totalScore,
      totalCandidates: entry.totalCandidates,
      fullInput: entry.input,
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Cross-view transitions
  const handleUseAsInput = (text: string) => {
    setSharedInput(text);
    setActiveTab('autosolve');
  };

  const handleInspectCryptanalysis = (text: string) => {
    setSharedInput(text);
    setActiveTab('cryptanalysis');
  };

  const handleOpenInEncrypt = (cipherId: string) => {
    setActiveCipherForWorkspaces(cipherId);
    setActiveTab('encrypt');
  };

  const handleOpenInDecrypt = (cipherId: string) => {
    setActiveCipherForWorkspaces(cipherId);
    setActiveTab('decrypt');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Top Bar Contract Navigation */}
        <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDiagnostic={() => setShowDiagnosticModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        historyCount={history.length}
        userLanguage={userLanguage}
        onSelectLanguage={setUserLanguage}
      />

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {activeTab === 'autosolve' && (
          <AutoSolveView
            initialInput={sharedInput}
            onUseAsInput={handleUseAsInput}
            onInspectCryptanalysis={handleInspectCryptanalysis}
            onSaveToHistory={handleSaveToHistory}
            onOpenCompare={(cands) => setCompareCandidates(cands)}
            onOpenDetail={(cand) => setDetailCandidate(cand)}
            userLanguage={userLanguage}
          />
        )}

        {activeTab === 'encrypt' && (
          <EncryptView
            initialCipher={activeCipherForWorkspaces}
            userLanguage={userLanguage}
            onSendToSolver={(ct) => {
              setSharedInput(ct);
              setActiveTab('autosolve');
            }}
          />
        )}

        {activeTab === 'decrypt' && (
          <DecryptView
            initialCiphertext={sharedInput}
            initialCipher={activeCipherForWorkspaces}
            userLanguage={userLanguage}
            onSwitchToAutoSolve={(ct) => {
              setSharedInput(ct);
              setActiveTab('autosolve');
            }}
          />
        )}

        {activeTab === 'cryptanalysis' && (
          <CryptanalysisView
            initialText={sharedInput}
            userLanguage={userLanguage}
            onSendToSolver={(ct) => {
              setSharedInput(ct);
              setActiveTab('autosolve');
            }}
          />
        )}

        {activeTab === 'library' && (
          <CipherLibraryView
            userLanguage={userLanguage}
            onOpenInEncrypt={handleOpenInEncrypt}
            onOpenInDecrypt={handleOpenInDecrypt}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      {showHistoryModal && (
        <HistoryModal
          history={history}
          onClose={() => setShowHistoryModal(false)}
          onClearHistory={handleClearHistory}
          onSelectHistoryItem={(text) => {
            setSharedInput(text);
            setActiveTab('autosolve');
          }}
          userLanguage={userLanguage}
        />
      )}

      {showDiagnosticModal && (
        <DiagnosticTestModal
          onClose={() => setShowDiagnosticModal(false)}
          userLanguage={userLanguage}
        />
      )}

      {compareCandidates.length > 0 && (
        <CandidateCompareModal
          candidates={compareCandidates}
          onClose={() => setCompareCandidates([])}
          onUseAsInput={handleUseAsInput}
          userLanguage={userLanguage}
        />
      )}

      {detailCandidate && (
        <CandidateDetailModal
          candidate={detailCandidate}
          onClose={() => setDetailCandidate(null)}
          onUseAsInput={handleUseAsInput}
          userLanguage={userLanguage}
        />
      )}

      {/* Quiet Academic Footer adhering to frontend design constitution */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-400">CipherMind AI</span>
            <span>·</span>
            <span className="inline-flex items-center rounded-full bg-indigo-950/70 border border-indigo-700/50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
              Made by Jawad
            </span>
            <span>·</span>
            <span>Universal Cryptographic & Decryption Workbench</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Deterministic Algorithms & Gemini Explanations</span>
            <span>·</span>
            <span>Educational Use</span>
          </div>
        </div>
      </footer>
    </div>
  </ErrorBoundary>
  );
}
