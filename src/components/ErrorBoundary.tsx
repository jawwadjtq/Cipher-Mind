import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CipherMind AI uncaught component error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-slate-900/90 p-6 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4 border border-red-500/20">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Display Recovery</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              CipherMind AI safely isolated an unexpected rendering issue on this device to keep the app operational.
            </p>
            {this.state.error?.message && (
              <div className="mt-3 rounded-lg bg-slate-950 p-3 text-left font-mono text-xs text-red-300 border border-red-900/40 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Try Re-rendering
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Workbench
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
