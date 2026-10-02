import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SkillNode, Unit } from '../../types';
import { Icon } from '../ui/Icon';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

export const LearningPath: React.FC = () => {
  const { 
    course, 
    userProgress, 
    startLesson, 
    selectedSkillForModal, 
    setSelectedSkillForModal,
    navigateTo 
  } = useApp();

  // Find the current skill and active lesson to recommend in "Continue Learning"
  let currentSkill: SkillNode | null = null;
  for (const unit of course.units) {
    const s = unit.skills.find(item => item.id === userProgress.currentSkillId);
    if (s) {
      currentSkill = s;
      break;
    }
  }

  if (!currentSkill) {
    currentSkill = course.units[0].skills[1]; // fallback to Variables
  }

  const nextLesson = currentSkill.lessons[0] || {
    id: 'les_var_1',
    title: 'What is a Variable?',
    estimatedMinutes: 4,
    xpReward: 20
  };



  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 20px 80px' }} className="animate-fade-in">
      {/* 1. TOP STATS BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          padding: '14px 22px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-xs)',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={userProgress.avatarUrl}
            alt={userProgress.name}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
          />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {getGreeting()}, {userProgress.name.split(' ')[0]} 👋
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Python Developer Track • Unit 1
            </div>
          </div>
        </div>

        {/* Gamification Counters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Streak */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#FFF1F2',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #FECDD3',
              color: '#E11D48',
              fontWeight: 700,
              fontSize: '0.84rem'
            }}
            title={`${userProgress.streak} day streak`}
          >
            <Icon name="flame" size={16} fill="#FDA4AF" />
            <span>{userProgress.streak}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>DAYS</span>
          </div>

          {/* XP */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#FEF3C7',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #FDE68A',
              color: '#B45309',
              fontWeight: 700,
              fontSize: '0.84rem'
            }}
            title={`${userProgress.totalXp} XP`}
          >
            <Icon name="sparkles" size={16} fill="#FDE68A" />
            <span>{userProgress.totalXp.toLocaleString()}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>XP</span>
          </div>

          {/* Energy / Shields */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#EFF6FF',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.84rem'
            }}
            title="Non-punitive learning shields"
          >
            <Icon name="shield" size={16} fill="#BFDBFE" />
            <span>{userProgress.energy}/{userProgress.maxEnergy}</span>
          </div>

          {/* Daily Goal Mini Pill */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '90px' }} className="desktop-only">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>Daily Goal</span>
              <span style={{ color: 'var(--brand-primary)' }}>{userProgress.dailyGoalEarnedXp}/{userProgress.dailyGoalXp} XP</span>
            </div>
            <ProgressBar progress={(userProgress.dailyGoalEarnedXp / userProgress.dailyGoalXp) * 100} height={5} />
          </div>
        </div>
      </div>

      {/* 2. PROMINENT "CONTINUE LEARNING" ACTION BAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--brand-primary)',
          padding: '22px 26px',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)'
        }}
        className="animate-slide-up"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: 'var(--brand-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}
          >
            <Icon name={currentSkill.iconName || 'code'} size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-text)' }}>
                Current Objective • Unit 1
              </span>
              <Badge variant="brand" size="sm">Mastery {userProgress.skillMastery[currentSkill.id] || 0}/5</Badge>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {currentSkill.title}: {nextLesson.title}
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              ~{nextLesson.estimatedMinutes} min micro-session • Step-by-step interactive coding
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => startLesson(nextLesson.id)}
          icon={<Icon name="player-play" size={16} fill="#fff" />}
          iconPosition="left"
        >
          Continue Path
        </Button>
      </div>

      {/* 3. THE SPATIAL LEARNING PATH */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', position: 'relative' }}>
        {course.units.map((unit) => {
          return (
            <div key={unit.id} style={{ position: 'relative' }}>
              {/* Unit Header Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-default)',
                  padding: '20px 24px',
                  marginBottom: '32px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `6px solid ${unit.themeColor}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: unit.themeColor
                      }}
                    >
                      {unit.title}
                    </span>
                    <span style={{ color: 'var(--border-strong)' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {unit.subtitle}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {unit.description}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {unit.skills.filter(s => userProgress.completedSkillIds.includes(s.id)).length} of {unit.skills.length} Skills
                  </span>
                </div>
              </div>

              {/* Sinuous Stepping-Stone Node Container */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '36px',
                  position: 'relative',
                  padding: '10px 0'
                }}
              >
                {/* SVG Connecting Path Line */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '260px',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                >
                  <line
                    x1="130"
                    y1="20"
                    x2="130"
                    y2="95%"
                    stroke="var(--border-default)"
                    strokeWidth="4"
                    strokeDasharray="6 6"
                  />
                </svg>

                {/* Skill Nodes */}
                {unit.skills.map((skill) => {
                  const isCompleted = userProgress.completedSkillIds.includes(skill.id);
                  const isCurrent = skill.id === userProgress.currentSkillId;
                  const isUnlocked = isCompleted || isCurrent || skill.status === 'unlocked';
                  const isLocked = !isUnlocked;
                  const mastery = userProgress.skillMastery[skill.id] || 0;

                  // Horizontal offset in pixels (-48px left, 0 center, +48px right)
                  const xOffset = (skill.pathOffset || 0) * 70;

                  return (
                    <div
                      key={skill.id}
                      style={{
                        transform: `translateX(${xOffset}px)`,
                        zIndex: 10,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      {/* Node Button */}
                      <button
                        onClick={() => {
                          if (isUnlocked) {
                            setSelectedSkillForModal(skill);
                          }
                        }}
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted
                            ? '#10B981'
                            : isCurrent
                            ? '#FFFFFF'
                            : isLocked
                            ? '#F3F4F6'
                            : '#FFFFFF',
                          border: isCurrent
                            ? '4px solid #10B981'
                            : isCompleted
                            ? '4px solid #059669'
                            : '3px solid #E5E7EB',
                          boxShadow: isCurrent
                            ? '0 0 0 6px rgba(16, 185, 129, 0.2), 0 8px 16px rgba(16, 185, 129, 0.25)'
                            : isCompleted
                            ? '0 4px 10px rgba(16, 185, 129, 0.25)'
                            : 'var(--shadow-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isCompleted ? '#FFFFFF' : isCurrent ? '#10B981' : isLocked ? '#9CA3AF' : '#374151',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                          position: 'relative'
                        }}
                        className={isCurrent ? 'hover-elevate current-node-pulse' : 'hover-elevate'}
                        title={isLocked ? `Locked: Complete prior skills to unlock` : `${skill.title} (Click to inspect)`}
                      >
                        {isCompleted ? (
                          <Icon name="check" size={32} stroke={3} />
                        ) : isLocked ? (
                          <Icon name="lock" size={24} />
                        ) : (
                          <Icon name={skill.iconName || 'code'} size={28} />
                        )}

                        {/* Top Badge for Current Node */}
                        {isCurrent && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-16px',
                              backgroundColor: '#10B981',
                              color: '#FFFFFF',
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              letterSpacing: '0.05em',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            START
                          </div>
                        )}
                      </button>

                      {/* Skill Title Label */}
                      <div
                        style={{
                          marginTop: '8px',
                          textAlign: 'center',
                          maxWidth: '120px'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: isCurrent ? 800 : 700,
                            color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                            lineHeight: 1.2
                          }}
                        >
                          {skill.title}
                        </div>

                        {/* Mastery Stars/Dots */}
                        {isUnlocked && (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '3px',
                              marginTop: '4px'
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  backgroundColor: level <= mastery ? '#10B981' : '#D1D5DB'
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Unit Checkpoint Node */}
                <div
                  style={{
                    zIndex: 10,
                    marginTop: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      backgroundColor: '#F9FAFB',
                      border: '3px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9CA3AF',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                    title={`${unit.checkpoint.title} (${unit.checkpoint.description})`}
                  >
                    <Icon name="trophy" size={26} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '6px' }}>
                    {unit.checkpoint.title}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SKILL INSPECTION POPUP DRAWER MODAL */}
      {selectedSkillForModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setSelectedSkillForModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative'
            }}
            className="animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)'
                }}
              >
                <Icon name={selectedSkillForModal.iconName || 'code'} size={26} />
              </div>
              <div>
                <Badge variant="brand" size="sm">
                  Mastery {userProgress.skillMastery[selectedSkillForModal.id] || 0} / 5
                </Badge>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {selectedSkillForModal.title}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              {selectedSkillForModal.description}
            </p>

            {/* Micro-lessons List */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Skill Micro-Lessons
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedSkillForModal.lessons.length > 0 ? (
                  selectedSkillForModal.lessons.map((les, idx) => {
                    const isDone = userProgress.completedLessonIds.includes(les.id);

                    return (
                      <div
                        key={les.id}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-app)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? '#10B981' : '#E5E7EB',
                              color: isDone ? '#FFFFFF' : '#6B7280',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isDone ? '✓' : idx + 1}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {les.title}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ~{les.estimatedMinutes} min • +{les.xpReward} XP
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Practice sessions unlock as you advance through the curriculum.
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedSkillForModal(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const lessonToRun = selectedSkillForModal.lessons[0] || nextLesson;
                  startLesson(lessonToRun.id);
                }}
                icon={<Icon name="player-play" size={14} fill="#fff" />}
              >
                Start Lesson (+20 XP)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
