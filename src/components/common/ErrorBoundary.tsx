import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  resetKey?: any;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Codolingo Error Boundary caught an exception:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.handleTryAgain();
    }
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleNavigateHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/app';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-app)',
            padding: 'var(--space-6)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)'
          }}
        >
          <div
            style={{
              maxWidth: '640px',
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid var(--error-border)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--space-8)',
              textAlign: 'center'
            }}
          >
            {/* Header Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--error-bg)',
                border: '1.5px solid var(--error-border)',
                color: 'var(--error-solid)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)'
              }}
            >
              <Icon name="alert-triangle" size={32} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1.5)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-text)',
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                marginBottom: 'var(--space-3)',
                border: '1px solid var(--error-border)'
              }}
            >
              RUNTIME EXCEPTION RECOVERED
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 'var(--space-2)'
              }}
            >
              Something unexpected paused your session
            </h1>

            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                marginBottom: 'var(--space-6)'
              }}
            >
              Don't worry! Your learning progress, completed units, and streaks are safely stored in your local storage.
            </p>

            {/* Error Message Snippet */}
            {this.state.error && (
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  padding: 'var(--space-4)',
                  textAlign: 'left',
                  marginBottom: 'var(--space-6)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--error-text)',
                  overflowX: 'auto',
                  maxHeight: '160px'
                }}
              >
                <strong>{this.state.error.name}:</strong> {this.state.error.message}
              </div>
            )}

            {/* Actions */}
            {(() => {
              const isChunkLoadError = 
                this.state.error?.name === 'ChunkLoadError' ||
                this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
                this.state.error?.message?.includes('dynamically imported');

              return (
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}
                >
                  {isChunkLoadError ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={this.handleReset}
                      icon={<Icon name="reload" size={16} />}
                    >
                      Reload App (New Version Available)
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={this.handleTryAgain}
                      icon={<Icon name="reload" size={16} />}
                    >
                      Try Again
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={this.handleNavigateHome}
                    icon={<Icon name="home" size={16} />}
                  >
                    Return to Learning Path
                  </Button>
                  {!isChunkLoadError && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={this.handleReset}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Reload App
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* Diagnostics Accordion */}
            {this.state.errorInfo && (
              <details
                style={{
                  marginTop: 'var(--space-6)',
                  textAlign: 'left',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)'
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, padding: 'var(--space-2) 0' }}>
                  Technical Trace Details
                </summary>
                <pre
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    overflowX: 'auto',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1.4,
                    color: 'var(--text-secondary)'
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
