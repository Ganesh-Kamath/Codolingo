import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  const { navigateTo, soundEnabled, toggleSound } = useApp();
  const [snippetCode, setSnippetCode] = useState<string>(
    '# Try Python right here in the browser:\nuser_role = "developer"\nis_ready = user_role == "developer"\n\nif is_ready:\n    print("Welcome to Codon. Start writing real code.")\n'
  );
  const [miniOutput, setMiniOutput] = useState<string>('');
  const [hasRun, setHasRun] = useState<boolean>(false);

  const runMiniSnippet = () => {
    setHasRun(true);
    setMiniOutput('Welcome to Codon. Start writing real code.\n>>> Program finished (0.02s)');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: 'var(--text-primary)' }}>
      {/* Top Navbar */}
      <nav
        style={{
          borderBottom: '1px solid var(--border-default)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigateTo('/')}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
              }}
            >
              <Icon name="code" size={24} stroke={2.5} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em' }}>Codon</span>
              <Badge variant="brand" size="sm">Adaptive Platform</Badge>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigateTo('/app/learn')}
              style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}
              className="desktop-only"
            >
              Curriculum
            </button>
            <button
              onClick={() => navigateTo('/app/review')}
              style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}
              className="desktop-only"
            >
              Mistake Bank
            </button>
            <Button variant="primary" size="md" onClick={() => navigateTo('/onboarding')} icon={<Icon name="arrow-right" size={16} stroke={3} />} iconPosition="right">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '72px 24px 48px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'var(--brand-light)',
              border: '1px solid var(--brand-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--brand-text)',
              fontSize: '0.8125rem',
              fontWeight: 600
            }}
          >
            <Icon name="sparkles" size={16} style={{ color: 'var(--brand-primary)' }} />
            <span>Duolingo-level habit formation. Professional engineering depth.</span>
          </div>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '900px',
            margin: '0 auto 20px',
            color: 'var(--text-primary)'
          }}
        >
          Become a real programmer by writing <span style={{ color: 'var(--brand-primary)' }}>real code</span>. Not trivia.
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}
        >
          Learn syntax, write code in a real Monaco editor, get intelligent diagnostics on every mistake, and repair conceptual gaps through adaptive drills.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <Button variant="primary" size="lg" onClick={() => navigateTo('/onboarding')} icon={<Icon name="player-play" size={20} fill="#fff" />}>
            Start Learning
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigateTo('/app')}>
            Skip to Dashboard
          </Button>
        </div>

        {/* Live Interactive Hero Code Demo */}
        <div
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            backgroundColor: '#1E1E1E',
            color: '#D4D4D4',
            textAlign: 'left',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}
        >
          {/* Editor Header Bar */}
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#181818',
              borderBottom: '1px solid #2D2D2D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '0.8125rem', color: '#888888', marginLeft: '10px', fontFamily: 'var(--font-mono)' }}>
                interactive_sandbox.py
              </span>
            </div>

            <Button
              variant="success"
              size="sm"
              onClick={runMiniSnippet}
              icon={<Icon name="player-play" size={14} fill="#fff" />}
            >
              Run Code
            </Button>
          </div>

          {/* Interactive Editable Code Textarea */}
          <div style={{ padding: '16px 20px', position: 'relative' }}>
            <textarea
              value={snippetCode}
              onChange={(e) => setSnippetCode(e.target.value)}
              style={{
                width: '100%',
                height: '110px',
                backgroundColor: 'transparent',
                color: '#9CDCFE',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                border: 'none',
                outline: 'none',
                resize: 'none'
              }}
              spellCheck={false}
            />

            {/* Output terminal below code */}
            {hasRun && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#0F0F0F',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #2A2A2A',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  color: '#4ADE80'
                }}
                className="animate-fade-in"
              >
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '4px' }}>TERMINAL STDOUT:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{miniOutput}</pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The 8-Step Core Learning Loop */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <Badge variant="brand" size="md">Adaptive Learning Cycle</Badge>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '12px', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Built around the scientific mastery loop
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 40px' }}>
            Most platforms either bore you with 30-minute videos or test you on multiple-choice trivia. Codon enforces real development muscle memory.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              textAlign: 'left'
            }}
          >
            {[
              { step: '01', title: 'Learn', desc: 'Atomic concepts distilled into punchy, clear mental models.', icon: 'book' },
              { step: '02', title: 'Write Real Code', desc: 'Full Monaco editor with syntax highlighting, autocomplete, and shortcuts.', icon: 'terminal-2' },
              { step: '03', title: 'Make Mistakes', desc: 'Failure is celebrated. Code is run against automated unit test suites.', icon: 'history' },
              { step: '04', title: 'Understand & Repair', desc: 'Intelligent diagnostics pinpoint exactly why `=` failed instead of `==`.', icon: 'bolt' }
            ].map((card) => (
              <div
                key={card.step}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                    {card.step}
                  </span>
                  <Icon name={card.icon} size={24} stroke={2.5} style={{ color: 'var(--brand-primary)' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators: The Mistake Bank */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <Badge variant="warning" size="md">Key Differentiator</Badge>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '12px', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              The Mistake Bank: We don't just say "Incorrect."
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }}>
              When a submission fails, Codon analyzes the AST and execution trace to pinpoint the conceptual mistake: confusing assignment with equality, variable casing, or unindented blocks.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9375rem' }}>
                <Icon name="check" size={20} stroke={3} style={{ color: 'var(--brand-primary)' }} />
                <span>Automatically stores failed attempts in your personal Mistake Bank</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9375rem' }}>
                <Icon name="check" size={20} stroke={3} style={{ color: 'var(--brand-primary)' }} />
                <span>Generates 2-minute targeted "Repair Sessions" for weak concepts</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9375rem' }}>
                <Icon name="check" size={20} stroke={3} style={{ color: 'var(--brand-primary)' }} />
                <span>Tracks mastery recovery until the concept is permanently retained</span>
              </li>
            </ul>

            <Button variant="primary" size="md" onClick={() => navigateTo('/app/review')} icon={<Icon name="history" size={16} stroke={2.5} />}>
              Explore Mistake Bank
            </Button>
          </div>

          {/* Interactive Diagnostic Card Mockup */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#DC2626' }}>
                DIAGNOSTIC ADVISOR
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attempt 2 of 3</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--error-text)', fontSize: '0.9rem', marginBottom: '4px' }}>
                Almost there! Assignment vs Equality Check
              </div>
              <p style={{ fontSize: '0.84rem', color: '#7F1D1D', margin: 0, lineHeight: 1.4 }}>
                In Python, a single <code style={{ backgroundColor: '#FEE2E2', padding: '1px 4px', borderRadius: '3px' }}>=</code> overwrites the variable. To evaluate equality, use the double equals operator <code style={{ backgroundColor: '#FEE2E2', padding: '1px 4px', borderRadius: '3px' }}>==</code>.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
              <div style={{ color: '#DC2626' }}>- saved_role = user_role</div>
              <div style={{ color: '#16A34A', fontWeight: 600 }}>+ saved_role == user_role</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer style={{ backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-default)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Ready to start learning?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9375rem' }}>
            Jump into the Python Foundations course and write your first real program in under 3 minutes.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigateTo('/onboarding')}>
            Create Account
          </Button>
          <div style={{ marginTop: '32px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Codon © 2026. Built with modern engineering principles for millions of aspiring developers.
          </div>
        </div>
      </footer>
    </div>
  );
};
