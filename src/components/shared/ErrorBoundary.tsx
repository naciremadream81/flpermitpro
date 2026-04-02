import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI. When omitted, the default error card is shown. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary that catches unhandled render errors anywhere in its
 * subtree.  React requires this to be a class component — functional components
 * cannot implement componentDidCatch / getDerivedStateFromError.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production you'd send this to an error reporting service (e.g. Sentry).
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-800 dark:bg-gray-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            An unexpected error occurred. You can try reloading the page to get
            back on track.
          </p>

          {this.state.error && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-red-50 p-3 text-left text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
