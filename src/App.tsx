import React from 'react';
import { useApp } from './context/AppContext';
import { LearningPath } from './components/path/LearningPath';
import { MultiStepLessonView } from './views/MultiStepLessonView';
import { PracticeView } from './views/PracticeView';
import { MistakeReviewView } from './views/MistakeReviewView';
import { ProfileView } from './views/ProfileView';
import { OnboardingView } from './views/OnboardingView';
import { Icon } from './components/ui/Icon';
import { Button, IconButton, Badge, Tooltip } from './components/common';
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
    course 
  } = useApp();

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
    { id: '/app', label: 'Learn', iconName: 'book' },
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
      : rawTab.startsWith('/app/practice') || rawTab.startsWith('/app/projects')
      ? '/app/practice'
      : rawTab.startsWith('/app/review')
      ? '/app/review'
      : rawTab.startsWith('/app/profile')
      ? '/app/profile'
      : '/app';

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
            justifyContent: 'space-between'
          }}
        >
          {/* Brand Logo & Course Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
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

            {/* Course Selector Dropdown Pill */}
            <div
              className="desktop-only"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-1.5) var(--space-3)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1.5px solid var(--border-default)',
                boxShadow: '0 2px 0 var(--border-default)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              title="Python Track Active"
            >
              <Icon name="terminal" size={15} style={{ color: 'var(--brand-primary)' }} />
              <span>{course.title}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', gap: 'var(--space-2)' }} className="desktop-only" aria-label="Main Navigation">
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
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1.5px solid var(--brand-border)' : '1.5px solid transparent',
                    boxShadow: isActive ? '0 2px 0 var(--brand-border)' : 'none',
                    transition: 'all var(--transition-fast)'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Streak Pill */}
            <Tooltip content={`${userProgress.streak} day streak`}>
              <div
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
                  fontFamily: 'var(--font-display)'
                }}
                className="desktop-only"
              >
                <Icon name="flame" size={15} fill="#FDA4AF" />
                <span>{userProgress.streak} DAYS</span>
              </div>
            </Tooltip>

            {/* XP Pill */}
            <Tooltip content={`${userProgress.totalXp.toLocaleString()} Total XP`}>
              <div
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
                  fontFamily: 'var(--font-display)'
                }}
                className="desktop-only"
              >
                <Icon name="sparkles" size={15} fill="var(--warning-border)" />
                <span>{userProgress.totalXp.toLocaleString()} XP</span>
              </div>
            </Tooltip>

            {/* Shields Pill */}
            <Tooltip content="Practice Shields & Energy">
              <div
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
                  fontFamily: 'var(--font-display)'
                }}
                className="desktop-only"
              >
                <Icon name="shield" size={15} fill="var(--info-border)" />
                <span>{userProgress.energy}/{userProgress.maxEnergy}</span>
              </div>
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

            {/* User Avatar with Tactile Frame */}
            <Tooltip content="View Profile">
              <div
                onClick={() => navigateTo('/app/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                role="button"
                tabIndex={0}
                aria-label="View user profile"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigateTo('/app/profile');
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
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {currentTab === '/app' && <LearningPath />}
        {currentTab === '/app/practice' && <PracticeView />}
        {currentTab === '/app/review' && <MistakeReviewView />}
        {currentTab === '/app/profile' && <ProfileView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
