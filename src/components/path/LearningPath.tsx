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
  const renderSerpentineTrack = (skills: SkillNode[], unitCheckpoint: { title: string; description: string }) => {
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
            stroke="#E5DDD0"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner smooth path */}
          <path
            d={pathD}
            fill="none"
            stroke="#FDFBF7"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dashed center path guide */}
          <path
            d={pathD}
            fill="none"
            stroke="#D5C9B7"
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

            let bgColor = '#FFFFFF';
            let borderColor = 'var(--border-default)';
            let bevelColor = '#E2D9CC';
            let iconColor = 'var(--text-secondary)';

            if (isCompleted) {
              bgColor = '#10B981';
              borderColor = '#059669';
              bevelColor = '#047857';
              iconColor = '#FFFFFF';
            } else if (isCurrent) {
              bgColor = '#4338CA';
              borderColor = '#312E81';
              bevelColor = '#1E1B4B';
              iconColor = '#FFFFFF';
            } else if (isLocked) {
              bgColor = '#F5EFEB';
              borderColor = '#E5DDD0';
              bevelColor = '#D5C9B7';
              iconColor = '#9E978E';
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
                    backgroundColor: 'rgba(253, 251, 247, 0.95)',
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
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '20px',
                backgroundColor: '#FEF3C7',
                border: '3px solid #FDE68A',
                boxShadow: '0 6px 0 #B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                cursor: 'pointer'
              }}
              title={`${unitCheckpoint.title}: ${unitCheckpoint.description}`}
            >
              <Icon name="award" size={32} stroke={2.5} />
            </div>
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
      
      {/* 1. HERO QUEST SUMMARY BAR */}
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
              width: '54px',
              height: '54px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)' }}>
                Active Quest • Unit 1 Foundations
              </span>
              <Badge variant="brand" size="sm">Mastery {userProgress.skillMastery[currentSkill.id] || 0}/5</Badge>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {currentSkill.title}: {nextLesson.title}
            </h2>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
          Resume Quest (+{nextLesson.xpReward} XP)
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
          {course.units.map((unit) => {
            const completedCount = unit.skills.filter(s => userProgress.completedSkillIds.includes(s.id)).length;
            const progressPct = Math.round((completedCount / unit.skills.length) * 100);

            return (
              <div key={unit.id} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  <div>
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

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {completedCount} / {unit.skills.length} Skills ({progressPct}%)
                    </span>
                    <div style={{ width: '100px' }}>
                      <ProgressBar progress={progressPct} height={6} />
                    </div>
                  </div>
                </div>

                {/* Sinuous SVG Serpentine Track with 3D Stepping-Stone Nodes */}
                {renderSerpentineTrack(unit.skills, unit.checkpoint)}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: STITCH DEVREALM COMPANION DOCK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '88px' }} className="desktop-only">
          
          {/* 1. Merlyn the Arch-Mage (AI Familiar Advisor) */}
          <div
            className="card-plate"
            style={{
              padding: '20px',
              backgroundColor: '#FAF5FF',
              borderColor: '#DDD6FE',
              boxShadow: '0 4px 0 #C4B5FD'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 0 #6D28D9'
                }}
              >
                <Icon name="sparkles" size={22} fill="#EDE9FE" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#5B21B6' }}>
                  Merlyn the Arch-Mage
                </div>
                <div style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 600 }}>
                  AI Coding Companion
                </div>
              </div>
            </div>

            {/* Speech Bubble */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                border: '1.5px solid #DDD6FE',
                fontSize: '0.84rem',
                color: '#374151',
                lineHeight: 1.5,
                marginBottom: '14px',
                position: 'relative'
              }}
            >
              "Greetings, scholar! When defining loops in Python, remember that <code>range(1, 5)</code> generates 1 through 4. Keep your momentum going!"
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => navigateTo('/app/practice')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DDD6FE',
                  color: '#5B21B6',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  boxShadow: '0 2px 0 #DDD6FE',
                  cursor: 'pointer'
                }}
              >
                Build in Practice 🛠️
              </button>
              <button
                onClick={() => navigateTo('/app/review')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DDD6FE',
                  color: '#5B21B6',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  boxShadow: '0 2px 0 #DDD6FE',
                  cursor: 'pointer'
                }}
              >
                Review Mistakes 🛡️
              </button>
            </div>
          </div>

          {/* 2. Daily Quests / Missions Card */}
          <div className="card-plate" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Daily Quests
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                Resets in 6h
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Mission 1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Earn 50 XP</span>
                  <span style={{ color: 'var(--brand-primary)' }}>{userProgress.dailyGoalEarnedXp}/50 XP</span>
                </div>
                <ProgressBar progress={Math.min(100, (userProgress.dailyGoalEarnedXp / 50) * 100)} height={8} />
              </div>

              {/* Mission 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Complete 1 Lesson</span>
                  <span style={{ color: '#10B981' }}>1 / 1 ✓</span>
                </div>
                <ProgressBar progress={100} height={8} />
              </div>

              {/* Mission 3 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Build 1 Practice Project</span>
                  <span style={{ color: 'var(--text-muted)' }}>0 / 1</span>
                </div>
                <ProgressBar progress={0} height={8} />
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
                            {isDone ? '✓' : idx + 1}
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
    </div>
  );
};
