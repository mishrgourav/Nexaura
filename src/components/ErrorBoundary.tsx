import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  data?: any;
  onClose?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Print the exact error message and the data object being rendered to the browser console
    console.error('❌ [ErrorBoundary Caught Fatal Render Error]:', error.message, error);
    console.error('📋 [ErrorBoundary Component Stack]:', errorInfo?.componentStack);
    if (this.props.data !== undefined) {
      console.error('📦 [ErrorBoundary Data Object Being Rendered]:', this.props.data);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="passport-error-boundary-fallback"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 max-w-lg w-full overflow-hidden text-slate-800 dark:text-white p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {this.props.fallbackTitle || 'Pilot Passport View Recovery'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Component render prevented from crashing the application.
                  </p>
                </div>
              </div>
              {this.props.onClose && (
                <button
                  id="passport-error-close-btn"
                  onClick={this.props.onClose}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Notice: A data structure inconsistency was intercepted.</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                The application prevented a full screen blanking. The error details and passport data have been logged to the Developer Console (F12) for inspection.
              </p>
              {this.state.error && (
                <div className="font-mono text-[11px] text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 break-all">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {this.props.onClose && (
                <button
                  id="passport-error-dismiss-btn"
                  onClick={this.props.onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Dismiss View
                </button>
              )}
              <button
                id="passport-error-retry-btn"
                onClick={this.handleRetry}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Rendering</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
