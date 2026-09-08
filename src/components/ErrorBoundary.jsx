import { Component } from 'react';
import { RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">!</span>
            </div>
            <h1 className="text-[20px] font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-[14px] text-slate-500 mb-6">
              An unexpected error occurred. Please refresh and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 h-[42px] px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] font-semibold shadow-lg hover:shadow-xl transition cursor-pointer"
            >
              <RefreshCw size={14} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
