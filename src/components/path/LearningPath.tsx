import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SkillNode, Unit } from '../../types';
import { Icon } from '../ui/Icon';
import { Button, Badge, ProgressBar, Modal } from '../common';

const UnitProgressRing: React.FC<{ progress: number; size?: number; color?: string }> = ({ progress, size = 48, color = 'var(--brand-primary)' }) => {
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-default)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '0.68rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        {progress}%
      </span>
    </div>
  );
};

export const LearningPath: React.FC = () => {
  const { 
    course, 
    userProgress, 
    startLesson, 
    selectedSkillForModal, 
    setSelectedSkillForModal,
    navigateTo 
  } = useApp();

  const [activeCapstoneUnit, setActiveCapstoneUnit] = useState<Unit | null>(null);
  const [renderedUnitsCount, setRenderedUnitsCount] = useState<number>(6);

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
    currentSkill = course.units[0]?.skills[0];
  }

  const nextLesson = currentSkill?.lessons[0] || {
    id: '1.1',
    title: 'What Is Programming?',
    estimatedMinutes: 4,
    xpReward: 25
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper to render the serpentine winding SVG track for a given unit's skills
  const renderSerpentineTrack = (unit: Unit) => {
    const skills = unit.skills;
    const unitCheckpoint = unit.checkpoint;
    const nodeSpacing = 110;
    const centerX = 160;
    const totalHeight = skills.length * nodeSpacing + 100;

    // Calculate node coordinates
    const coords = skills.map((skill, i) => {
      const offset = (skill.pathOffset || 0) * 60;
      return {
        x: centerX + offset,
        y: 50 + i * nodeSpacing
      };
    });

    // Add checkpoint coordinate at the end
    const checkpointCoord = { x: centerX, y: 50 + skills.length * nodeSpacing };

    // Build smooth cubic bezier SVG path string
    let pathD = `M ${coords[0]?.x || centerX} ${coords[0]?.y || 50}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const midY = (curr.y + next.y) / 2;
      pathD += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
    }
    if (coords.length > 0) {
      const last = coords[coords.length - 1];
      const midY = (last.y + checkpointCoord.y) / 2;
      pathD += ` C ${last.x} ${midY}, ${checkpointCoord.x} ${midY}, ${checkpointCoord.x} ${checkpointCoord.y}`;
    }

    return (
      <div style={{ position: 'relative', width: '100%', minHeight: `${totalHeight}px`, display: 'flex', justifyContent: 'center' }}>
        {/* SVG Road Track */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: `${totalHeight}px`,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {/* Base outer stone road */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner smooth path */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--bg-app)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dashed center path guide */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        </svg>

        {/* Interactive Skill Stepping-Stone Nodes */}
        <div style={{ position: 'relative', width: '320px', height: `${totalHeight}px`, zIndex: 10 }}>
          {skills.map((skill, index) => {
            const coord = coords[index];
            const isCompleted = userProgress.completedSkillIds.includes(skill.id);
            const isCurrent = skill.id === userProgress.currentSkillId;
            const isUnlocked = isCompleted || isCurrent || skill.status === 'unlocked';
            const isLocked = !isUnlocked;
            const mastery = userProgress.skillMastery[skill.id] || 0;

            let bgColor = 'var(--bg-surface)';
            let borderColor = 'var(--border-default)';
            let bevelColor = 'var(--tactile-card)';
            let iconColor = 'var(--text-secondary)';

            if (isCompleted) {
              bgColor = 'var(--secondary-solid)';
              borderColor = 'var(--secondary-hover)';
              bevelColor = 'var(--secondary-bevel)';
              iconColor = '#FFFFFF';
            } else if (isCurrent) {
              bgColor = 'var(--brand-primary)';
              borderColor = 'var(--brand-bevel)';
              bevelColor = 'var(--brand-active)';
              iconColor = '#FFFFFF';
            } else if (isLocked) {
              bgColor = 'var(--locked-bg)';
              borderColor = 'var(--locked-border)';
              bevelColor = 'var(--locked-bevel)';
              iconColor = 'var(--locked-text)';
            }

            return (
              <div
                key={skill.id}
                style={{
                  position: 'absolute',
                  left: `${coord.x}px`,
                  top: `${coord.y}px`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* 3D Physical Node Tile */}
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedSkillForModal(skill);
                    }
                  }}
                  disabled={isLocked}
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    backgroundColor: bgColor,
                    border: `3px solid ${borderColor}`,
                    boxShadow: `0 6px 0 ${bevelColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: iconColor,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                    position: 'relative',
                    userSelect: 'none'
                  }}
                  className={isCurrent ? 'current-node-pulse' : ''}
                  title={isLocked ? `Locked: Complete prior skills to unlock` : `${skill.title} (Click to inspect)`}
                >
                  {isCompleted ? (
                    <Icon name="check" size={32} stroke={3.5} />
                  ) : isLocked ? (
                    <Icon name="lock" size={24} />
                  ) : (
                    <Icon name={skill.iconName || 'code'} size={30} stroke={2.2} />
                  )}

                  {/* Top Badge for Current Node */}
                  {isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-18px',
                        backgroundColor: '#F59E0B',
                        color: '#FFFFFF',
                        fontSize: '0.625rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-display)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        letterSpacing: '0.06em',
                        border: '1.5px solid #B45309',
                        boxShadow: '0 2px 0 #B45309'
                      }}
                    >
                      START
                    </div>
                  )}
                </button>

                {/* Skill Title & Mastery Indicators */}
                <div
                  style={{
                    marginTop: '10px',
                    textAlign: 'center',
                    maxWidth: '130px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: isCurrent ? 800 : 700,
                      color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                      lineHeight: 1.2
                    }}
                  >
                    {skill.title}
                  </div>

                  {/* Mastery Pip Dots */}
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
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: level <= mastery ? '#10B981' : '#D5C9B7'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Unit Milestone Chest / Trophy Node */}
          <div
            style={{
              position: 'absolute',
              left: `${checkpointCoord.x}px`,
              top: `${checkpointCoord.y}px`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {(() => {
              const isUnitCompleted = unit.skills.every(s => userProgress.completedSkillIds.includes(s.id));
              return (
                <button
                  onClick={() => setActiveCapstoneUnit(unit)}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    backgroundColor: isUnitCompleted ? 'var(--state-success-subtle)' : '#FEF3C7',
                    border: `3px solid ${isUnitCompleted ? 'var(--state-success)' : '#FDE68A'}`,
                    boxShadow: `0 6px 0 ${isUnitCompleted ? 'var(--state-success)' : '#B45309'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isUnitCompleted ? 'var(--state-success)' : '#D97706',
                    cursor: 'pointer',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                  }}
                  className="hover-elevate"
                  title={`Unit ${unit.unitNumber} Capstone: ${unitCheckpoint.title}`}
                  aria-label={`Capstone Challenge: ${unitCheckpoint.title}`}
                >
                  <Icon name={isUnitCompleted ? 'trophy' : 'award'} size={32} stroke={2.5} />
                </button>
              );
            })()}
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
              {unitCheckpoint.title}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px 80px' }} className="animate-fade-in">
      
      {/* 1. HERO MODULE & CONTINUE LEARNING BAR */}
      <div
        className="card-plate animate-slide-up"
        style={{
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '6px solid var(--brand-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: 'var(--brand-light)',
              border: '1.5px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
              boxShadow: '0 3px 0 var(--brand-border)'
            }}
          >
            <Icon name={currentSkill.iconName || 'code'} size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)' }}>
                CURRENT MODULE • UNIT 1 FOUNDATIONS
              </span>
              <Badge variant="brand" size="sm">Mastery {userProgress.skillMastery[currentSkill.id] || 0}/5</Badge>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {currentSkill.title}: {nextLesson.title}
            </h2>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              ~{nextLesson.estimatedMinutes} min micro-session • 15 interactive coding challenges
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => startLesson(nextLesson.id)}
          icon={<Icon name="player-play" size={18} fill="#fff" />}
          iconPosition="left"
        >
          Continue Lesson (+{nextLesson.xpReward} XP)
        </Button>
      </div>

      {/* 2. MAIN WORKSPACE GRID: Serpentine Track (Left) + Companion Dock (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '32px',
          alignItems: 'start'
        }}
      >
        {/* LEFT COLUMN: THE SERPENTINE JOURNEY PATH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {course.units.slice(0, renderedUnitsCount).map((unit) => {
            const completedCount = unit.skills.filter(s => userProgress.completedSkillIds.includes(s.id)).length;
            const progressPct = Math.round((completedCount / unit.skills.length) * 100);

            return (
              <div key={unit.id} id={`unit-anchor-${unit.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Unit Header Card */}
                <div
                  className="card-plate"
                  style={{
                    padding: '20px 24px',
                    borderLeft: `6px solid ${unit.themeColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: unit.themeColor
                        }}
                      >
                        {unit.title}
                      </span>
                      <span style={{ color: 'var(--border-strong)' }}>•</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {unit.subtitle}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {unit.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {completedCount} / {unit.skills.length} Skills
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {progressPct === 100 ? 'Unit Mastered' : progressPct > 0 ? 'In Progress' : 'Not Started'}
                      </div>
                    </div>
                    <UnitProgressRing progress={progressPct} color={unit.themeColor} />
                  </div>
                </div>

                {/* Sinuous SVG Serpentine Track with 3D Stepping-Stone Nodes */}
                {renderSerpentineTrack(unit)}
              </div>
            );
          })}

          {renderedUnitsCount < course.units.length && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 32px' }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setRenderedUnitsCount(prev => Math.min(course.units.length, prev + 8))}
                icon={<Icon name="arrow-down" size={18} />}
                iconPosition="right"
              >
                Load Next Units ({renderedUnitsCount} of {course.units.length} Displayed)
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DEVELOPER COMPANION & PROGRESS DOCK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '88px' }} className="desktop-only">
          
          {/* 1. Skill Mastery & Mistake Retention Card */}
          <div
            className="card-plate"
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
              boxShadow: 'var(--tactile-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--brand-light)',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--brand-border)'
                  }}
                >
                  <Icon name="brain" size={20} stroke={2.2} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Skill Mastery
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Active Knowledge Retention
                  </div>
                </div>
              </div>
              {userProgress.mistakes.filter(m => !m.resolved).length > 0 ? (
                <Badge variant="error" size="sm">
                  {userProgress.mistakes.filter(m => !m.resolved).length} to review
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  All clear
                </Badge>
              )}
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
              {userProgress.mistakes.filter(m => !m.resolved).length > 0
                ? `You have ${userProgress.mistakes.filter(m => !m.resolved).length} unresolved concept misconception${userProgress.mistakes.filter(m => !m.resolved).length > 1 ? 's' : ''} in your Mistake Bank. Practice them to retain understanding.`
                : 'Zero recorded misconceptions! Strengthen syntax memory through targeted project drills.'}
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => navigateTo('/app/practice')}
                icon={<Icon name="barbell" size={14} />}
              >
                Practice Drills
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => navigateTo('/app/review')}
                icon={<Icon name="history" size={14} />}
              >
                Mistake Bank
              </Button>
            </div>
          </div>

          {/* 2. Daily Learning Goals Card */}
          <div className="card-plate" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                Daily Learning Goals
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                Active Session
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Goal 1: XP Target */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Daily XP Target</span>
                  <span style={{ color: 'var(--brand-primary)' }}>{userProgress.dailyGoalEarnedXp} / 50 XP</span>
                </div>
                <ProgressBar progress={Math.min(100, (userProgress.dailyGoalEarnedXp / 50) * 100)} height={8} />
              </div>

              {/* Goal 2: Lessons Completed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Active Streak</span>
                  <span style={{ color: '#E11D48' }}>{userProgress.streak} Days Active</span>
                </div>
                <ProgressBar progress={userProgress.streak > 0 ? 100 : 0} height={8} color="#E11D48" />
              </div>

              {/* Goal 3: Unit 1 Skills */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Unit 1 Foundations</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {userProgress.completedSkillIds.length} / 10 Skills
                  </span>
                </div>
                <ProgressBar progress={Math.round((userProgress.completedSkillIds.length / 10) * 100)} height={8} color="#10B981" />
              </div>
            </div>
          </div>

          {/* 3. Practice Spotlight Card */}
          <div
            className="card-plate card-plate-interactive"
            onClick={() => navigateTo('/app/practice')}
            style={{ padding: '18px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  boxShadow: '0 2px 0 #A7F3D0',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="code" size={20} stroke={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Python Projects
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  30 buildable projects from Beginner to Advanced
                </div>
              </div>
              <Icon name="arrow-right" size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

        </div>
      </div>

      {/* 3. SKILL INSPECTION POPUP DRAWER MODAL */}
      {selectedSkillForModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(30, 27, 23, 0.65)',
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
            className="card-plate animate-pop-in"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-light)',
                  border: '1.5px solid var(--brand-border)',
                  boxShadow: '0 3px 0 var(--brand-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)'
                }}
              >
                <Icon name={selectedSkillForModal.iconName || 'code'} size={28} />
              </div>
              <div>
                <Badge variant="brand" size="sm">
                  Mastery {userProgress.skillMastery[selectedSkillForModal.id] || 0} / 5
                </Badge>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {selectedSkillForModal.title}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
              {selectedSkillForModal.description}
            </p>

            {/* Micro-lessons List */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
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
                          padding: '12px 14px',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? '#10B981' : '#E5DDD0',
                              color: isDone ? '#FFFFFF' : '#57534E',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isDone ? <Icon name="check" size={12} stroke={2.5} /> : <span className="tabular-nums">{idx + 1}</span>}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {les.title}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          ~{les.estimatedMinutes} min • +{les.xpReward} XP
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
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
                icon={<Icon name="player-play" size={16} fill="#fff" />}
              >
                Start Lesson (+20 XP)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DYNAMIC UNIT CAPSTONE MODAL FOR ALL UNITS */}
      {activeCapstoneUnit && (
        <Modal
          isOpen={Boolean(activeCapstoneUnit)}
          onClose={() => setActiveCapstoneUnit(null)}
          title={`Unit ${activeCapstoneUnit.unitNumber} Capstone`}
        >
          <div style={{ padding: '4px 0 12px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-light)',
                  border: '2px solid var(--brand-border)',
                  boxShadow: '0 4px 0 var(--brand-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  flexShrink: 0
                }}
              >
                <Icon name="award" size={30} stroke={2.5} />
              </div>
              <div>
                <Badge variant="brand" size="sm">
                  UNIT {activeCapstoneUnit.unitNumber} CAPSTONE
                </Badge>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {activeCapstoneUnit.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeCapstoneUnit.subtitle}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
              {activeCapstoneUnit.checkpoint?.description || activeCapstoneUnit.description}
            </p>

            {/* Skills & Concepts in this unit */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Skills & Knowledge in Unit {activeCapstoneUnit.unitNumber}:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {activeCapstoneUnit.skills.map((skill) => {
                  const isDone = userProgress.completedSkillIds.includes(skill.id);
                  const mastery = userProgress.skillMastery[skill.id] || 0;

                  return (
                    <div
                      key={skill.id}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: isDone ? 'var(--state-success-subtle)' : 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isDone ? 'var(--state-success-border)' : 'var(--border-default)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Icon
                          name={isDone ? 'check' : 'code'}
                          size={16}
                          style={{ color: isDone ? 'var(--state-success)' : 'var(--text-secondary)' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {skill.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDone ? 'var(--state-success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span className="tabular-nums">{mastery}/5</span>
                        <Icon name="star" size={12} fill={isDone ? 'currentColor' : 'none'} stroke={1.5} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Capstone Challenge Details */}
            <div style={{
              backgroundColor: 'var(--brand-light)',
              border: '1.5px solid var(--brand-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              marginBottom: '24px',
              fontSize: '0.88rem',
              color: 'var(--brand-text)',
              lineHeight: 1.5
            }}>
              <strong>Capstone Milestone: {activeCapstoneUnit.checkpoint?.title || 'Synthesis Challenge'}</strong>
              <div style={{ marginTop: '4px', fontSize: '0.82rem', opacity: 0.9 }}>
                Synthesizes concepts from all {activeCapstoneUnit.skills.length} skills in this unit into multi-step problems with full test validation.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveCapstoneUnit(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const targetLesson = activeCapstoneUnit.unitNumber === 1 
                    ? 'unit_01_final'
                    : (activeCapstoneUnit.skills[activeCapstoneUnit.skills.length - 1]?.lessons[0]?.id || '1.1');
                  setActiveCapstoneUnit(null);
                  startLesson(targetLesson);
                }}
                icon={<Icon name="player-play" size={16} fill="#fff" />}
              >
                Start Capstone Challenge (+100 XP)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
