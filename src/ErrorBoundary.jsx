import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
    
    // Attempt to clear localized bad DB states just in case it's a fatal DB corruption lock
    // ONLY do this if it's explicitly an IndexedDB corruption that we can't recover from?
    // Let's not wipe DB automatically, just let the user see it.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#d32f2f' }}>Application Crashed</h1>
          <p>Please take a screenshot of this error and provide it to the developer:</p>
          <pre style={{ background: '#f5f5f5', padding: '1rem', overflowX: 'auto', border: '1px solid #ccc' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
             onClick={async () => {
                 try {
                     const { getAuth, signOut } = await import('firebase/auth');
                     const auth = getAuth();
                     await signOut(auth);
                 } catch(e) {}
                 window.location.reload();
             }}
             style={{ padding: '0.5rem 1rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
          >
            Clear Cache & Sign Out
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
