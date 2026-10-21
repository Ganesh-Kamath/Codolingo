import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { BrandLogo } from '../components/common/BrandLogo';

interface CodeSnippetSample {
  id: string;
  filename: string;
  lang: string;
  code: string;
  assertions: string[];
  latency: string;
}

const SNIPPET_SAMPLES: CodeSnippetSample[] = [
  {
    id: 'rust-timsort',
    filename: 'src/algorithms/timsort_parallel.rs',
    lang: 'Rust 1.78-nightly',
    code: `pub fn parallel_merge_sort<T: Ord + Send>(slice: &mut [T]) {
  // Threshold optimization for CPU cache lines
  if slice.len() <= 64 {
    insertion_sort(slice);
    return;
  }
  let mid = slice.len() / 2;
  let (left, right) = slice.split_at_mut(mid);
  rayon::join(|| parallel_merge_sort(left), || parallel_merge_sort(right));
}`,
    assertions: [
      '[TEST] Cache Thrash Guard • 0 thrash',
      '[TEST] Memory Profile Safety • 0 leaks',
      '[TEST] Multi-Thread Rayon Lock • 16 Cores OK',
      '[TEST] 1M Element Benchmark • 114ms'
    ],
    latency: '1.42ms'
  },
  {
    id: 'python-lru',
    filename: 'src/cache/lru_eviction.py',
    lang: 'Python 3.12-WASM',
    code: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache: dict[int, int] = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val  # Promote to most-recent
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            # Evict least recently used (first inserted)
            del self.cache[next(iter(self.cache))]
        self.cache[key] = value`,
    assertions: [
      '[TEST] O(1) Get / Put Latency • VERIFIED',
      '[TEST] Capacity Bound Eviction • PASS',
      '[TEST] Concurrency Lock Safety • 0 stalls',
      '[TEST] 200,000 Ops Stress Test • 8.1ms'
    ],
    latency: '0.84ms'
  },
  {
    id: 'ts-queue',
    filename: 'src/concurrency/channel_queue.ts',
    lang: 'TypeScript 5.4',
    code: `export class AsyncRingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private tail = 0;

  constructor(public readonly capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(item: T): boolean {
    const next = (this.tail + 1) % this.capacity;
    if (next === this.head) return false; // Buffer saturated
    this.buffer[this.tail] = item;
    this.tail = next;
    return true;
  }
}`,
    assertions: [
      '[TEST] Ring Pointer Wrap • PASS',
      '[TEST] Saturation Guard • 0 overflow',
      '[TEST] Zero Garbage Collector Pressure • OK',
      '[TEST] High Frequency Enqueue • 1.1ms'
    ],
    latency: '0.62ms'
  }
];

export const LandingPage: React.FC = () => {
  const { navigateTo, theme, toggleTheme, soundEnabled, toggleSound } = useApp();
  const [activeSnippetIndex, setActiveSnippetIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testPassed, setTestPassed] = useState<boolean>(true);

  const activeSnippet = SNIPPET_SAMPLES[activeSnippetIndex];

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestPassed(true);
    }, 320);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden'
      }}
    >
      {/* Flight Cockpit Top Navigation Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: 'rgba(11, 14, 21, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-default)',
          zIndex: 100,
          transition: 'all var(--transition-base)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Left: VYNTAX Brand + Systems Architecture + Version Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BrandLogo size="md" showSubtitle={true} subtitle="Systems Architecture" onClick={() => navigateTo('/')} />

            <div
              className="desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(0, 245, 212, 0.2)'
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  boxShadow: '0 0 8px var(--brand-primary)'
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--brand-primary)',
                  textTransform: 'uppercase'
                }}
              >
                CORE IDENTITY v1.0
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href="#platform"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--brand-primary)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                textDecoration: 'none'
              }}
            >
              Platform
            </a>
            <a
              href="#curriculum"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)'
              }}
            >
              Curriculum
            </a>
            <button
              onClick={() => navigateTo('/app/practice')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)'
              }}
            >
              Code Engine
            </button>
            <button
              onClick={() => navigateTo('/app/review')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)'
              }}
            >
              Telemetry Lab
            </button>
          </nav>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconButton
              name={theme === 'dark' ? 'sun' : 'moon'}
              label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              variant="subtle"
              size="sm"
              onClick={toggleTheme}
            />

            <IconButton
              name={soundEnabled ? 'volume' : 'volume-off'}
              label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
              variant="subtle"
              size="sm"
              onClick={toggleSound}
            />

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/app')}
              icon={<Icon name="player-play" size={14} fill="#0A0D14" />}
            >
              Launch IDE
            </Button>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO & RUNTIME SIMULATOR COCKPIT */}
      <section
        id="platform"
        style={{
          position: 'relative',
          paddingTop: '128px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#0B0E15',
          overflow: 'hidden'
        }}
      >
        {/* Ambient Laser Gradients */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-120px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 245, 212, 0.08)',
            filter: 'blur(140px)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-100px',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            backgroundColor: 'rgba(121, 40, 202, 0.15)',
            filter: 'blur(150px)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '48px',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Left Hero Column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Telemetry Micro Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(0, 245, 212, 0.25)',
                width: 'fit-content',
                marginBottom: '20px'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  boxShadow: '0 0 8px var(--brand-primary)'
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--brand-primary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Compiler Matrix 4.2 Online • v2025.1
              </span>
            </div>

            {/* Display Hero Title */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: '#F8FAFC',
                marginBottom: '20px'
              }}
            >
              Break the Tutorial Trap.{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #00F5D4 0%, #D7FFF3 40%, #7928CA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Build Real Software
              </span>{' '}
              with Purpose.
            </h1>

            {/* Subtitle / Brand Tagline */}
            <p
              style={{
                fontSize: '1.125rem',
                color: '#94A3B8',
                lineHeight: 1.6,
                maxWidth: '560px',
                marginBottom: '32px'
              }}
            >
              “Learn to code. Practice with purpose. Become a developer.”
              <br />
              <span style={{ fontSize: '0.95rem', color: '#64748B' }}>
                Master algorithmic thinking, Python, Rust, and systems architecture through progressive telemetry challenges, instant compiler feedback, and real production repos.
              </span>
            </p>

            {/* Kinetic Call-To-Action Pair */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigateTo('/app')}
                icon={<Icon name="bolt" size={18} fill="#0A0D14" />}
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 0 24px rgba(0, 245, 212, 0.45)'
                }}
              >
                Start Free Coding Journey
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const elem = document.getElementById('curriculum');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  else navigateTo('/app');
                }}
                icon={<Icon name="code" size={18} />}
              >
                Explore Curriculum
              </Button>
            </div>

            {/* Real Aerospace Telemetry Metric Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                padding: '16px 20px',
                backgroundColor: 'rgba(16, 21, 36, 0.65)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--brand-primary)',
                    letterSpacing: '0.04em'
                  }}
                >
                  140,820+
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    letterSpacing: '0.08em',
                    marginTop: '2px'
                  }}
                >
                  Active Engineers
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#DBB8FF',
                    letterSpacing: '0.04em'
                  }}
                >
                  1.2M+
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    letterSpacing: '0.08em',
                    marginTop: '2px'
                  }}
                >
                  Compiler Tests Run
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#36F5C7',
                    letterSpacing: '0.04em'
                  }}
                >
                  94.8%
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    letterSpacing: '0.08em',
                    marginTop: '2px'
                  }}
                >
                  Production Mastery
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Sandbox & Telemetry Cockpit */}
          <div style={{ position: 'relative' }}>
            {/* Floating Level-Up Telemetry HUD */}
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                right: '16px',
                zIndex: 30,
                backgroundColor: 'rgba(22, 29, 49, 0.95)',
                backdropFilter: 'blur(12px)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(121, 40, 202, 0.5)',
                boxShadow: '0 4px 20px rgba(104, 7, 186, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(104, 7, 186, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DBB8FF',
                  boxShadow: '0 0 12px rgba(219, 184, 255, 0.4)'
                }}
              >
                <Icon name="sparkles" size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#DBB8FF',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  Telemetry Level-Up
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                  +250 XP: Recursion & Memory Mastered
                </span>
              </div>
            </div>

            {/* Code Chassis Container */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#101524',
                border: '1px solid var(--border-default)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden',
                marginTop: '16px'
              }}
            >
              {/* Terminal Header Bar */}
              <div
                style={{
                  backgroundColor: '#0B0E15',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#363941' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00F5D4' }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#94A3B8',
                      marginLeft: '6px'
                    }}
                  >
                    {activeSnippet.filename}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(0, 245, 212, 0.1)',
                      color: 'var(--brand-primary)',
                      border: '1px solid rgba(0, 245, 212, 0.2)'
                    }}
                  >
                    {activeSnippet.lang}
                  </span>

                  {/* Snippet Switchers */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {SNIPPET_SAMPLES.map((snippet, idx) => (
                      <button
                        key={snippet.id}
                        onClick={() => setActiveSnippetIndex(idx)}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: activeSnippetIndex === idx ? 'var(--brand-primary)' : 'transparent',
                          color: activeSnippetIndex === idx ? '#0A0D14' : '#64748B',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        Tab {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Editor Body */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#0E121E',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: '22px',
                  color: '#F8FAFC',
                  overflowX: 'auto'
                }}
              >
                <pre style={{ margin: 0 }}>
                  <code>{activeSnippet.code}</code>
                </pre>
              </div>

              {/* Interactive Test Runner Telemetry Output */}
              <div
                style={{
                  backgroundColor: '#0B0E15',
                  padding: '16px',
                  borderTop: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="check" size={16} style={{ color: 'var(--brand-primary)' }} />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#F8FAFC',
                        textTransform: 'uppercase'
                      }}
                    >
                      Test Suite: PASS (4/4 Assertions)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--brand-primary)',
                        fontWeight: 700
                      }}
                    >
                      {activeSnippet.latency} execution
                    </span>

                    <button
                      onClick={handleRunTests}
                      disabled={isRunning}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--brand-primary)',
                        color: '#0A0D14',
                        fontFamily: 'var(--font-display)',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: isRunning ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon name="player-play" size={12} fill="#0A0D14" />
                      <span>{isRunning ? 'Profiling...' : 'Verify'}</span>
                    </button>
                  </div>
                </div>

                {/* Micro Assertion Checks Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '6px'
                  }}
                >
                  {activeSnippet.assertions.map((assertion, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#161D31',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid rgba(0, 245, 212, 0.15)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: '#94A3B8'
                      }}
                    >
                      {assertion}
                    </div>
                  ))}
                </div>

                {/* Live Progress Fuel Gauge Bar */}
                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: '#64748B'
                    }}
                  >
                    <span>STAGE 4/6 • CONCURRENCY MATRIX</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>82% COMPLETE</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '5px',
                      backgroundColor: '#1E2640',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: '82%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #7928CA 0%, #00F5D4 100%)',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE VYNTAX PROGRESSION PHILOSOPHY & 4 PILLARS */}
      <section
        style={{
          padding: '80px 24px',
          backgroundColor: '#10131A',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '48px',
              maxWidth: '720px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                SECTION 02 // DOCTRINE
              </span>
              <span style={{ color: '#475569' }}>/</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: '#94A3B8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                OPERATIONAL BLUEPRINT
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                marginBottom: '12px'
              }}
            >
              The VYNTAX Progression Philosophy
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6 }}>
              VYNTAX replaces juvenile gamification metaphors with precision telemetry, linear milestones, and luminous computational feedback. No participation trophies—just earned mastery.
            </p>
          </div>

          {/* 4 Strategic Pillars Bento Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            {[
              {
                idx: 'PILLAR 01',
                code: 'INDEX: ALGO_01',
                metric: 'O(1) RUNTIME',
                title: 'Algorithmic Precision',
                desc: 'Every syntax construct, memory heap challenge, and algorithmic problem is verified against deterministic test benches with microsecond profiling.',
                icon: 'terminal',
                accent: 'var(--brand-primary)'
              },
              {
                idx: 'PILLAR 02',
                code: 'INDEX: PROG_02',
                metric: 'TIER PROVEN',
                title: 'Meaningful Progression',
                desc: 'No participation trophies. Advancements correspond to architect-grade milestones: concurrency locks, compiler phases, and kernel-level mastery.',
                icon: 'trophy',
                accent: '#DBB8FF'
              },
              {
                idx: 'PILLAR 03',
                code: 'INDEX: BULD_03',
                metric: 'LIVE SANDBOX',
                title: 'Curiosity & Construction',
                desc: 'Engineering is learned by constructing distributed nodes, parsing abstract syntax trees, and refactoring mission-critical legacy modules.',
                icon: 'code',
                accent: '#36F5C7'
              },
              {
                idx: 'PILLAR 04',
                code: 'INDEX: SPEC_04',
                metric: '100% PROD',
                title: 'Rigorous Standards',
                desc: 'Write readable, robust, idiomatic code that conforms to standard linters, deterministic typing, and comprehensive assertion suites.',
                icon: 'shield-check',
                accent: '#26FEDC'
              }
            ].map((pillar) => (
              <div
                key={pillar.idx}
                style={{
                  backgroundColor: '#161D31',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color var(--transition-fast), transform var(--transition-fast)'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#101524',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: pillar.accent
                      }}
                    >
                      <Icon name={pillar.icon} size={20} />
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: pillar.accent,
                        letterSpacing: '0.08em'
                      }}
                    >
                      {pillar.idx}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#F8FAFC',
                      marginBottom: '8px'
                    }}
                  >
                    {pillar.title}
                  </h3>

                  <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                    {pillar.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '24px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px'
                  }}
                >
                  <span style={{ color: '#64748B' }}>{pillar.code}</span>
                  <span style={{ color: pillar.accent, fontWeight: 700 }}>{pillar.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: CURRICULUM ARCHITECTURE */}
      <section
        id="curriculum"
        style={{
          padding: '80px 24px',
          backgroundColor: '#0A0D14'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              MISSION CURRICULUM
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                margin: '8px 0 12px'
              }}
            >
              Structured Tracks for High-Velocity Mastery
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              43 comprehensive units bridging absolute fundamentals with industrial-grade systems engineering.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {[
              {
                track: 'TRACK 01',
                title: 'Python Foundations & Mechanics',
                units: 'Units 1 – 10 • 45 Lessons',
                desc: 'Variables, loops, control flow, functions, f-strings, and list slicing with immediate runtime feedback.',
                route: '/app'
              },
              {
                track: 'TRACK 02',
                title: 'Data Structures & Algorithmic Patterns',
                units: 'Units 11 – 25 • 60 Lessons',
                desc: 'Hash maps, LRU caches, binary search, two pointers, stacks, queues, and recursion with Big-O constraints.',
                route: '/app/practice'
              },
              {
                track: 'TRACK 03',
                title: 'Systems, Concurrency & Real APIs',
                units: 'Units 26 – 43 • 75 Lessons',
                desc: 'Multi-threading, AsyncIO event loops, SQLite parameterized queries, web scrapers, and full-stack API pipelines.',
                route: '/app/practice'
              }
            ].map((track) => (
              <div
                key={track.track}
                onClick={() => navigateTo(track.route)}
                role="button"
                tabIndex={0}
                style={{
                  backgroundColor: '#101524',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--brand-primary)',
                      letterSpacing: '0.08em',
                      marginBottom: '8px'
                    }}
                  >
                    {track.track}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#F8FAFC',
                      marginBottom: '6px'
                    }}
                  >
                    {track.title}
                  </h3>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#DBB8FF',
                      marginBottom: '12px'
                    }}
                  >
                    {track.units}
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.55 }}>
                    {track.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <span>Launch Track</span>
                  <Icon name="arrow-right" size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION BANNER */}
      <section
        style={{
          padding: '80px 24px',
          backgroundColor: '#0B0E15',
          borderTop: '1px solid var(--border-default)',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: '#F8FAFC',
              marginBottom: '16px'
            }}
          >
            Ready to Ascend the Syntax Prism?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Run real code in your browser with microsecond telemetry, zero configuration, and targeted mistake analysis.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('/app')}
            icon={<Icon name="player-play" size={18} fill="#0A0D14" />}
            style={{
              boxShadow: '0 0 28px rgba(0, 245, 212, 0.5)'
            }}
          >
            Launch VYNTAX IDE
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: '56px 24px 40px',
          backgroundColor: '#080A10',
          borderTop: '1px solid var(--border-default)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '32px',
            marginBottom: '40px'
          }}
        >
          <div>
            <BrandLogo size="md" showSubtitle={true} subtitle="Systems Architecture" onClick={() => navigateTo('/')} />
            <p
              style={{
                marginTop: '12px',
                fontSize: '0.875rem',
                color: '#64748B',
                maxWidth: '320px',
                lineHeight: 1.5
              }}
            >
              “Learn to code. Practice with purpose. Become a developer.”
              <br />
              Local-first architecture. Runs entirely in your browser with zero tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#F8FAFC',
                  marginBottom: '12px',
                  letterSpacing: '0.08em'
                }}
              >
                Workspaces
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li>
                  <button onClick={() => navigateTo('/app')} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Curriculum Path
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/app/dashboard')} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Flight Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/app/practice')} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Code Engine Sandbox
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/app/review')} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Fix-It Telemetry Lab
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#F8FAFC',
                  marginBottom: '12px',
                  letterSpacing: '0.08em'
                }}
              >
                System Specs
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li>
                  <button onClick={() => navigateTo('/changelog')} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Release Notes
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/privacy')} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Privacy Protocol
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/terms')} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#475569'
          }}
        >
          <span>© 2026 VYNTAX Systems Architecture. All rights reserved.</span>
          <span>KERNEL REVISION: 0x9A4F • WASM 3.12 COMPILER READY</span>
        </div>
      </footer>
    </div>
  );
};
