import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#0b0f19',
          color: '#f9fafb',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div className="glass-card" style={{
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(17, 24, 39, 0.95)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            <h2 style={{ fontSize: '1.375rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
              Something Went Wrong
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              An unexpected UI rendering error occurred. You can reload the application to continue your virtual fitting session.
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: '0.75rem',
              color: '#f87171',
              fontFamily: 'monospace',
              marginBottom: '1.5rem',
              textAlign: 'left',
              overflowX: 'auto',
              maxHeight: '120px'
            }}>
              {this.state.error?.message || 'Unknown error'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.25rem' }}
              >
                <RefreshCw size={15} />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
