import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { progressionService } from '../../services/progressionService';
import { Icon } from '../ui/Icon';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Units' | 'Actions' | 'Practice';
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  keywords?: string[];
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    course,
    userProgress,
    navigateTo,
    startLesson,
    toggleTheme,
    toggleSound,
    theme,
    soundEnabled
  } = useApp();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Resolve next lesson across units
  const nextLessonId = progressionService.getNextLesson(userProgress, course) || '1.1';
  let nextLessonTitle = 'Continue Learning';
  let nextLessonUnitNumber = 1;
  for (const unit of course.units) {
    for (const skill of unit.skills) {
      const l = skill.lessons.find(item => item.id === nextLessonId);
      if (l) {
        nextLessonTitle = `${skill.title}: ${l.title}`;
        nextLessonUnitNumber = unit.unitNumber;
        break;
      }
    }
  }

  // Build command items
  const commands: CommandItem[] = [
    // Top Action: Resume Next Lesson
    {
      id: 'act-continue-lesson',
      category: 'Actions',
      title: `Continue Lesson: ${nextLessonTitle}`,
      subtitle: `Unit ${nextLessonUnitNumber} • Lesson ${nextLessonId} • Resume learning pathway`,
      icon: 'player-play',
      action: () => startLesson(nextLessonId),
      keywords: ['continue', 'next', 'resume', 'start', 'play', nextLessonId, `unit ${nextLessonUnitNumber}`]
    },

    // Top Views
    {
      id: 'nav-learn',
      category: 'Navigation',
      title: 'Learning Path',
      subtitle: 'Jump to serpentine skill curriculum',
      icon: 'map',
      action: () => navigateTo('/app'),
      keywords: ['path', 'curriculum', 'home', 'journey']
    },
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Command Dashboard',
      subtitle: 'Daily goals, 30-day streak heatmap & weekly XP',
      icon: 'layout-dashboard',
      action: () => navigateTo('/app/dashboard'),
      keywords: ['dashboard', 'stats', 'analytics', 'heatmap', 'goals']
    },
    {
      id: 'nav-practice',
      category: 'Navigation',
      title: 'Practice Arena',
      subtitle: 'Interactive playground, challenges & projects',
      icon: 'barbell',
      action: () => navigateTo('/app/practice'),
      keywords: ['playground', 'challenges', 'code']
    },
    {
      id: 'nav-mistakes',
      category: 'Navigation',
      title: 'Mistake Bank',
      subtitle: 'Review and repair missed concepts',
      icon: 'history',
      action: () => navigateTo('/app/review'),
      keywords: ['review', 'errors', 'drills']
    },
    {
      id: 'nav-profile',
      category: 'Navigation',
      title: 'User Profile & Settings',
      subtitle: 'View stats, badges and preferences',
      icon: 'user',
      action: () => navigateTo('/app/profile'),
      keywords: ['settings', 'account', 'stats']
    },

    // Actions
    {
      id: 'act-theme',
      category: 'Actions',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle interface color mode',
      icon: theme === 'dark' ? 'sun' : 'moon',
      action: () => toggleTheme(),
      keywords: ['dark', 'light', 'mode']
    },
    {
      id: 'act-sound',
      category: 'Actions',
      title: soundEnabled ? 'Mute Sound Effects' : 'Unmute Sound Effects',
      subtitle: 'Toggle audio click & celebration chimes',
      icon: soundEnabled ? 'volume-off' : 'volume',
      action: () => toggleSound(),
      keywords: ['audio', 'chime']
    },

    // Units in the course (all 43 units)
    ...course.units.map((unit) => ({
      id: `unit-${unit.id}`,
      category: 'Units' as const,
      title: unit.title,
      subtitle: `${unit.skills.length} skills • ${unit.description.slice(0, 50)}...`,
      icon: 'code',
      action: () => {
        navigateTo('/app');
        // Scroll to unit element if present
        setTimeout(() => {
          const el = document.getElementById(`unit-anchor-${unit.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      keywords: [unit.subtitle, 'unit', ...unit.skills.map(s => s.title)]
    })),

    // Fast-jump first lessons of current units
    ...course.units.slice(0, 10).flatMap(u =>
      u.skills.flatMap(s =>
        s.lessons.slice(0, 1).map(l => ({
          id: `lesson-${l.id}`,
          category: 'Practice' as const,
          title: `${s.title}: ${l.title}`,
          subtitle: `Unit ${u.unitNumber} • ${l.estimatedMinutes} min • +${l.xpReward} XP`,
          icon: 'player-play',
          action: () => startLesson(l.id),
          keywords: ['lesson', u.title, s.title, l.id]
        }))
      )
    )
  ];

  // Filter commands
  const filtered = commands.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchSubtitle = item.subtitle?.toLowerCase().includes(q);
    const matchCategory = item.category.toLowerCase().includes(q);
    const matchKeywords = (item.keywords || []).some(k => k.toLowerCase().includes(q));
    return matchTitle || matchSubtitle || matchCategory || matchKeywords;
  }).slice(0, 30); // Cap at 30 items for smooth render

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 16px 20px'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="animate-pop-in"
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-default)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <Icon name="search" size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a unit, lesson, command, or shortcut..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <kbd
            style={{
              padding: '2px 6px',
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No matching commands or units found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--brand-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 80ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface-subtle)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon name={item.icon} size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--brand-text)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: isSelected ? 'var(--brand-text)' : 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'rgba(67, 56, 202, 0.15)' : 'var(--bg-surface-subtle)',
                      color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderTop: '1px solid var(--border-default)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>esc</kbd> Dismiss</span>
          </div>
          <span>Codolingo Quick Jump</span>
        </div>
      </div>
    </div>
  );
};
