'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-white/60 max-w-sm">
            An unexpected error occurred. Please refresh the page or try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary text-sm px-5 py-2.5"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
