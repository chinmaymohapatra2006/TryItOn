import React from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global Error Boundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  handleClearCacheAndReset = () => {
    try {
      localStorage.removeItem('tryiton_user');
      localStorage.removeItem('tryiton_auth_token');
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-[#1C1917] font-sans">
          <div className="max-w-md w-full bg-white border border-[#E8DFC8] rounded-3xl p-8 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="font-serif text-2xl font-medium text-[#1C1917] mb-2">Something Went Wrong</h1>
            <p className="text-xs text-[#6E5341] mb-6 leading-relaxed">
              An unexpected rendering issue occurred. Your saved looks and measurements remain safely stored.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-[11px] text-rose-800 font-mono text-left overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2.5">
                <button
                  onClick={this.handleReload}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold uppercase tracking-wider shadow transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-[#D5C4A1]" />
                  <span>Reload Page</span>
                </button>

                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#1C1917] text-xs font-semibold uppercase tracking-wider border border-[#E7DEC8] transition-all"
                >
                  <Home className="w-4 h-4 text-[#8C6D58]" />
                  <span>Atelier</span>
                </button>
              </div>

              <button
                onClick={this.handleClearCacheAndReset}
                className="w-full inline-flex items-center justify-center gap-2 py-2 text-[11px] text-[#8C6D58] hover:text-rose-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Local Cache & Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
