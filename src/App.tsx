import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useApp } from './context/AppContext';
import { Icon } from './components/ui/Icon';
import { Button, IconButton, Tooltip, CommandPalette, Skeleton, BrandLogo, ErrorBoundary } from './components/common';
import { BottomNav } from './components/layout/BottomNav';
import { progressionService } from './services/progressionService';

// Route-Level Code Splitting (React.lazy)
const LearningPath = React.lazy(() => import('./components/path/LearningPath').then(m => ({ default: m.LearningPath })));
const DashboardView = React.lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const MultiStepLessonView = React.lazy(() => import('./views/MultiStepLessonView').then(m => ({ default: m.MultiStepLessonView })));
const PracticeView = React.lazy(() => import('./views/PracticeView').then(m => ({ default: m.PracticeView })));
const MistakeReviewView = React.lazy(() => import('./views/MistakeReviewView').then(m => ({ default: m.MistakeReviewView })));
const ProfileView = React.lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));
const OnboardingView = React.lazy(() => import('./views/OnboardingView').then(m => ({ default: m.OnboardingView })));
const LandingPage = React.lazy(() => import('./views/LandingPage').then(m => ({ default: m.LandingPage })));
const NotFoundView = React.lazy(() => import('./views/NotFoundView').then(m => ({ default: m.NotFoundView })));
const PrivacyView = React.lazy(() => import('./views/PrivacyView').then(m => ({ default: m.PrivacyView })));
const TermsView = React.lazy(() => import('./views/TermsView').then(m => ({ default: m.TermsView })));
const ChangelogView = React.lazy(() => import('./views/ChangelogView').then(m => ({ default: m.ChangelogView })));

const ViewLoadingFallback = () => (
  <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--space-8) var(--space-5)' }}>
    <Skeleton height="44px" width="280px" radius="md" style={{ marginBottom: 'var(--space-6)' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
      <Skeleton height="110px" radius="lg" />
      <Skeleton height="110px" radius="lg" />
      <Skeleton height="110px" radius="lg" />
      <Skeleton height="110px" radius="lg" />
    </div>
    <Skeleton height="320px" radius="xl" />
  </div>
);

const LessonLoadingFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
    {/* Lesson Top Bar Skeleton */}
    <div style={{ height: '64px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px' }}>
      <Skeleton height="36px" width="36px" radius="full" />
      <div style={{ flex: 1, maxWidth: '600px' }}>
        <Skeleton height="12px" radius="full" />
      </div>
      <Skeleton height="32px" width="70px" radius="full" />
    </div>
    {/* Lesson Content Skeleton */}
    <div style={{ flex: 1, maxWidth: '780px', width: '100%', margin: '0 auto', padding: '32px 20px 140px' }}>
      <Skeleton height="28px" width="140px" radius="md" style={{ marginBottom: '16px' }} />
      <Skeleton height="40px" width="80%" radius="md" style={{ marginBottom: '24px' }} />
      <Skeleton height="120px" radius="xl" style={{ marginBottom: '24px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton height="60px" radius="xl" />
        <Skeleton height="60px" radius="xl" />
        <Skeleton height="60px" radius="xl" />
      </div>
    </div>
    {/* Footer Drawer Skeleton */}
    <div style={{ height: '80px', borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
      <div style={{ maxWidth: '820px', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <Skeleton height="48px" width="160px" radius="xl" />
      </div>
    </div>
  </div>
);

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

  // Dynamic Route Document Titles
  useEffect(() => {
    let title = 'VYNTAX — Algorithmic Mastery & Forward Momentum';
    if (currentRoute === '/' || currentRoute === '/landing') {
      title = 'VYNTAX — Learn to code. Practice with purpose. Become a developer.';
    } else if (currentRoute === '/app' || currentRoute === '/app/learn') {
      title = 'Curriculum Matrix — VYNTAX';
    } else if (currentRoute === '/app/dashboard') {
      title = 'Flight Dashboard — VYNTAX';
    } else if (currentRoute.startsWith('/app/practice')) {
      title = 'Code Engine & Practice — VYNTAX';
    } else if (currentRoute.startsWith('/app/projects')) {
      title = 'Systems Projects — VYNTAX';
    } else if (currentRoute.startsWith('/app/review')) {
      title = 'Fix-It Telemetry Lab — VYNTAX';
    } else if (currentRoute.startsWith('/app/profile')) {
      title = 'Operator Profile & Preferences — VYNTAX';
    } else if (currentRoute.startsWith('/app/lesson/')) {
      const id = currentRoute.replace('/app/lesson/', '');
      title = `Flight Mission ${id} — VYNTAX`;
    } else if (currentRoute === '/privacy') {
      title = 'Privacy Protocol — VYNTAX';
    } else if (currentRoute === '/terms') {
      title = 'Terms of Service — VYNTAX';
    } else if (currentRoute === '/changelog') {
      title = 'System Changelog — VYNTAX';
    } else if (currentRoute === '/onboarding') {
      title = 'Welcome Operator — VYNTAX';
    } else {
      title = '404 Vector Lost — VYNTAX';
    }
    document.title = title;
  }, [currentRoute]);

  // Sensible scroll restoration
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentRoute]);

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

  // 1. Landing Page route
  if (currentRoute === '/' || currentRoute === '/landing') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  // 2. Privacy Policy route
  if (currentRoute === '/privacy') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <PrivacyView />
      </Suspense>
    );
  }

  // 3. Terms of Service route
  if (currentRoute === '/terms') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <TermsView />
      </Suspense>
    );
  }

  // 4. Changelog route
  if (currentRoute === '/changelog') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <ChangelogView />
      </Suspense>
    );
  }

  // 5. Onboarding route
  if (currentRoute === '/onboarding') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <OnboardingView />
      </Suspense>
    );
  }

  // 3. Full-Screen Interactive Lesson Runner
  if (currentRoute.startsWith('/app/lesson/')) {
    const lessonId = currentRoute.replace('/app/lesson/', '').split('?')[0].split('#')[0].replace(/\/+$/, '');
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
            You have not unlocked this lesson yet. Complete preceding lessons in your learning path to continue.
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
    return (
      <ErrorBoundary resetKey={lessonId}>
        <Suspense fallback={<LessonLoadingFallback />}>
          <MultiStepLessonView lessonId={lessonId} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // 4. Navigation tabs
  const navTabs = [
    { id: '/app', label: 'Path', iconName: 'map' },
    { id: '/app/dashboard', label: 'Dashboard', iconName: 'layout-dashboard' },
    { id: '/app/practice', label: 'Practice', iconName: 'barbell' },
    { 
      id: '/app/review', 
      label: 'Fix-It Lab', 
      iconName: 'history', 
      badge: userProgress.mistakes.filter(m => !m.resolved).length 
    },
    { id: '/app/profile', label: 'Profile', iconName: 'user' }
  ];

  // Route matching
  const isKnownRoute = 
    currentRoute === '/app' || 
    currentRoute === '/app/learn' || 
    currentRoute === '/app/dashboard' || 
    currentRoute.startsWith('/app/practice') || 
    currentRoute.startsWith('/app/projects') || 
    currentRoute.startsWith('/app/review') || 
    currentRoute.startsWith('/app/profile');

  const currentTab = 
    (currentRoute === '/app' || currentRoute === '/app/learn')
      ? '/app'
      : currentRoute === '/app/dashboard'
      ? '/app/dashboard'
      : currentRoute.startsWith('/app/practice') || currentRoute.startsWith('/app/projects')
      ? '/app/practice'
      : currentRoute.startsWith('/app/review')
      ? '/app/review'
      : currentRoute.startsWith('/app/profile')
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
      {/* Top Application Header HUD */}
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
            maxWidth: '1500px',
            margin: '0 auto',
            padding: '0 28px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            gap: '16px'
          }}
        >
          {/* Brand Logo & Telemetry Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
            <BrandLogo size="md" showSubtitle={true} subtitle="Systems Architecture" onClick={() => navigateTo('/app')} />

            <div
              className="desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                marginLeft: 'var(--space-2)',
                whiteSpace: 'nowrap',
                userSelect: 'none'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  boxShadow: '0 0 6px var(--brand-primary)',
                  flexShrink: 0
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--brand-primary)',
                  textTransform: 'uppercase'
                }}
              >
                MATRIX v2025.1
              </span>
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
                gap: '6px',
                padding: '5px 12px',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                marginLeft: 'var(--space-1)',
                whiteSpace: 'nowrap',
                transition: 'border-color var(--transition-fast)'
              }}
              title="Search curriculum, actions, views (Cmd+K)"
              aria-label="Open Command Palette"
            >
              <Icon name="search" size={13} />
              <span>Search</span>
              <kbd style={{
                fontSize: '0.625rem',
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)'
              }}>⌘K</kbd>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center', flexShrink: 0 }} className="desktop-only" aria-label="Main Navigation">
            {navTabs.map((tab) => {
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--brand-border)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  className={isActive ? '' : 'nav-hover-item'}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon name={tab.iconName} size={16} />
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--error-bg)',
                        color: 'var(--error-text)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--error-border)'
                      }}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Gamification HUD Indicators & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
            {/* Streak Pill */}
            <Tooltip content={`${userProgress.streak} day streak (Click for stats)`}>
              <button
                onClick={() => setActiveHudPopover(prev => prev === 'streak' ? null : 'streak')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer'
                }}
                className="desktop-only"
                aria-expanded={activeHudPopover === 'streak'}
                aria-label="View streak details"
              >
                <Icon name="flame" size={14} style={{ color: 'var(--streak-color)' }} />
                <span className="tabular-nums">{userProgress.streak}d</span>
              </button>
            </Tooltip>

            {/* XP Pill */}
            <Tooltip content={`${userProgress.totalXp.toLocaleString()} Total XP (Click for details)`}>
              <button
                onClick={() => setActiveHudPopover(prev => prev === 'xp' ? null : 'xp')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer'
                }}
                className="desktop-only"
                aria-expanded={activeHudPopover === 'xp'}
                aria-label="View XP and level details"
              >
                <Icon name="sparkles" size={14} style={{ color: 'var(--xp-color)' }} />
                <span className="tabular-nums">{userProgress.totalXp.toLocaleString()} XP</span>
              </button>
            </Tooltip>

            {/* Shields Pill */}
            <Tooltip content="Practice Shields & Energy">
              <button
                onClick={() => setActiveHudPopover(prev => prev === 'energy' ? null : 'energy')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer'
                }}
                className="desktop-only"
                aria-expanded={activeHudPopover === 'energy'}
                aria-label="View shields and energy status"
              >
                <Icon name="shield" size={14} style={{ color: 'var(--info-text)' }} />
                <span className="tabular-nums">{userProgress.energy}/{userProgress.maxEnergy}</span>
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

            {/* User Avatar */}
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
                  src={userProgress.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=learner'}
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
                      <span style={{ color: 'var(--brand-primary)' }}>{userProgress.dailyGoalEarnedXp} / {userProgress.dailyGoalXp || 50} XP</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--border-default)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (userProgress.dailyGoalEarnedXp / (userProgress.dailyGoalXp || 50)) * 100)}%`, backgroundColor: 'var(--brand-primary)' }} />
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
                      src={userProgress.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=learner'}
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

                    <button
                      onClick={() => {
                        setActiveHudPopover(null);
                        navigateTo('/landing');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                      className="nav-hover-item"
                    >
                      <Icon name="compass" size={16} />
                      <span>About / Overview</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Body with Suspense */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        <Suspense fallback={<ViewLoadingFallback />}>
          {!isKnownRoute ? (
            <NotFoundView />
          ) : currentTab === '/app' ? (
            <LearningPath />
          ) : currentTab === '/app/dashboard' ? (
            <DashboardView />
          ) : currentTab === '/app/practice' ? (
            <PracticeView />
          ) : currentTab === '/app/review' ? (
            <MistakeReviewView />
          ) : currentTab === '/app/profile' ? (
            <ProfileView />
          ) : (
            <LearningPath />
          )}
        </Suspense>
      </main>

      {/* Global Command Palette (Cmd/Ctrl+K) */}
      <CommandPalette />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
