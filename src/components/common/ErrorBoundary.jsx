import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[NextArcher] Uncaught component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          backgroundColor: '#000000',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
            Next Archer
          </h2>
          <p style={{ color: '#888888', fontSize: '14px', maxWidth: '360px', marginBottom: '24px' }}>
            A temporary display error occurred. Tap below to refresh the experience.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{
              padding: '10px 24px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload Experience
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
