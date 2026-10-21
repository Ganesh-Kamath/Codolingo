import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { sound } from '../utils/audio';

const AVATAR_PRESETS = [
  { name: 'Scholar', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=scholar' },
  { name: 'Pythonista', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=python' },
  { name: 'Cyber Fox', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=fox' },
  { name: 'Wizard', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=wizard' },
  { name: 'Automaton', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot' },
  { name: 'Night Owl', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=owl' },
];

export const ProfileView: React.FC = () => {
  const { 
    userProfile, 
    navigateTo, 
    theme, 
    toggleTheme, 
    soundEnabled, 
    toggleSound, 
    reducedMotion, 
    toggleReducedMotion,
    updateProfile,
    resetProgress,
    exportProgress,
    importProgress
  } = useApp();

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Edit profile form state
  const [editName, setEditName] = useState<string>(userProfile.name || 'Learner');
  const [editUsername, setEditUsername] = useState<string>(userProfile.username || 'learner');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>(
    userProfile.avatarUrl || AVATAR_PRESETS[0].url
  );

  const displayAvatar = userProfile.avatarUrl || AVATAR_PRESETS[0].url;

  const handleSaveProfile = () => {
    sound.playSuccess();
    updateProfile({
      name: editName.trim() || 'Learner',
      username: editUsername.trim() || 'learner',
      avatarUrl: editAvatarUrl
    });
    setShowEditProfileModal(false);
  };

  const handleSelectDailyGoal = (xpTarget: number) => {
    sound.playClick();
    updateProfile({
      dailyGoalXp: xpTarget
    });
  };

  const handleExportData = () => {
    sound.playClick();
    try {
      const jsonStr = exportProgress();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vyntax-progress-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Unable to generate export file.');
    }
  };

  const handleImportSubmit = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('Please paste your exported JSON backup text.');
      return;
    }
    const success = importProgress(importJsonText.trim());
    if (success) {
      sound.playSuccess();
      setShowImportModal(false);
      setImportJsonText('');
    } else {
      sound.playError();
      setImportError('Invalid backup JSON format. Please ensure you pasted a valid VYNTAX backup.');
    }
  };

  const handleResetAll = () => {
    sound.playClick();
    resetProgress();
    setShowResetConfirmModal(false);
    navigateTo('/app');
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 80px' }} className="animate-fade-in">
      {/* 1. Profile Header Hero */}
      <div
        className="card-plate"
        style={{
          padding: '28px',
          marginBottom: '28px',
          borderLeft: '6px solid var(--brand-primary)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={displayAvatar}
                alt={userProfile.name}
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '3px solid var(--brand-primary)',
                  boxShadow: '0 4px 0 var(--brand-bevel)',
                  backgroundColor: 'var(--bg-surface-subtle)'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--brand-primary)',
                color: '#fff',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                border: '2px solid var(--bg-surface)',
                boxShadow: '0 2px 0 var(--brand-bevel)',
                whiteSpace: 'nowrap'
              }}>
                LVL {userProfile.level}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {userProfile.name}
                </h1>
                <button
                  onClick={() => {
                    sound.playClick();
                    setEditName(userProfile.name || 'Learner');
                    setEditUsername(userProfile.username || 'learner');
                    setEditAvatarUrl(displayAvatar);
                    setShowEditProfileModal(true);
                  }}
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1.5px solid var(--border-default)',
                    boxShadow: '0 1px 0 var(--border-default)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Edit your display name & avatar"
                >
                  <Icon name="pencil" size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 500 }}>
                @{userProfile.username} • Python learner
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-surface-subtle)', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-default)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} /> Joined 2026
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-primary)', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-default)', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Icon name="flame" size={15} style={{ color: 'var(--streak-color)' }} /> <span className="tabular-nums">{userProfile.streak} day streak</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-primary)', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-default)', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Icon name="sparkles" size={15} style={{ color: 'var(--warning-text)' }} /> <span className="tabular-nums">{userProfile.totalXp.toLocaleString()} XP</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Stats Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card-plate" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF1F2', border: '1.5px solid #FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}>
            <Icon name="flame" size={24} fill="#FDA4AF" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              Streak
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {userProfile.streak} {userProfile.streak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        <div className="card-plate" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
            <Icon name="sparkles" size={24} fill="#FDE68A" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              Total XP
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {userProfile.totalXp.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card-plate" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ECFDF5', border: '1.5px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Icon name="circle-check" size={24} stroke={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              Lessons Done
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {userProfile.completedLessonIds.length}
            </div>
          </div>
        </div>

        <div className="card-plate" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
            <Icon name="shield-check" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              Mistakes Reviewed
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }} className="tabular-nums">
              {userProfile.mistakes.filter(m => m.resolved).length}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* 3. Daily Goal */}
        <div className="card-plate" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <Icon name="target" size={20} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Daily goal
            </h2>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Today's progress</span>
              <span style={{ color: 'var(--brand-primary)' }} className="tabular-nums">{userProfile.dailyGoalEarnedXp} / {userProfile.dailyGoalXp} XP</span>
            </div>
            <ProgressBar progress={Math.min(100, (userProfile.dailyGoalEarnedXp / userProfile.dailyGoalXp) * 100)} height={10} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center', fontWeight: 500 }}>
              {userProfile.dailyGoalXp - userProfile.dailyGoalEarnedXp > 0 
                ? `${userProfile.dailyGoalXp - userProfile.dailyGoalEarnedXp} XP remaining to reach today's goal.`
                : "Daily goal achieved."}
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => navigateTo('/app')}
            icon={<Icon name="player-play" size={16} />}
          >
            Continue learning
          </Button>
        </div>

        {/* 4. Achievements Grid */}
        <div className="card-plate" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', boxShadow: '0 2px 0 #FDE68A' }}>
                <Icon name="trophy" size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Achievements
              </h2>
            </div>
            <Badge variant="brand" size="sm">
              {userProfile.achievements.filter(a => a.unlocked).length} / {userProfile.achievements.length} Unlocked
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
            {userProfile.achievements.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 12px',
                  backgroundColor: item.unlocked ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  border: `1.5px solid ${item.unlocked ? '#FDE68A' : 'var(--border-default)'}`,
                  boxShadow: item.unlocked ? '0 4px 0 #B45309' : '0 2px 0 var(--border-default)',
                  textAlign: 'center',
                  transition: 'transform var(--transition-fast)'
                }}
                className={item.unlocked ? 'card-plate-interactive' : ''}
                title={item.description}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: item.unlocked ? '#FEF3C7' : 'var(--bg-surface-subtle)',
                    border: `2px solid ${item.unlocked ? '#F59E0B' : 'var(--border-default)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.unlocked ? '#D97706' : 'var(--text-secondary)',
                    marginBottom: '10px'
                  }}
                >
                  <Icon name={item.unlocked ? 'award' : 'lock'} size={26} stroke={2.5} />
                </div>
                
                <span style={{ fontSize: '0.84rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>
                  {item.title}
                </span>
                
                {!item.unlocked ? (
                  <div style={{ width: '100%', marginTop: '6px' }}>
                    <ProgressBar progress={(item.progress / item.maxProgress) * 100} height={6} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                      {item.progress}/{item.maxProgress}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--success-text)', fontFamily: 'var(--font-display)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                    <Icon name="check" size={12} stroke={3} /> UNLOCKED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Preferences Card */}
      <div className="card-plate" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <Icon name="settings" size={18} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Preferences
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Display, audio, motion, and daily goals.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Theme Appearance */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={18} style={{ color: 'var(--brand-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Theme</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Light or dark interface</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: theme === 'light' ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  backgroundColor: theme === 'light' ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  color: theme === 'light' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Light
              </button>
              <button
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: theme === 'dark' ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  backgroundColor: theme === 'dark' ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  color: theme === 'dark' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Audio Effects */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name={soundEnabled ? 'volume' : 'volume-off'} size={18} style={{ color: 'var(--brand-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Sound effects</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Audio cues for correct answers and completions</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => sound.playSuccess()}
                disabled={!soundEnabled}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: soundEnabled ? 'pointer' : 'not-allowed',
                  opacity: soundEnabled ? 1 : 0.5
                }}
              >
                Test sound
              </button>
              <button
                onClick={toggleSound}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: soundEnabled ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  backgroundColor: soundEnabled ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  color: soundEnabled ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name="player-pause" size={18} style={{ color: 'var(--brand-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Reduced motion</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Minimize animations across views</div>
              </div>
            </div>
            <button
              onClick={toggleReducedMotion}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: reducedMotion ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                backgroundColor: reducedMotion ? 'var(--brand-primary)' : 'var(--bg-surface)',
                color: reducedMotion ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {reducedMotion ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Daily Goal Target */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name="flame" size={18} style={{ color: 'var(--streak-color)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Daily XP target</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target XP to maintain streak rhythm</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[10, 20, 30, 50].map((goal) => {
                const active = userProfile.dailyGoalXp === goal;
                return (
                  <button
                    key={goal}
                    onClick={() => handleSelectDailyGoal(goal)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                      backgroundColor: active ? 'var(--brand-primary)' : 'var(--bg-surface)',
                      color: active ? '#FFFFFF' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {goal} XP
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Data & Backups Card */}
      <div className="card-plate" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <Icon name="database" size={18} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Data & Backups
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              All progress is stored locally in your browser. Export or restore backups at any time.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Local progress snapshot</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Export your curriculum progress, challenge history, and XP snapshot</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
              icon={<Icon name="download" size={14} />}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                sound.playClick();
                setImportError(null);
                setImportJsonText('');
                setShowImportModal(true);
              }}
              icon={<Icon name="upload" size={14} />}
            >
              Import JSON
            </Button>
          </div>
        </div>
      </div>

      {/* 7. About VYNTAX Card */}
      <div className="card-plate" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <Icon name="info-circle" size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  About VYNTAX
                </h2>
                <Badge variant="brand" size="sm">v2025.1</Badge>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Client-side Python deliberate practice. Runs locally in your browser.
              </p>
            </div>
          </div>
          <a
            href="mailto:feedback@vyntax.dev?subject=VYNTAX%20Feedback"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Icon name="mail" size={14} />
            <span>Send feedback</span>
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => {
              sound.playClick();
              setShowShortcutsModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            className="nav-hover-item"
          >
            <Icon name="keyboard" size={16} style={{ color: 'var(--brand-primary)' }} />
            <span>Keyboard shortcuts</span>
          </button>

          <button
            onClick={() => navigateTo('/changelog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            className="nav-hover-item"
          >
            <Icon name="sparkles" size={16} style={{ color: 'var(--warning-text)' }} />
            <span>Changelog</span>
          </button>

          <button
            onClick={() => navigateTo('/privacy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            className="nav-hover-item"
          >
            <Icon name="shield-check" size={16} style={{ color: 'var(--brand-primary)' }} />
            <span>Privacy policy</span>
          </button>

          <button
            onClick={() => navigateTo('/terms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            className="nav-hover-item"
          >
            <Icon name="file-text" size={16} style={{ color: 'var(--text-secondary)' }} />
            <span>Terms of service</span>
          </button>
        </div>
      </div>

      {/* 8. Danger Zone Card */}
      <div
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--error-border)',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--error-solid)', margin: '0 0 4px' }}>
              Danger Zone
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '580px', lineHeight: 1.5 }}>
              Permanently reset your XP, streaks, completed units, and review logs back to the initial state. This cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              sound.playClick();
              setShowResetConfirmModal(true);
            }}
            icon={<Icon name="trash" size={14} />}
          >
            Reset Progress
          </Button>
        </div>
      </div>

      {/* MODAL 1: Edit Profile */}
      <Modal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        title="Edit Learner Profile"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" size="md" onClick={() => setShowEditProfileModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveProfile} icon={<Icon name="check" size={16} />}>
              Save Profile
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Display Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Username Handle
            </label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              placeholder="username"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Choose Avatar
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              {AVATAR_PRESETS.map((preset) => {
                const selected = editAvatarUrl === preset.url;
                return (
                  <button
                    key={preset.name}
                    onClick={() => {
                      sound.playClick();
                      setEditAvatarUrl(preset.url);
                    }}
                    style={{
                      border: selected ? '2.5px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
                      boxShadow: selected ? '0 3px 0 var(--brand-bevel)' : '0 1px 0 var(--border-default)',
                      borderRadius: '14px',
                      padding: '4px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      cursor: 'pointer',
                      transform: selected ? 'scale(1.05)' : 'none',
                      transition: 'all 120ms ease'
                    }}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Import JSON Backup */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Progress Backup (JSON)"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" size="md" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleImportSubmit} icon={<Icon name="upload" size={16} />}>
              Restore Backup
            </Button>
          </div>
        }
      >
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Paste the raw JSON content of your exported backup file below to restore your progress:
          </p>
          <textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder='{"version": 1, "userProgress": { ... }}'
            style={{
              width: '100%',
              height: '160px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8rem',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              resize: 'vertical'
            }}
          />
          {importError && (
            <div style={{ marginTop: '10px', color: 'var(--error-text)', fontSize: '0.82rem', fontWeight: 700 }}>
              {importError}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 3: Reset Confirmation */}
      <Modal
        isOpen={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        title="Reset All Progress?"
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" size="md" onClick={() => setShowResetConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleResetAll} icon={<Icon name="trash" size={16} />}>
              Yes, Reset Everything
            </Button>
          </div>
        }
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            This will permanently reset your XP, current streak, completed units, challenge solutions, and mistake drill logs back to initial state.
          </p>
          <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: 'var(--error-bg, #FEF2F2)', borderRadius: '8px', border: '1px solid var(--error-border, #FECACA)', color: 'var(--error-text, #991B1B)', fontSize: '0.8rem', fontWeight: 700 }}>
            Tip: You can export a JSON backup first to save your current progress.
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Keyboard Shortcuts */}
      <Modal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        title="Keyboard Shortcuts"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="md" onClick={() => setShowShortcutsModal(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { key: '⌘ K / Ctrl+K', desc: 'Open Command Palette from any screen' },
            { key: '⌘ ↵ / Ctrl+Enter', desc: 'Run code in the interactive editor' },
            { key: '1 – 4', desc: 'Select multiple-choice option directly' },
            { key: 'Esc', desc: 'Close open dialogs, modals, or popovers' },
            { key: 'Tab / Shift+Tab', desc: 'Navigate between interactive controls' },
            { key: 'Space / Enter', desc: 'Trigger selected action or button' }
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)'
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
              <kbd
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 1px 0 var(--border-default)',
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
