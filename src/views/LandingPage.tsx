import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { IconButton } from '../components/common/IconButton';

interface CodeSnippetSample {
  id: string;
  filename: string;
  code: string;
  expectedOutput: string;
}

const SNIPPET_SAMPLES: CodeSnippetSample[] = [
  {
    id: 'variables',
    filename: 'player_stats.py',
    code: `# Dynamic Variable & String Interpolation\ncharacter_name = "Aria"\nlevel = 42\nxp = 9850\nskills = ["Python", "Algorithms", "Clean Code"]\n\nprint(f"Hero: {character_name} (Level {level})")\nprint(f"Mastered: {', '.join(skills)}")\nprint(f"Next Rank in: {10000 - xp} XP")`,
    expectedOutput: `Hero: Aria (Level 42)\nMastered: Python, Algorithms, Clean Code\nNext Rank in: 150 XP\n\n>>> Program executed successfully (0.012s)`
  },
  {
    id: 'comprehension',
    filename: 'data_filter.py',
    code: `# List Comprehensions & Transformation\nraw_scores = [88, 92, 59, 100, 74, 95, 61]\n\n# Filter honor roll scores (>= 85)\nhonor_roll = [score for score in raw_scores if score >= 85]\naverage_top = sum(honor_roll) / len(honor_roll)\n\nprint("Honor Roll Scores:", sorted(honor_roll, reverse=True))\nprint(f"Class Top Average: {average_top:.2f}")`,
    expectedOutput: `Honor Roll Scores: [100, 95, 92, 88]\nClass Top Average: 93.75\n\n>>> Program executed successfully (0.015s)`
  },
  {
    id: 'oop',
    filename: 'inventory_engine.py',
    code: `# Object-Oriented Domain Model\nclass CodeQuest:\n    def __init__(self, title, reward_xp):\n        self.title = title\n        self.reward_xp = reward_xp\n        self.completed = False\n\n    def finish(self):\n        self.completed = True\n        return f"Completed '{self.title}'! +{self.reward_xp} XP"\n\nquest = CodeQuest("Build Binary Tree", 150)\nprint(quest.finish())`,
    expectedOutput: `Completed 'Build Binary Tree'! +150 XP\n\n>>> Program executed successfully (0.018s)`
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
    }, 280);
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
          borderBottom: '1.5px solid var(--border-default)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(10px)',
          zIndex: 50,
          boxShadow: 'var(--shadow-xs)',
          transition: 'background-color var(--transition-base), border-color var(--transition-base)'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo & Brand */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => navigateTo('/app')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigateTo('/app'); }}
            aria-label="Codolingo Home"
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-primary)',
                border: '1.5px solid var(--brand-bevel)',
                boxShadow: 'var(--tactile-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Icon name="code" size={22} stroke={2.5} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'var(--text-xl)',
                  letterSpacing: '-0.025em',
                  color: 'var(--text-primary)'
                }}
              >
                Codolingo
              </span>
            </div>
          </div>

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
              Mistake bank
            </button>

            {/* Theme Toggle */}
            <IconButton
              name={theme === 'dark' ? 'sun' : 'moon'}
              label="Toggle Theme"
              variant="subtle"
              size="sm"
              onClick={toggleTheme}
            />

            <Button
              variant="secondary"
              size="md"
              onClick={() => navigateTo('/app')}
              icon={<Icon name="arrow-right" size={16} stroke={2} />}
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
          padding: '72px 24px 48px',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
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
              color: 'var(--brand-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              letterSpacing: '0.01em'
            }}
          >
            <Icon name="code" size={14} style={{ color: 'var(--brand-primary)' }} />
            <span>Interactive Python curriculum</span>
          </div>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '900px',
            margin: '0 auto 18px',
            color: 'var(--text-primary)'
          }}
        >
          Learn Python by writing <span style={{ color: 'var(--brand-primary)' }}>real code</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: '660px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}
        >
          Focused interactive lessons, browser-native Python execution, and clear diagnostic feedback when you make a mistake.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '48px'
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('/app')}
            icon={<Icon name="player-play" size={18} fill="currentColor" />}
          >
            Start learning
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigateTo('/app/practice')}
            icon={<Icon name="barbell" size={18} />}
          >
            Explore practice
          </Button>
        </div>

        {/* Live Interactive Hero Code Demo */}
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            borderRadius: 'var(--radius-xl)',
            border: '2px solid var(--border-default)',
            backgroundColor: '#1E1E1E',
            color: '#D4D4D4',
            textAlign: 'left',
            boxShadow: 'var(--shadow-xl)',
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
            {/* Window Dots & Tab Switchers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10B981' }} />
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
              icon={<Icon name="player-play" size={14} fill="#fff" />}
            >
              Run Code
            </Button>
          </div>

          {/* Interactive Editable Code Textarea */}
          <div style={{ padding: '16px 20px', position: 'relative' }}>
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              style={{
                width: '100%',
                height: '140px',
                backgroundColor: 'transparent',
                color: '#9CDCFE',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
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
                  fontSize: '0.84rem',
                  color: '#4ADE80'
                }}
                className="animate-fade-in"
              >
                <div style={{ color: '#888888', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
                  TERMINAL STDOUT:
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
                <span>Click &quot;Run Code&quot; above to execute in the browser terminal</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The 4-Step Mastery Cycle */}
      <section
        style={{
          padding: '72px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1.5px solid var(--border-default)',
          borderBottom: '1.5px solid var(--border-default)'
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
          <Badge variant="brand" size="md">THE DELIBERATE METHOD</Badge>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginTop: '14px',
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}
          >
            How Codolingo builds permanent engineering muscle
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-base)',
              maxWidth: '680px',
              margin: '0 auto 48px',
              lineHeight: 1.6
            }}
          >
            Most coding sites test trivia or make you watch passive video lectures. Codolingo is built from cognitive science: small concepts, immediate synthesis, rapid failure, and targeted repair.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              textAlign: 'left'
            }}
          >
            {[
              {
                step: 'STEP 01',
                title: 'Bite-Sized Concepts',
                desc: 'Atomic mental models with crystal-clear syntax explanations and zero fluffy preamble.',
                icon: 'book',
                badgeColor: 'var(--brand-primary)'
              },
              {
                step: 'STEP 02',
                title: 'Monaco IDE Synthesis',
                desc: 'Write real Python in a professional editor with syntax highlighting, autocomplete, and keyboard shortcuts.',
                icon: 'terminal-2',
                badgeColor: 'var(--info-text)'
              },
              {
                step: 'STEP 03',
                title: 'Automated Test Suites',
                desc: 'Code is evaluated instantly by Pyodide against rigorous hidden unit tests with live stdout/stderr streams.',
                icon: 'cpu',
                badgeColor: 'var(--warning-text)'
              },
              {
                step: 'STEP 04',
                title: 'Adaptive Mistake Bank',
                desc: 'Failed runs are analyzed for misconceptions (like = vs ==) and converted into 2-minute repair drills.',
                icon: 'history',
                badgeColor: 'var(--error-solid)'
              }
            ].map((card) => (
              <div
                key={card.step}
                style={{
                  backgroundColor: 'var(--bg-app)',
                  padding: '24px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px solid var(--border-default)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: card.badgeColor,
                        letterSpacing: '0.04em'
                      }}
                    >
                      {card.step}
                    </span>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.badgeColor
                      }}
                    >
                      <Icon name={card.icon} size={20} />
                    </div>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 800,
                      marginBottom: '8px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section style={{ padding: '80px 24px', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="brand" size="md">Curriculum</Badge>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginTop: '12px',
              marginBottom: '14px',
              color: 'var(--text-primary)'
            }}
          >
            43 units. 8 core topics.
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            From your first print statement to building complete software tools and algorithms.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px'
          }}
        >
          {[
            {
              domain: 'Domain 1',
              title: 'Python Foundations & Expressions',
              units: 'Units 1 – 6',
              skills: ['Variables & Types', 'Math Operators', 'F-Strings', 'Boolean Logic'],
              icon: 'flame'
            },
            {
              domain: 'Domain 2',
              title: 'Control Flow & Logic Branching',
              units: 'Units 7 – 12',
              skills: ['Conditionals (if/elif/else)', 'While Loops', 'For In Loops', 'Break & Continue'],
              icon: 'compass'
            },
            {
              domain: 'Domain 3',
              title: 'Functions & Modular Code',
              units: 'Units 13 – 18',
              skills: ['Parameters & Returns', 'Scope & Namespaces', 'Default Args', 'Lambdas'],
              icon: 'cpu'
            },
            {
              domain: 'Domain 4',
              title: 'Data Collections & Structures',
              units: 'Units 19 – 25',
              skills: ['Lists & Slicing', 'Dictionaries & Maps', 'Sets & Tuples', 'Comprehensions'],
              icon: 'database'
            },
            {
              domain: 'Domain 5',
              title: 'Strings, Files & I/O Streams',
              units: 'Units 26 – 31',
              skills: ['String Parsing', 'File Reading & Writing', 'JSON Serializers', 'Exceptions'],
              icon: 'file-text'
            },
            {
              domain: 'Domain 6',
              title: 'Object-Oriented Programming',
              units: 'Units 32 – 37',
              skills: ['Classes & __init__', 'Encapsulation', 'Inheritance', 'Magic Methods'],
              icon: 'layers'
            },
            {
              domain: 'Domain 7',
              title: 'Algorithms & Problem Solving',
              units: 'Units 38 – 41',
              skills: ['Binary Search', 'Recursion Trees', 'Sorting & Big O', 'Stack/Queue Drills'],
              icon: 'bolt'
            },
            {
              domain: 'Domain 8',
              title: 'Capstone Software Projects',
              units: 'Units 42 – 43',
              skills: ['Password Vault', 'Expense Tracker', 'REST Client', 'Text Adventure Engine'],
              icon: 'trophy'
            }
          ].map((item) => (
            <div
              key={item.domain}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                  {item.domain} • {item.units}
                </span>
                <Icon name={item.icon} size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-secondary)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators: Mistake Bank */}
      <section
        style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}
        >
          <div>
            <Badge variant="brand" size="md">Adaptive review</Badge>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 800,
                marginTop: '14px',
                marginBottom: '16px',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                color: 'var(--text-primary)'
              }}
            >
              Learn from your mistakes
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: '20px' }}>
              When a check fails, Codolingo identifies the specific conceptual gap—like confusing assignment with equality or miscounting loop ranges—so you understand what happened and how to fix it.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--state-success)', flexShrink: 0 }}>
                  <Icon name="check" size={14} stroke={2.5} />
                </div>
                <span>Saves missed questions automatically into your review bank</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--state-success)', flexShrink: 0 }}>
                  <Icon name="check" size={14} stroke={2.5} />
                </div>
                <span>Provides targeted review drills for concepts needing practice</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--state-success)', flexShrink: 0 }}>
                  <Icon name="check" size={14} stroke={2.5} />
                </div>
                <span>Clears each item once you demonstrate consistent understanding</span>
              </li>
            </ul>

            <Button
              variant="secondary"
              size="md"
              onClick={() => navigateTo('/app/review')}
              icon={<Icon name="history" size={16} />}
            >
              Open mistake bank
            </Button>
          </div>

          {/* Interactive Diagnostic Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--state-error)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--state-error)', fontFamily: 'var(--font-mono)' }}>
                  Diagnostic feedback
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attempt 2 of 3</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--state-error-subtle)',
                border: '1px solid var(--error-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '6px' }}>
                Assignment vs. equality check
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                In Python, a single <code style={{ backgroundColor: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>=</code> operator assigns a value. To check equality, use the comparison operator <code style={{ backgroundColor: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>==</code>.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#1E1E1E',
                color: '#F87171',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                border: '1px solid #333'
              }}
            >
              <div style={{ color: '#EF4444' }}>- if user_role = &quot;admin&quot;:</div>
              <div style={{ color: '#4ADE80', fontWeight: 600 }}>+ if user_role == &quot;admin&quot;:</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--bg-app)',
          padding: '64px 24px 48px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              marginBottom: '14px',
              color: 'var(--text-primary)'
            }}
          >
            Ready to learn Python?
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
            Runs entirely in your browser with zero installation. All data is saved locally on your device.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('/app')}
            icon={<Icon name="arrow-right" size={18} stroke={2} />}
            iconPosition="right"
          >
            Start learning
          </Button>

          <div
            style={{
              marginTop: '40px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <span>Codolingo</span>
            <span>•</span>
            <span>Local data storage</span>
            <span>•</span>
            <span>Python 3</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
