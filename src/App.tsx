import React from 'react';
import { useApp } from './context/AppContext';
import { LearningPath } from './components/path/LearningPath';
import { MultiStepLessonView } from './views/MultiStepLessonView';
import { PracticeView } from './views/PracticeView';
import { MistakeReviewView } from './views/MistakeReviewView';
import { ProfileView } from './views/ProfileView';
import { OnboardingView } from './views/OnboardingView';
import { Icon } from './components/ui/Icon';

export const AppContent: React.FC = () => {
  const { 
    currentRoute, 
    navigateTo, 
    activeLesson, 
    userProgress, 
    soundEnabled, 
    toggleSound, 
    course 
  } = useApp();

  // 1. If an active lesson is running, render full-screen interactive lesson runner
  if (currentRoute.startsWith('/app/lesson/')) {
    const lessonId = currentRoute.replace('/app/lesson/', '');
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

  const currentTab = currentRoute === '/' ? '/app' : currentRoute;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Header / Stitch DevRealm Odyssey HUD */}
      <header
        style={{
          height: '68px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1.5px solid var(--border-default)',
          boxShadow: '0 2px 0 var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 20px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Brand Logo & Course Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              onClick={() => navigateTo('/app')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
                  Codolingo
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--brand-light)',
                    color: 'var(--brand-primary)',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    padding: '1px 6px',
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1.5px solid var(--border-default)',
                boxShadow: '0 2px 0 var(--border-default)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              title="Python Track Active"
            >
              <Icon name="terminal" size={15} style={{ color: '#4338CA' }} />
              <span>{course.title}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', gap: '8px' }} className="desktop-only">
            {navTabs.map((tab) => {
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1.5px solid var(--brand-border)' : '1.5px solid transparent',
                    boxShadow: isActive ? '0 2px 0 var(--brand-border)' : 'none',
                    transition: 'all 120ms ease'
                  }}
                  className={isActive ? '' : 'nav-hover-item'}
                >
                  <Icon name={tab.iconName} size={17} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)' }} />
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid #DC2626'
                      }}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Gamification HUD Pills & Sound & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Streak Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                backgroundColor: '#FFF1F2',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid #FECDD3',
                boxShadow: '0 2px 0 #FECDD3',
                color: '#E11D48',
                fontWeight: 800,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-display)'
              }}
              className="desktop-only"
              title={`${userProgress.streak} day streak`}
            >
              <Icon name="flame" size={15} fill="#FDA4AF" />
              <span>{userProgress.streak} DAYS</span>
            </div>

            {/* XP Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                backgroundColor: '#FEF3C7',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid #FDE68A',
                boxShadow: '0 2px 0 #FDE68A',
                color: '#B45309',
                fontWeight: 800,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-display)'
              }}
              className="desktop-only"
              title={`${userProgress.totalXp} Total XP`}
            >
              <Icon name="sparkles" size={15} fill="#FDE68A" />
              <span>{userProgress.totalXp.toLocaleString()} XP</span>
            </div>

            {/* Shields Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                backgroundColor: '#EFF6FF',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid #BFDBFE',
                boxShadow: '0 2px 0 #BFDBFE',
                color: '#1D4ED8',
                fontWeight: 800,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-display)'
              }}
              className="desktop-only"
              title="Practice Shields"
            >
              <Icon name="shield" size={15} fill="#BFDBFE" />
              <span>{userProgress.energy}/{userProgress.maxEnergy}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1.5px solid var(--border-default)',
                boxShadow: '0 2px 0 var(--border-default)',
                color: soundEnabled ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            >
              {soundEnabled ? <Icon name="volume" size={17} /> : <Icon name="volume-off" size={17} />}
            </button>

            {/* User Avatar with Tactile Frame */}
            <div
              onClick={() => navigateTo('/app/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              title="View Profile"
            >
              <img
                src={userProgress.avatarUrl}
                alt={userProgress.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
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
                  border: '1.5px solid #FFFFFF'
                }}
              >
                12
              </span>
            </div>
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
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-default)',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 40
        }}
        className="mobile-only flex-between"
      >
        {navTabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                flex: 1,
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)'
              }}
            >
              <Icon name={tab.iconName} size={18} />
              <span style={{ fontSize: '0.6875rem', fontWeight: isActive ? 700 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
