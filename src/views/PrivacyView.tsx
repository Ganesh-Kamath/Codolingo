import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';

export const PrivacyView: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        padding: '32px 20px 80px'
      }}
      className="animate-fade-in"
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Navigation & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <BrandLogo size="md" onClick={() => navigateTo('/app')} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateTo('/app')}
            icon={<Icon name="arrow-left" size={14} />}
          >
            Back to app
          </Button>
        </div>

        {/* Header */}
        <header style={{ marginBottom: '36px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Legal & Data
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '6px 0 12px',
              color: 'var(--text-primary)'
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Last updated: October 2026. Codolingo is built local-first. We don&apos;t track you, sell your data, or maintain remote user databases.
          </p>
        </header>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              1. Where your data lives
            </h2>
            <p>
              All of your learning progress, completed units, daily streaks, XP points, sandbox files, and mistake repair records are stored exclusively in your browser&apos;s local storage (<code style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em', color: 'var(--brand-primary)' }}>localStorage</code>).
            </p>
            <p style={{ marginTop: '8px' }}>
              Nothing is transmitted to a central database or cloud account. If you clear your browser cookies and site data, your progress will be cleared unless you export a backup.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              2. Python code execution
            </h2>
            <p>
              When you write and run Python exercises in Codolingo, your code executes locally inside your browser via WebAssembly (Pyodide). No Python source code, scripts, or stdout logs are sent over the network to external code execution servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              3. Telemetry and tracking
            </h2>
            <p>
              Codolingo does not use Google Analytics, Meta Pixel, advertising beacons, fingerprinting scripts, or third-party cookies. We do not track your activity across other sites or sell learner information.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              4. Data portability & deletion
            </h2>
            <p>
              You own your data completely:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Export anytime:</strong> You can download a complete JSON backup of your progress from Settings &gt; Data &amp; Backups.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Delete anytime:</strong> You can permanently wipe all stored data with one click in Settings &gt; Danger Zone.
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              5. Questions & feedback
            </h2>
            <p>
              If you have any questions regarding this privacy policy or local data storage, email us at <a href="mailto:privacy@codolingo.app" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>privacy@codolingo.app</a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 Codolingo. Local-first learning.</span>
          <Button variant="ghost" size="sm" onClick={() => navigateTo('/terms')}>
            View Terms of Service
          </Button>
        </div>
      </div>
    </div>
  );
};
