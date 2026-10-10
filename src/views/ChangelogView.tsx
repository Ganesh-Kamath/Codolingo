import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { BrandLogo } from '../components/common/BrandLogo';

interface ChangelogEntry {
  version: string;
  date: string;
  isLatest?: boolean;
  summary: string;
  changes: {
    category: 'Design' | 'Features' | 'Performance';
    items: string[];
  }[];
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: 'v1.2.0',
    date: 'October 2026',
    isLatest: true,
    summary: 'Refined visual hierarchy, editorial landing page, calm unit path layout, and motion restraint.',
    changes: [
      {
        category: 'Design',
        items: [
          'Restrained color system: indigo brand, emerald success, amber rewards, red streak/errors.',
          'Tactile 3D bevel buttons reserved exclusively for single primary actions.',
          'Calm Learning Path: active unit is prominent; completed and upcoming units collapse quietly.',
          'Tabular numbers for all XP counts, streaks, and score counters.'
        ]
      },
      {
        category: 'Performance',
        items: [
          'Standardized motion tokens (120ms/200ms/320ms) with full reduced-motion switch.',
          'Anti-overlapping Web Audio engine with subtle frequencies and master volume control.',
          'Single-toast notifications with automatic 3.2s dismissal.'
        ]
      },
      {
        category: 'Features',
        items: [
          'Unified 5-destination navigation structure on mobile and desktop.',
          'New editorial landing page with interactive browser code sandbox.',
          'Added local-first Privacy Policy, Terms of Service, and Keyboard Shortcuts sheet.'
        ]
      }
    ]
  },
  {
    version: 'v1.1.0',
    date: 'September 2026',
    summary: 'Command palette, misconception diagnostics, and improved sandbox drills.',
    changes: [
      {
        category: 'Features',
        items: [
          'Command palette (⌘K) to quickly jump across lessons, units, and views.',
          'Diagnostic error analyzer translating Python exceptions into clear human explanations.',
          'Quick Sandbox practice arena for open-ended Python experimentation.'
        ]
      },
      {
        category: 'Performance',
        items: [
          'Client-side WebAssembly Pyodide execution with instant stdout and error streams.',
          'Route-level code splitting with lightweight skeleton loaders.'
        ]
      }
    ]
  },
  {
    version: 'v1.0.0',
    date: 'August 2026',
    summary: 'Initial release of Codolingo Python curriculum and deliberate practice runner.',
    changes: [
      {
        category: 'Features',
        items: [
          '43 bite-sized Python units covering foundations through capstone projects.',
          'Multi-step lesson runner with syntax highlighting and instant unit testing.',
          'Mistake Bank capturing missed questions for targeted review.',
          'Full local progress persistence and JSON backup export/import.'
        ]
      }
    ]
  }
];

export const ChangelogView: React.FC = () => {
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
        <header style={{ marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Product Updates
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
            Changelog
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Real, shipped improvements and polish passes to the Codolingo platform.
          </p>
        </header>

        {/* Timeline of Releases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {CHANGELOG_DATA.map((entry) => (
            <article
              key={entry.version}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid var(--border-default)',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {entry.version}
                  </span>
                  {entry.isLatest && (
                    <Badge variant="brand" size="sm">
                      Current
                    </Badge>
                  )}
                </div>
                <time style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {entry.date}
                </time>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '20px' }}>
                {entry.summary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {entry.changes.map((group) => (
                  <div key={group.category}>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--brand-primary)',
                        marginBottom: '6px'
                      }}
                    >
                      {group.category}
                    </div>
                    <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {group.items.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 Codolingo</span>
          <Button variant="ghost" size="sm" onClick={() => navigateTo('/app')}>
            Start practicing
          </Button>
        </div>
      </div>
    </div>
  );
};
