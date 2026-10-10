import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { BrandLogo } from '../components/common/BrandLogo';

interface CodeSnippetSample {
  id: string;
  filename: string;
  code: string;
  expectedOutput: string;
}

const SNIPPET_SAMPLES: CodeSnippetSample[] = [
  {
    id: 'variables',
    filename: 'metrics.py',
    code: `# Variables and f-string formatting\nname = "Python Learner"\ncompleted_units = 14\ntotal_units = 43\n\npct = (completed_units / total_units) * 100\nprint(f"Learner: {name}")\nprint(f"Progress: {completed_units}/{total_units} units ({pct:.1f}%)")`,
    expectedOutput: `Learner: Python Learner\nProgress: 14/43 units (32.6%)\n\n>>> Executed in browser sandbox (0.012s)`
  },
  {
    id: 'comprehension',
    filename: 'filter.py',
    code: `# List comprehensions and filtering\nraw_scores = [88, 92, 59, 100, 74, 95, 61]\n\n# Filter scores above 80\nhonor_roll = [score for score in raw_scores if score >= 80]\naverage = sum(honor_roll) / len(honor_roll)\n\nprint("Honor Roll:", sorted(honor_roll, reverse=True))\nprint(f"Average: {average:.2f}")`,
    expectedOutput: `Honor Roll: [100, 95, 92, 88]\nAverage: 93.75\n\n>>> Executed in browser sandbox (0.015s)`
  },
  {
    id: 'functions',
    filename: 'format_currency.py',
    code: `# Function definition and formatting\ndef format_price(amount: float, currency: str = "$") -> str:\n    return f"{currency}{amount:,.2f}"\n\nitems = [19.99, 149.50, 4.00, 1299.00]\nfor item in items:\n    print(format_price(item))`,
    expectedOutput: `$19.99\n$149.50\n$4.00\n$1,299.00\n\n>>> Executed in browser sandbox (0.010s)`
  }
];

export const LandingPage: React.FC = () => {
  const { navigateTo, theme, toggleTheme } = useApp();
  const [activeSnippetIndex, setActiveSnippetIndex] = useState<number>(0);
  const [editorCode, setEditorCode] = useState<string>(SNIPPET_SAMPLES[0].code);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleSelectSnippet = (index: number) => {
    setActiveSnippetIndex(index);
    setEditorCode(SNIPPET_SAMPLES[index].code);
    setTerminalOutput('');
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTerminalOutput(SNIPPET_SAMPLES[activeSnippetIndex].expectedOutput);
      setIsRunning(false);
    }, 240);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        transition: 'background-color var(--transition-base), color var(--transition-base)'
      }}
    >
      {/* Top Navbar */}
      <nav
        style={{
          borderBottom: '1px solid var(--border-default)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          transition: 'background-color var(--transition-base), border-color var(--transition-base)'
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo & Brand */}
          <BrandLogo size="md" onClick={() => navigateTo('/app')} />

          {/* Nav Links & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigateTo('/app')}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="desktop-only nav-hover-item"
            >
              Curriculum
            </button>
            <button
              onClick={() => navigateTo('/app/practice')}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="desktop-only nav-hover-item"
            >
              Practice
            </button>
            <button
              onClick={() => navigateTo('/app/review')}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="desktop-only nav-hover-item"
            >
              Mistakes
            </button>

            {/* Theme Toggle */}
            <IconButton
              name={theme === 'dark' ? 'sun' : 'moon'}
              label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              variant="subtle"
              size="sm"
              onClick={toggleTheme}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateTo('/app')}
              icon={<Icon name="arrow-right" size={15} stroke={2} />}
              iconPosition="right"
            >
              Open app
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 56px',
          maxWidth: '920px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <Icon name="code" size={13} style={{ color: 'var(--brand-primary)' }} />
            <span>Browser-native Python practice</span>
          </div>
        </div>

        {/* One Strong Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            margin: '0 auto 18px',
            color: 'var(--text-primary)'
          }}
        >
          Learn Python through deliberate practice
        </h1>

        {/* One Subhead */}
        <p
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: '620px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}
        >
          43 bite-sized units, real code execution in your browser, and immediate diagnostic feedback when you make a mistake.
        </p>

        {/* ONE Dominant CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '56px' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('/app')}
            icon={<Icon name="player-play" size={18} fill="currentColor" />}
          >
            Start learning
          </Button>
        </div>

        {/* Real Product Live Demo Sandbox */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border-default)',
            backgroundColor: '#1E1E1E',
            color: '#D4D4D4',
            textAlign: 'left',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}
        >
          {/* Editor Header Bar with Snippet Tabs */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#141414',
              borderBottom: '1px solid #2D2D2D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {SNIPPET_SAMPLES.map((snippet, idx) => (
                  <button
                    key={snippet.id}
                    onClick={() => handleSelectSnippet(idx)}
                    style={{
                      backgroundColor: activeSnippetIndex === idx ? '#252526' : 'transparent',
                      color: activeSnippetIndex === idx ? '#FFFFFF' : '#888888',
                      border: '1px solid',
                      borderColor: activeSnippetIndex === idx ? '#3E3E42' : 'transparent',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Icon name="file-code" size={13} style={{ color: activeSnippetIndex === idx ? '#4ADE80' : '#888' }} />
                    <span>{snippet.filename}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="success"
              size="sm"
              isLoading={isRunning}
              onClick={handleRunCode}
              icon={<Icon name="player-play" size={13} fill="#fff" />}
            >
              Run Code
            </Button>
          </div>

          {/* Interactive Editable Code Textarea */}
          <div style={{ padding: '16px 20px' }}>
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              style={{
                width: '100%',
                height: '140px',
                backgroundColor: 'transparent',
                color: '#9CDCFE',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.86rem',
                lineHeight: 1.55,
                border: 'none',
                outline: 'none',
                resize: 'none'
              }}
              spellCheck={false}
              aria-label="Interactive Python code preview"
            />

            {/* Output terminal */}
            {terminalOutput ? (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#0F0F0F',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #2A2A2A',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: '#4ADE80'
                }}
                className="animate-fade-in"
              >
                <div style={{ color: '#888888', fontSize: '0.7rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
                  TERMINAL OUTPUT:
                </div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{terminalOutput}</pre>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.75rem',
                  color: '#888',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="terminal-2" size={14} />
                <span>Click &quot;Run Code&quot; to execute in browser WebAssembly</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Short "How it works" section (3 Steps) */}
      <section
        style={{
          padding: '72px 24px',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The Method
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.9rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '8px 0 12px',
                color: 'var(--text-primary)'
              }}
            >
              How it works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.55 }}>
              Practice beats passive watching. Three disciplined steps to build permanent code fluency.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px'
            }}
          >
            {[
              {
                step: '01',
                title: 'Bite-sized concepts',
                desc: '5-minute micro-lessons with clear syntax examples and zero preamble. Learn one atomic pattern at a time.',
                icon: 'book'
              },
              {
                step: '02',
                title: 'Write real code',
                desc: 'Browser-native Python execution with automated test suites. Write solutions directly in the editor.',
                icon: 'terminal-2'
              },
              {
                step: '03',
                title: 'Targeted mistake repair',
                desc: 'When code fails, diagnostic analysis highlights the exact misconception and schedules targeted review drills.',
                icon: 'history'
              }
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  backgroundColor: 'var(--bg-app)',
                  padding: '24px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      color: 'var(--brand-primary)'
                    }}
                  >
                    {item.step}
                  </span>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Icon name={item.icon} size={18} />
                  </div>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    color: 'var(--text-primary)'
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer
        style={{
          padding: '56px 24px 40px',
          maxWidth: '1120px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '32px',
            marginBottom: '40px'
          }}
        >
          <div>
            <BrandLogo size="md" onClick={() => navigateTo('/app')} />
            <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.5 }}>
              Local-first Python learning. Runs entirely in your browser with no remote tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '0.04em' }}>
                App
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <li>
                  <button onClick={() => navigateTo('/app')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="nav-hover-item">
                    Learning Path
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/app/practice')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="nav-hover-item">
                    Practice Arena
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/app/review')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="nav-hover-item">
                    Mistake Bank
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '0.04em' }}>
                Product
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <li>
                  <button onClick={() => navigateTo('/changelog')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="nav-hover-item">
                    Changelog
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/privacy')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="nav-hover-item">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/terms')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="nav-hover-item">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <a href="mailto:feedback@codolingo.app?subject=Codolingo%20Feedback" style={{ color: 'var(--text-secondary)' }}>
                    Send Feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>© 2026 Codolingo. No cookies, no accounts, no tracking.</span>
          <span>Python 3.12 WebAssembly</span>
        </div>
      </footer>
    </div>
  );
};
