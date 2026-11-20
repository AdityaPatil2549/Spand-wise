'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/telemetry/logger';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Resilient Section Error Boundary.
 * Catches runtime chart/SVG/OCR rendering exceptions without crashing the parent layout.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('SectionErrorBoundary caught unhandled component crash', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className={`p-6 rounded-3xl bg-theme-surface/70 border border-theme-danger/30 text-center space-y-3 shadow-sm ${
            this.props.className || ''
          }`}
          role="alert"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-theme-danger/10 text-theme-danger flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-theme-primary">
              {this.props.fallbackTitle || 'Section temporarily unavailable'}
            </h4>
            <p className="text-xs text-theme-secondary mt-1 max-w-sm mx-auto leading-relaxed">
              {this.props.fallbackDescription ||
                'A rendering glitch occurred in this widget. Click retry to recover.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-theme-base border border-theme-border/60 text-xs font-semibold text-theme-primary hover:border-theme-accent active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
