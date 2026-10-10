import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';

export const TermsView: React.FC = () => {
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
            Legal & Terms
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
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Last updated: October 2026. Simple, direct terms for a client-side learning tool.
          </p>
        </header>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              1. The service
            </h2>
            <p>
              Codolingo is an interactive Python learning environment designed to help developers build real programming fluency through deliberate practice, micro-lessons, sandboxes, and targeted mistake review.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              2. Free & local-first
            </h2>
            <p>
              Codolingo runs in your web browser. There are no subscriptions, payment tiers, paywalls, or accounts required. You are responsible for safeguarding your exported data backups if you switch browsers or devices.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              3. Intellectual property & your code
            </h2>
            <p>
              You own all intellectual property rights to any Python code, scripts, algorithms, or project solutions you write inside Codolingo. The Codolingo educational curriculum, interactive runner UI, design system, and diagnostic rubrics remain the property of Codolingo.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              4. Disclaimer of warranties
            </h2>
            <p>
              The application is provided &ldquo;as is&rdquo;, without warranty of any kind. While we strive for rigorous code testing and accurate diagnostic feedback, we make no guarantees that code execution or browser storage will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              5. Contact
            </h2>
            <p>
              Questions about these terms can be directed to <a href="mailto:terms@codolingo.app" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>terms@codolingo.app</a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 Codolingo</span>
          <Button variant="ghost" size="sm" onClick={() => navigateTo('/privacy')}>
            View Privacy Policy
          </Button>
        </div>
      </div>
    </div>
  );
};
