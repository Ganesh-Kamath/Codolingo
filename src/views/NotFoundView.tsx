import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';

export const NotFoundView: React.FC = () => {
  const { navigateTo, currentRoute } = useApp();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: 'var(--space-6)',
        color: 'var(--text-primary)'
      }}
    >
      <div
        style={{
          maxWidth: '580px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'var(--space-8)',
          textAlign: 'center'
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            backgroundColor: '#1E1E1E',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            textAlign: 'left',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: '#F87171',
            marginBottom: 'var(--space-6)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            lineHeight: 1.5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ color: '#888', marginLeft: '6px' }}>codolingo_router.py:404</span>
          </div>
          <div>Traceback (most recent call last):</div>
          <div style={{ color: '#9CA3AF' }}>  File &quot;codolingo/router.py&quot;, line 404, in resolve_route</div>
          <div style={{ color: '#F87171', fontWeight: 700, marginTop: '4px' }}>
            RouteNotFoundError: Target &apos;{currentRoute}&apos; does not exist in this realm.
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1.5)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--warning-bg)',
            color: 'var(--warning-text)',
            fontSize: 'var(--text-xs)',
            fontWeight: 800,
            marginBottom: 'var(--space-3)',
            border: '1px solid var(--warning-border)'
          }}
        >
          <Icon name="compass" size={14} />
          <span>HTTP 404 • UNMAPPED COORDINATES</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            marginBottom: 'var(--space-3)',
            color: 'var(--text-primary)'
          }}
        >
          Coordinate Not Found
        </h1>

        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-6)',
            maxWidth: '460px',
            margin: '0 auto var(--space-6)'
          }}
        >
          The path you tried to visit isn&apos;t mapped to any lesson, challenge, or project in the Python curriculum.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('/app')}
            icon={<Icon name="map" size={18} />}
          >
            Return to Learning Path
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
            }}
            icon={<Icon name="search" size={18} />}
          >
            Search (⌘K)
          </Button>
        </div>
      </div>
    </div>
  );
};
