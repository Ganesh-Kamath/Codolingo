import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './context/AppContext';
import { LearningPath } from './components/path/LearningPath';
import { DashboardView } from './views/DashboardView';
import { MultiStepLessonView } from './views/MultiStepLessonView';
import { PracticeView } from './views/PracticeView';
import { MistakeReviewView } from './views/MistakeReviewView';
import { ProfileView } from './views/ProfileView';
import { OnboardingView } from './views/OnboardingView';
import { Icon } from './components/ui/Icon';
import { Button, IconButton, Badge, Tooltip, CommandPalette } from './components/common';
import { BottomNav } from './components/layout/BottomNav';
import { progressionService } from './services/progressionService';

export const AppContent: React.FC = () => {
  const { 
    currentRoute, 
    navigateTo, 
    userProgress, 
    soundEnabled, 
    toggleSound, 
    theme, 
    toggleTheme, 
    course,
    startLesson 
  } = useApp();

  const [activeHudPopover, setActiveHudPopover] = useState<'streak' | 'xp' | 'energy' | 'avatar' | null>(null);
  const hudPopoverRef = useRef<HTMLDivElement>(null);

  // Close HUD popover on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hudPopoverRef.current && !hudPopoverRef.current.contains(e.target as Node)) {
        setActiveHudPopover(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeHudPopover) {
        setActiveHudPopover(null);
      }
    };

    if (activeHudPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeHudPopover]);

  // 1. If an active lesson is running, verify access and render full-screen interactive lesson runner
  if (currentRoute.startsWith('/app/lesson/')) {
    const lessonId = currentRoute.replace('/app/lesson/', '');
    const isAvailable = progressionService.isLessonAvailable(lessonId, userProgress, course);
    if (!isAvailable) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-app)',
            padding: 'var(--space-6)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--error-bg)',
              border: '1.5px solid var(--error-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)',
              color: 'var(--error-solid)'
            }}
          >
            <Icon name="lock" size={32} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              marginBottom: 'var(--space-2)',
              color: 'var(--text-primary)'
            }}
          >
            Lesson Locked
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              maxWidth: '420px',
              marginBottom: 'var(--space-6)',
              lineHeight: 1.5,
              fontSize: 'var(--text-base)'
            }}
          >
            You have not unlocked this lesson yet. Complete the preceding lessons in your learning path to continue.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('/app')}
          >
            Return to Learning Path
          </Button>
        </div>
      );
    }
    return <MultiStepLessonView lessonId={lessonId} />;
  }

  // 1b. If onboarding route
  if (currentRoute === '/onboarding') {
    return <OnboardingView />;
  }

  // 2. Navigation items
  const navTabs = [
    { id: '/app', label: 'Path', iconName: 'map' },
    { id: '/app/dashboard', label: 'Dashboard', iconName: 'layout-dashboard' },
    { id: '/app/practice', label: 'Practice', iconName: 'barbell' },
    { 
      id: '/app/review', 
      label: 'Mistake Bank', 
      iconName: 'history', 
      badge: userProgress.mistakes.filter(m => !m.resolved).length 
    },
    { id: '/app/profile', label: 'Profile', iconName: 'user' }
  ];

  const rawTab = currentRoute === '/' ? '/app' : currentRoute;
  const currentTab = 
    (rawTab === '/app' || rawTab === '/app/learn')
      ? '/app'
      : rawTab === '/app/dashboard'
      ? '/app/dashboard'
      : rawTab.startsWith('/app/practice') || rawTab.startsWith('/app/projects')
      ? '/app/practice'
      : rawTab.startsWith('/app/review')
      ? '/app/review'
      : rawTab.startsWith('/app/profile')
      ? '/app/profile'
      : '/app';

  const nextLessonId = progressionService.getNextLesson(userProgress, course) || '1.1';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color var(--transition-base)'
      }}
    >
      {/* Top Application Header / Stitch DevRealm Odyssey HUD */}
      <header
        style={{
          height: 'var(--topbar-height)',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1.5px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'background-color var(--transition-base), border-color var(--transition-base)'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 var(--space-5)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          {/* Brand Logo & Course Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              onClick={() => navigateTo('/app')}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2.5)', cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              aria-label="Go to home learning path"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigateTo('/app');
              }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1.5)' }}>
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
                <span
                  style={{
                    backgroundColor: 'var(--brand-light)',
                    color: 'var(--brand-primary)',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--brand-border)'
                  }}
                >
                  ACADEMY
                </span>
              </div>
            </div>

            {/* Quick Command Palette Button */}
            <button
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
              }}
              className="desktop-only"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-1.5) var(--space-3)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1.5px solid var(--border-default)',
                boxShadow: '0 2px 0 var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                marginLeft: 'var(--space-2)'
              }}
              title="Search curriculum, actions, views (Cmd+K)"
              aria-label="Open Command Palette"
            >
              <Icon name="search" size={14} />
              <span>Search...</span>
              <kbd style={{
                fontSize: '0.625rem',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                fontFamily: 'var(--font-mono)'
              }}>⌘K</kbd>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', gap: 'var(--space-1.5)' }} className="desktop-only" aria-label="Main Navigation">
            {navTabs.map((tab) => {
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3.5)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1.5px solid var(--brand-border)' : '1.5px solid transparent',
                    boxShadow: isActive ? '0 2px 0 var(--brand-border)' : 'none',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer'
                  }}
                  className={isActive ? '' : 'nav-hover-item'}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon name={tab.iconName} size={17} />
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 800,
                        backgroundColor: 'var(--error-solid)',
                        color: '#FFFFFF',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--error-bevel)'
                      }}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Gamification HUD Pills & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2.5)' }}>
            {/* Streak Pill with Click Popover */}
            <Tooltip content={`${userProgress.streak} day streak (Click for stats)`}>
              <button
                onClick={() => setActiveHudPopover(prev => prev === 'streak' ? null : 'streak')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1.5)',
                  padding: 'var(--space-1) var(--space-3)',
                  backgroundColor: 'var(--streak-bg)',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid #FECDD3',
                  boxShadow: '0 2px 0 #FECDD3',
                  color: 'var(--streak-color)',
                  fontWeight: 800,
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer'
                }}
                className="desktop-only hover-elevate"
                aria-expanded={activeHudPopover === 'streak'}
                aria-label="View streak details"
              >
                <Icon name="flame" size={15} fill="#FDA4AF" />
                <span>{userProgress.streak} DAYS</span>
              </button>
            </Tooltip>

            {/* XP Pill with Click Popover */}
            <Tooltip content={`${userProgress.totalXp.toLocaleString()} Total XP (Click for details)`}>
              <button
                onClick={() => setActiveHudPopover(prev => prev === 'xp' ? null : 'xp')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1.5)',
                  padding: 'var(--space-1) var(--space-3)',
                  backgroundColor: 'var(--warning-bg)',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--warning-border)',
                  boxShadow: '0 2px 0 var(--warning-border)',
                  color: 'var(--warning-text)',
                  fontWeight: 800,
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer'
                }}
                className="desktop-only hover-elevate"
                aria-expanded={activeHudPopover === 'xp'}
                aria-label="View XP and level details"
              >
                <Icon name="sparkles" size={15} fill="var(--warning-border)" />
                <span>{userProgress.totalXp.toLocaleString()} XP</span>
              </button>
            </Tooltip>

            {/* Shields Pill with Click Popover */}
            <Tooltip content="Practice Shields & Energy (Click for status)">
              <button
                onClick={() => setActiveHudPopover(prev => prev === 'energy' ? null : 'energy')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1.5)',
                  padding: 'var(--space-1) var(--space-3)',
                  backgroundColor: 'var(--info-bg)',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--info-border)',
                  boxShadow: '0 2px 0 var(--info-border)',
                  color: 'var(--info-text)',
                  fontWeight: 800,
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer'
                }}
                className="desktop-only hover-elevate"
                aria-expanded={activeHudPopover === 'energy'}
                aria-label="View shields and energy status"
              >
                <Icon name="shield" size={15} fill="var(--info-border)" />
                <span>{userProgress.energy}/{userProgress.maxEnergy}</span>
              </button>
            </Tooltip>

            {/* Theme Toggle Button */}
            <IconButton
              name={theme === 'dark' ? 'sun' : 'moon'}
              label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              tooltip={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              variant="subtle"
              size="sm"
              onClick={toggleTheme}
            />

            {/* Sound Toggle Button */}
            <IconButton
              name={soundEnabled ? 'volume' : 'volume-off'}
              label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              tooltip={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
              variant="subtle"
              size="sm"
              onClick={toggleSound}
            />

            {/* User Avatar with Tactile Frame & Menu */}
            <Tooltip content="Account & Options">
              <div
                onClick={() => setActiveHudPopover(prev => prev === 'avatar' ? null : 'avatar')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                role="button"
                tabIndex={0}
                aria-label="View user profile menu"
                aria-expanded={activeHudPopover === 'avatar'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveHudPopover(prev => prev === 'avatar' ? null : 'avatar');
                }}
              >
                <img
                  src={userProgress.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                  alt={userProgress.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover',
                    border: '2px solid var(--brand-primary)',
                    boxShadow: '0 2px 0 var(--brand-bevel)'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.55rem',
                    fontWeight: 900,
                    padding: '1px 4px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--bg-surface)'
                  }}
                >
                  {userProgress.level || 1}
                </span>
              </div>
            </Tooltip>
          </div>

          {/* Interactive Floating HUD Popovers */}
          {activeHudPopover && (
            <div
              ref={hudPopoverRef}
              className="animate-slide-up"
              style={{
                position: 'absolute',
                top: 'calc(var(--topbar-height) - 4px)',
                right: 'var(--space-5)',
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-default)',
                boxShadow: 'var(--shadow-xl)',
                padding: '18px',
                zIndex: 100,
                color: 'var(--text-primary)'
              }}
            >
              {/* STREAK POPOVER */}
              {activeHudPopover === 'streak' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--streak-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--streak-color)' }}>
                        <Icon name="flame" size={20} fill="#FDA4AF" />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                          {userProgress.streak} Day Streak
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Keep daily momentum
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveHudPopover(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      aria-label="Close"
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
                    Practice each day to solidify muscle memory and prevent streak loss. You have <strong style={{ color: 'var(--text-primary)' }}>1 Streak Freeze</strong> equipped.
                  </p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setActiveHudPopover(null);
                        startLesson(nextLessonId);
                      }}
                      icon={<Icon name="player-play" size={14} fill="#fff" />}
                    >
                      Continue Streak
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setActiveHudPopover(null);
                        navigateTo('/app/dashboard');
                      }}
                    >
                      Calendar
                    </Button>
                  </div>
                </div>
              )}

              {/* XP POPOVER */}
              {activeHudPopover === 'xp' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-text)' }}>
                        <Icon name="sparkles" size={20} fill="var(--warning-border)" />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                          {userProgress.totalXp.toLocaleString()} Total XP
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Level {userProgress.level || 1} • Python Developer
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveHudPopover(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      aria-label="Close"
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Daily Goal</span>
                      <span style={{ color: 'var(--brand-primary)' }}>{userProgress.dailyGoalEarnedXp} / 50 XP</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--border-default)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (userProgress.dailyGoalEarnedXp / 50) * 100)}%`, backgroundColor: 'var(--brand-primary)' }} />
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setActiveHudPopover(null);
                      navigateTo('/app/dashboard');
                    }}
                    icon={<Icon name="chart-bar" size={14} />}
                  >
                    View Weekly Analytics
                  </Button>
                </div>
              )}

              {/* SHIELDS POPOVER */}
              {activeHudPopover === 'energy' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info-text)' }}>
                        <Icon name="shield" size={20} fill="var(--info-border)" />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                          {userProgress.energy} / {userProgress.maxEnergy} Shields
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Practice Protection
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveHudPopover(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      aria-label="Close"
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
                    Shields protect your streak during challenging runs. Practice in the Mistake Bank or Sandbox never depletes shields and restores energy!
                  </p>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setActiveHudPopover(null);
                      navigateTo('/app/practice');
                    }}
                    icon={<Icon name="barbell" size={14} />}
                  >
                    Practice Drills (Free Shields)
                  </Button>
                </div>
              )}

              {/* AVATAR POPOVER */}
              {activeHudPopover === 'avatar' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-default)' }}>
                    <img
                      src={userProgress.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                      alt={userProgress.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
                    />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                        {userProgress.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        @{userProgress.username} • Level {userProgress.level || 1}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setActiveHudPopover(null);
                        navigateTo('/app/profile');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                      className="nav-hover-item"
                    >
                      <Icon name="user" size={16} />
                      <span>View Profile & Badges</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveHudPopover(null);
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                      className="nav-hover-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon name="search" size={16} />
                        <span>Command Palette</span>
                      </div>
                      <kbd style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)' }}>⌘K</kbd>
                    </button>

                    <button
                      onClick={() => {
                        toggleTheme();
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                      className="nav-hover-item"
                    >
                      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
                      <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {currentTab === '/app' && <LearningPath />}
        {currentTab === '/app/dashboard' && <DashboardView />}
        {currentTab === '/app/practice' && <PracticeView />}
        {currentTab === '/app/review' && <MistakeReviewView />}
        {currentTab === '/app/profile' && <ProfileView />}
      </main>

      {/* Global Command Palette (Cmd/Ctrl+K) */}
      <CommandPalette />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
