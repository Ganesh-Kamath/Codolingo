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
      {/* Top Application Header */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-default)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
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
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                }}
              >
                <Icon name="code" size={20} stroke={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
                Codon
              </span>
            </div>

            {/* Course Selector Dropdown Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              title="Python Track Active"
            >
              <Icon name="terminal" size={14} style={{ color: '#2563EB' }} />
              <span>{course.title}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', gap: '6px' }} className="desktop-only">
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
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                    color: isActive ? 'var(--brand-text)' : 'var(--text-secondary)',
                    transition: 'all 150ms'
                  }}
                  className={isActive ? '' : 'nav-hover-item'}
                >
                  <Icon name={tab.iconName} size={16} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)' }} />
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Quick Sound Toggle & Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={toggleSound}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: soundEnabled ? 'var(--text-secondary)' : 'var(--text-muted)'
              }}
              title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            >
              {soundEnabled ? <Icon name="volume" size={18} /> : <Icon name="volume-off" size={18} />}
            </button>

            <img
              src={userProgress.avatarUrl}
              alt={userProgress.name}
              onClick={() => navigateTo('/app/profile')}
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--border-default)' }}
            />
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
