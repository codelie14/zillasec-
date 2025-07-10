import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    logError("Uncaught React error", { error: error.toString(), errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Oops! Something went wrong.</h1>
            <p className="text-slate-600 dark:text-slate-400">
                We've been notified of the issue. Please try refreshing the page.
            </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
