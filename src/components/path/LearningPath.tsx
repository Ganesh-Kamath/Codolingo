import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { SkillNode, Unit, Lesson } from '../../types';
import { Icon } from '../ui/Icon';
import { Button, Badge, ProgressBar, Modal } from '../common';
import { masteryService } from '../../services/masteryService';
import { progressionService } from '../../services/progressionService';
import { UNKNOWN_MASTERY_PIPS, UNKNOWN_MASTERY_LABEL } from '../../constants/mastery';
import curriculumStatus from '../../curriculum/python/curriculumStatus.json';

interface SkillPreviewState {
  skill: SkillNode;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  lockReason?: string;
  masteryPips: number;
  isComingSoon?: boolean;
  needsReview?: boolean;
  initialPips?: number;
  daysSincePractice?: number;
  decayExplanation?: string;
}

const UnitProgressRing: React.FC<{ progress: number; size?: number; color?: string }> = ({
  progress,
  size = 44,
  color = 'var(--brand-primary)'
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
        {progress}%
      </span>
    </div>
  );
};

// 5 Discrete Mastery Dots Indicator
const MasteryDots: React.FC<{ pips: number; maxPips?: number; onClick?: (e: React.MouseEvent) => void }> = ({
  pips,
  maxPips = 5,
  onClick
}) => {
  const effectivePips = Math.max(0, Math.min(maxPips, pips));
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: onClick ? 'pointer' : 'default',
        padding: '2px 0'
      }}
      title={`Mastery: ${effectivePips}/${maxPips}`}
    >
      {Array.from({ length: maxPips }).map((_, i) => {
        const isFilled = i < effectivePips;
        return (
          <span
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isFilled ? 'var(--brand-primary)' : 'var(--border-strong)',
              boxShadow: isFilled ? '0 0 5px rgba(0, 245, 212, 0.5)' : 'none',
              transition: 'background-color var(--transition-fast)'
            }}
          />
        );
      })}
    </div>
  );
};

export const LearningPath: React.FC = () => {
  const { 
    course, 
    userProgress, 
    startLesson, 
    navigateTo,
    refreshSkillMastery
  } = useApp();

  const [activeCapstoneUnit, setActiveCapstoneUnit] = useState<Unit | null>(null);
  const [renderedUnitsCount, setRenderedUnitsCount] = useState<number>(10);
  const [previewState, setPreviewState] = useState<SkillPreviewState | null>(null);
  const [pipDetailModal, setPipDetailModal] = useState<{ skillTitle: string; explanation: string } | null>(null);
  const currentNodeRef = useRef<HTMLButtonElement | null>(null);

  const [notifiedUnit7, setNotifiedUnit7] = useState<boolean>(() => {
    try {
      return localStorage.getItem('codolingo_notify_unit7') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleNotifyUnit7 = () => {
    const nextVal = !notifiedUnit7;
    setNotifiedUnit7(nextVal);
    try {
      localStorage.setItem('codolingo_notify_unit7', String(nextVal));
    } catch {}
  };

  useEffect(() => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Find the active unit (first unit with uncompleted skills)
  const activeUnitIndex = useMemo(() => {
    const idx = course.units.findIndex(unit => 
      unit.skills.some(skill => !userProgress.completedSkillIds.includes(skill.id))
    );
    return idx === -1 ? 0 : idx;
  }, [course.units, userProgress.completedSkillIds]);

  // Track manually expanded units
  const [expandedUnitIds, setExpandedUnitIds] = useState<Record<string, boolean>>({});

  const toggleUnitExpanded = (unitId: string) => {
    setExpandedUnitIds(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  // Find next lesson across all units
  const nextLessonId = progressionService.getNextLesson(userProgress, course) || '1.1';
  let currentSkill: SkillNode = course.units[0]?.skills[0];
  let nextLesson: Lesson = currentSkill?.lessons[0] || {
    id: '1.1',
    title: 'What Is Programming?',
    estimatedMinutes: 4,
    xpReward: 25,
    order: 1
  };
  let currentUnit = course.units[0];

  for (const unit of course.units) {
    for (const skill of unit.skills) {
      const l = skill.lessons.find(item => item.id === nextLessonId);
      if (l) {
        currentSkill = skill;
        nextLesson = l;
        currentUnit = unit;
        break;
      }
    }
  }

  // Active unit stats for compact header indicator
  const activeUnit = course.units[activeUnitIndex] || course.units[0];
  const activeUnitCompletedSkills = activeUnit ? activeUnit.skills.filter(s => userProgress.completedSkillIds.includes(s.id)).length : 0;
  const activeUnitTotalSkills = activeUnit?.skills.length || 1;
  const activeUnitProgressPct = Math.round((activeUnitCompletedSkills / activeUnitTotalSkills) * 100);

  // Overall curriculum stats for daily progress
  const totalCourseSkills = useMemo(() => {
    return course.units.reduce((acc, u) => acc + u.skills.length, 0);
  }, [course.units]);
  const totalCompletedSkills = userProgress.completedSkillIds.length;
  const overallProgressPct = Math.min(100, Math.round((totalCompletedSkills / Math.max(1, totalCourseSkills)) * 100));

  // Mistakes count
  const unresolvedMistakesCount = userProgress.mistakes.filter(m => !m.resolved).length;

  return (
    <div className="learning-path-container animate-fade-in">
      
      {/* ========================================================
          1. MAIN LEARNING AREA TWO-COLUMN LAYOUT
          ======================================================== */}
      <div className="learning-path-grid">
        
        {/* ========================================================
            LEFT COLUMN (68-72%): HERO, PROGRESS, & INTERACTIVE PATH
            ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0 }}>
          
          {/* A. PAGE HEADING & SUBTITLE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.875rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Your Learning Path
              </h1>
              <Badge variant="brand" size="sm">PYTHON MATRIX</Badge>
            </div>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '720px'
              }}
            >
              Master Python systems architecture, algorithmic problem solving, and interactive debugging through deliberate micro-challenges.
            </p>
          </div>

          {/* B. PROMINENT CURRENT-LESSON CARD (HERO) */}
          <div
            className="card-plate animate-slide-up"
            style={{
              padding: '24px 28px',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)',
              borderLeft: '5px solid var(--brand-primary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: '260px', flex: 1 }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--brand-light)',
                  border: '1.5px solid var(--brand-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  flexShrink: 0
                }}
              >
                <Icon name={currentSkill.iconName || 'code'} size={28} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--brand-primary)'
                    }}
                  >
                    CURRENT LESSON • UNIT {currentUnit.unitNumber} {currentUnit.title.replace(/^Unit \d+:\s*/i, '').toUpperCase()}
                  </span>
                  <Badge variant="brand" size="sm">Mastery {userProgress.skillMastery[currentSkill.id] || 0}/5</Badge>
                </div>

                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: '0 0 6px 0',
                    lineHeight: 1.3
                  }}
                >
                  {currentSkill.title}: {nextLesson.title}
                </h2>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="clock" size={14} />
                    ~{nextLesson.estimatedMinutes} min micro-session
                  </span>
                  <span>•</span>
                  <span>15 interactive challenges</span>
                  <span>•</span>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>+{nextLesson.xpReward} XP</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => startLesson(nextLesson.id)}
              icon={<Icon name="player-play" size={18} fill="#0A0D14" />}
              iconPosition="left"
              style={{ fontWeight: 700, padding: '12px 24px', flexShrink: 0 }}
            >
              Continue Learning
            </Button>
          </div>

          {/* C. COMPACT CURRENT-UNIT PROGRESS SECTION */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Current Unit Focus:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Unit {activeUnit.unitNumber}: {activeUnit.title.replace(/^Unit \d+:\s*/i, '')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '340px', minWidth: '180px' }}>
              <div style={{ flex: 1 }}>
                <ProgressBar progress={activeUnitProgressPct} height={6} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {activeUnitCompletedSkills}/{activeUnitTotalSkills} Skills ({activeUnitProgressPct}%)
              </span>
            </div>
          </div>

          {/* D. INTERACTIVE LEARNING PATH VISUALIZATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {course.units.slice(0, renderedUnitsCount).map((unit) => {
              const completedCount = unit.skills.filter(s => userProgress.completedSkillIds.includes(s.id)).length;
              const progressPct = Math.round((completedCount / unit.skills.length) * 100);
              const isUnitCompleted = completedCount === unit.skills.length;
              const isCurrentUnit = unit.id === course.units[activeUnitIndex]?.id;
              const isLockedUnit = !isUnitCompleted && !isCurrentUnit && (unit.unitNumber > (course.units[activeUnitIndex]?.unitNumber || 1));
              const isExpanded = expandedUnitIds[unit.id] ?? (isCurrentUnit || !isUnitCompleted);

              const unitCheckpoint = unit.checkpoint || {
                id: `chk_${unit.id}`,
                unitId: unit.id,
                title: `Unit ${unit.unitNumber} Capstone`,
                description: unit.description,
                status: 'unlocked' as const,
                xpReward: 100
              };

              return (
                <section
                  key={unit.id}
                  id={`unit-anchor-${unit.id}`}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color var(--transition-base)'
                  }}
                  aria-label={`Unit ${unit.unitNumber}: ${unit.title}`}
                >
                  {/* Unit Header Bar */}
                  <div
                    style={{
                      padding: '18px 24px',
                      backgroundColor: isCurrentUnit ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)',
                      borderBottom: isExpanded ? '1px solid var(--border-default)' : 'none',
                      borderLeft: isCurrentUnit ? '5px solid var(--brand-primary)' : (isUnitCompleted ? '5px solid var(--state-success)' : '5px solid var(--border-strong)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: isCurrentUnit ? 'var(--brand-primary)' : (isUnitCompleted ? 'var(--state-success)' : 'var(--text-muted)')
                          }}
                        >
                          {isCurrentUnit ? `CURRENT UNIT • UNIT ${unit.unitNumber}` : `UNIT ${unit.unitNumber}`}
                        </span>
                        {(curriculumStatus.comingSoonUnits as string[]).includes(unit.id) && (
                          <Badge variant="neutral" size="sm">Coming Soon</Badge>
                        )}
                        {isUnitCompleted && (
                          <Badge variant="success" size="sm">
                            <Icon name="check" size={11} style={{ marginRight: 3 }} />
                            Mastered
                          </Badge>
                        )}
                      </div>

                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          margin: 0
                        }}
                      >
                        {unit.title.replace(/^Unit \d+:\s*/i, '')}
                      </h3>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.4 }}>
                        {unit.subtitle}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {completedCount} / {unit.skills.length} Skills
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {isUnitCompleted ? 'Unit Mastered' : progressPct > 0 ? 'In Progress' : 'Not Started'}
                        </div>
                      </div>

                      <UnitProgressRing progress={progressPct} color={isCurrentUnit ? 'var(--brand-primary)' : (isUnitCompleted ? 'var(--state-success)' : 'var(--border-strong)')} />

                      {/* Expand / Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUnitExpanded(unit.id)}
                        icon={<Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={15} />}
                        title={isExpanded ? 'Collapse unit roadmap' : 'Expand unit roadmap'}
                        aria-label={isExpanded ? `Collapse Unit ${unit.unitNumber}` : `Expand Unit ${unit.unitNumber}`}
                      />
                    </div>
                  </div>

                  {/* Expanded Unit Progression Path */}
                  {isExpanded && (
                    <div className="path-progression-wrap">
                      {/* Vertical Continuous Spine */}
                      <div className="path-vertical-spine" />

                      {/* Skill Step Rows */}
                      {unit.skills.map((skill, index) => {
                        const isUnitComingSoon = (curriculumStatus.comingSoonUnits as string[]).includes(unit.id);
                        const isCompleted = !isUnitComingSoon && userProgress.completedSkillIds.includes(skill.id);
                        const isCurrent = !isUnitComingSoon && (skill.id === userProgress.currentSkillId || skill.lessons.some(l => l.id === nextLessonId));
                        const isPrereqCompleted = !skill.requiresSkillId || userProgress.completedSkillIds.includes(skill.requiresSkillId);
                        const isUnlocked = !isUnitComingSoon && (isCompleted || isCurrent || skill.status === 'unlocked' || isPrereqCompleted);
                        const isLocked = isUnitComingSoon || !isUnlocked;

                        const rawMastery = userProgress.skillMastery[skill.id] || 0;
                        const masteryRecord = userProgress.skillMasteryRecords?.[skill.id] || (isCompleted && rawMastery > 0 ? {
                          pips: rawMastery,
                          lastPracticedAt: new Date().toISOString(),
                          halfLifeDays: masteryService.getEffectivePips({ pips: rawMastery, lastPracticedAt: '', halfLifeDays: 14 }).halfLifeDays
                        } : null);

                        const decayResult = masteryRecord ? masteryService.getEffectivePips(masteryRecord) : null;
                        const effectivePips = decayResult ? decayResult.effectivePips : rawMastery;
                        const needsReview = isCompleted && Boolean(decayResult?.needsReview);

                        // Prerequisite title
                        const prevSkill = index > 0 ? unit.skills[index - 1] : null;
                        let prereqTitle = prevSkill ? prevSkill.title : null;
                        if (!prereqTitle && skill.requiresSkillId) {
                          for (const u of course.units) {
                            const s = u.skills.find(item => item.id === skill.requiresSkillId);
                            if (s) {
                              prereqTitle = `${s.title} (Unit ${u.unitNumber})`;
                              break;
                            }
                          }
                        }
                        const lockReason = isUnitComingSoon
                          ? 'Under curriculum review'
                          : (isLocked ? (prereqTitle ? `Requires: ${prereqTitle}` : 'Requires preceding skill') : undefined);

                        // Alternating left/right step layout
                        const isEven = index % 2 === 0;

                        // Node colors and styling
                        let nodeBg = 'var(--bg-surface-elevated)';
                        let nodeBorder = 'var(--border-strong)';
                        let nodeIconColor = 'var(--text-secondary)';
                        let nodeShadow = 'var(--shadow-xs)';

                        if (isCompleted) {
                          nodeBg = 'rgba(0, 245, 212, 0.08)';
                          nodeBorder = 'var(--brand-primary)';
                          nodeIconColor = 'var(--brand-primary)';
                          nodeShadow = '0 0 12px rgba(0, 245, 212, 0.25)';
                        } else if (isCurrent) {
                          nodeBg = 'var(--brand-primary)';
                          nodeBorder = 'var(--brand-hover)';
                          nodeIconColor = '#0A0D14';
                          nodeShadow = '0 0 18px rgba(0, 245, 212, 0.45), 0 0 0 3px rgba(0, 245, 212, 0.2)';
                        } else if (isLocked) {
                          nodeBg = 'var(--locked-bg, #0B0E15)';
                          nodeBorder = 'var(--locked-border, #161C2C)';
                          nodeIconColor = 'var(--locked-text, #475569)';
                          nodeShadow = 'none';
                        }

                        if (needsReview) {
                          nodeBorder = '#F59E0B';
                          nodeShadow = '0 0 14px rgba(245, 158, 11, 0.4)';
                        }

                        const handleNodeOrCardClick = () => {
                          setPreviewState({
                            skill,
                            isLocked,
                            isCompleted,
                            isCurrent,
                            lockReason,
                            masteryPips: effectivePips,
                            isComingSoon: isUnitComingSoon,
                            needsReview,
                            initialPips: decayResult?.initialPips || rawMastery,
                            daysSincePractice: decayResult?.daysSincePractice || 0,
                            decayExplanation: decayResult ? masteryService.formatDecayExplanation(effectivePips, decayResult.initialPips, decayResult.daysSincePractice) : undefined
                          });
                        };

                        const estMinutes = skill.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 4), 0);

                        // Card Element
                        const CardElement = (
                          <div
                            className={`path-lesson-card ${isCurrent ? 'is-current' : ''} ${isCompleted ? 'is-completed' : ''} ${isLocked ? 'is-locked' : ''}`}
                            onClick={handleNodeOrCardClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleNodeOrCardClick();
                              }
                            }}
                            aria-label={`Skill: ${skill.title}${isLocked ? ` (Locked: ${lockReason})` : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  color: isCurrent ? 'var(--brand-primary)' : 'var(--text-muted)',
                                  letterSpacing: '0.04em'
                                }}
                              >
                                Skill {unit.unitNumber}.{index + 1}
                              </span>

                              <div>
                                {isUnitComingSoon ? (
                                  <Badge variant="neutral" size="sm">Coming Soon</Badge>
                                ) : isCompleted ? (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <Icon name="check" size={12} stroke={2.5} />
                                    Completed
                                  </span>
                                ) : isCurrent ? (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--brand-primary)', boxShadow: '0 0 6px var(--brand-primary)' }} />
                                    Current
                                  </span>
                                ) : needsReview ? (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <Icon name="refresh-cw" size={11} />
                                    Review
                                  </span>
                                ) : isLocked ? (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <Icon name="lock" size={11} />
                                    Locked
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    Available
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.9375rem',
                                fontWeight: 700,
                                color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)',
                                lineHeight: 1.35
                              }}
                            >
                              {skill.title}
                            </div>

                            {isLocked && lockReason ? (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                {lockReason}
                              </div>
                            ) : null}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {skill.lessons.length} micro-lessons • ~{estMinutes}m
                              </span>

                              {isUnlocked && (
                                <MasteryDots
                                  pips={effectivePips}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const expl = masteryService.formatPipsExplanation(
                                      effectivePips,
                                      effectivePips === 5 ? 10 : (effectivePips >= 3 ? 7 : 4),
                                      10,
                                      effectivePips >= 4 ? 0 : 2,
                                      effectivePips >= 4 ? 0 : 1
                                    );
                                    setPipDetailModal({ skillTitle: skill.title, explanation: expl });
                                  }}
                                />
                              )}
                            </div>

                            {isCurrent && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  Continue Lesson <Icon name="arrow-right" size={13} />
                                </span>
                              </div>
                            )}
                          </div>
                        );

                        return (
                          <div key={skill.id} className="path-step-row">
                            {/* Left Slot: Card if Even, Spacer if Odd */}
                            {isEven ? (
                              <div className="path-card-left">
                                {CardElement}
                              </div>
                            ) : (
                              <div className="path-spacer" />
                            )}

                            {/* Center Slot: 62px Interactive Stepping Node */}
                            <div className="path-node-center">
                              <button
                                ref={isCurrent ? currentNodeRef : undefined}
                                className="path-node-btn"
                                onClick={handleNodeOrCardClick}
                                style={{
                                  backgroundColor: nodeBg,
                                  borderColor: nodeBorder,
                                  color: nodeIconColor,
                                  boxShadow: nodeShadow
                                }}
                                aria-label={`${skill.title}${isLocked ? ` (Locked: ${lockReason})` : ''}`}
                                title={isLocked ? `Locked: ${lockReason}` : `${skill.title} (Click to inspect)`}
                              >
                                {isCompleted ? (
                                  <Icon name="check" size={26} stroke={2.8} />
                                ) : isLocked ? (
                                  <Icon name="lock" size={20} />
                                ) : (
                                  <Icon name={skill.iconName || 'code'} size={24} stroke={2.2} />
                                )}

                                {/* Floating CURRENT badge */}
                                {isCurrent && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: '-20px',
                                      backgroundColor: 'var(--brand-primary)',
                                      color: '#0A0D14',
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.625rem',
                                      fontWeight: 800,
                                      padding: '2px 8px',
                                      borderRadius: 'var(--radius-full)',
                                      letterSpacing: '0.06em',
                                      whiteSpace: 'nowrap',
                                      boxShadow: '0 2px 8px rgba(0, 245, 212, 0.4)'
                                    }}
                                  >
                                    CURRENT
                                  </div>
                                )}
                              </button>
                            </div>

                            {/* Right Slot: Spacer if Even, Card if Odd */}
                            {isEven ? (
                              <div className="path-spacer" />
                            ) : (
                              <div className="path-card-right">
                                {CardElement}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Unit Capstone Milestone Node at End of Unit */}
                      <div className="path-step-row" style={{ marginTop: '16px', marginBottom: 0 }}>
                        <div className="path-spacer" />

                        <div className="path-node-center">
                          <button
                            onClick={() => setActiveCapstoneUnit(unit)}
                            className="path-node-btn"
                            style={{
                              width: '64px',
                              height: '64px',
                              backgroundColor: isUnitCompleted ? 'rgba(0, 245, 212, 0.12)' : 'var(--bg-surface-elevated)',
                              borderColor: isUnitCompleted ? 'var(--brand-primary)' : 'var(--border-strong)',
                              color: isUnitCompleted ? 'var(--brand-primary)' : 'var(--text-secondary)',
                              boxShadow: isUnitCompleted ? '0 0 16px rgba(0, 245, 212, 0.3)' : 'var(--shadow-sm)'
                            }}
                            title={`Unit ${unit.unitNumber} Capstone: ${unitCheckpoint.title}`}
                            aria-label={`Capstone Milestone: ${unitCheckpoint.title}`}
                          >
                            <Icon name={isUnitCompleted ? 'trophy' : 'award'} size={28} stroke={2.4} />
                          </button>
                        </div>

                        <div className="path-card-right">
                          <div
                            className="path-lesson-card"
                            onClick={() => setActiveCapstoneUnit(unit)}
                            role="button"
                            tabIndex={0}
                            style={{
                              borderColor: isUnitCompleted ? 'rgba(0, 245, 212, 0.3)' : 'var(--border-default)',
                              backgroundColor: 'var(--bg-surface)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Badge variant={isUnitCompleted ? 'brand' : 'neutral'} size="sm">
                                CAPSTONE MILESTONE
                              </Badge>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                +{unitCheckpoint.xpReward} XP
                              </span>
                            </div>

                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {unitCheckpoint.title}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                              Synthesizes all {unit.skills.length} concepts into verified multi-step challenges.
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Unit 7 Coming Soon notification notice */}
                  {unit.unitNumber === 6 && (
                    <div
                      style={{
                        padding: '24px 20px',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderTop: '1px dashed var(--border-default)',
                        textAlign: 'center',
                        margin: '0 auto'
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 10px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <Icon name="lock" size={20} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Badge variant="neutral" size="sm">Coming Soon</Badge>
                        <Badge variant="brand" size="sm">Unit 7</Badge>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        Unit 7: Strings & Text Manipulation
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 14px', lineHeight: 1.45 }}>
                        Slicing, string formatting, string methods, encoding, and regex fundamentals in Python.
                      </p>
                      <Button
                        variant={notifiedUnit7 ? "secondary" : "primary"}
                        size="sm"
                        onClick={handleToggleNotifyUnit7}
                        icon={<Icon name={notifiedUnit7 ? "check" : "bell"} size={14} />}
                      >
                        {notifiedUnit7 ? "Notification Saved" : "Notify Me When Available"}
                      </Button>
                    </div>
                  )}
                </section>
              );
            })}

            {renderedUnitsCount < course.units.length && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 24px' }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setRenderedUnitsCount(prev => Math.min(course.units.length, prev + 8))}
                  icon={<Icon name="arrow-down" size={16} />}
                  iconPosition="right"
                >
                  Load Next Units ({renderedUnitsCount} of {course.units.length} Displayed)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (28-32%): SECONDARY COMPANION DOCK
            ======================================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: 'calc(var(--topbar-height) + 24px)'
          }}
          className="desktop-only"
        >
          {/* 1. SKILL MASTERY & CONCEPT REVIEW */}
          <div
            className="card-plate"
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
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
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    Skill Mastery
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Active Knowledge Retention
                  </div>
                </div>
              </div>

              {unresolvedMistakesCount > 0 ? (
                <Badge variant="error" size="sm">
                  {unresolvedMistakesCount} to review
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  All clear
                </Badge>
              )}
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              {unresolvedMistakesCount > 0
                ? `You have ${unresolvedMistakesCount} unresolved misconception${unresolvedMistakesCount > 1 ? 's' : ''} in your Mistake Bank. Practice them to retain understanding.`
                : 'Zero recorded misconceptions! Strengthen syntax memory through targeted project drills.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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

          {/* 2. DAILY LEARNING GOALS */}
          <div
            className="card-plate"
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="target" size={18} style={{ color: 'var(--brand-primary)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  Daily Learning Goals
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  textTransform: 'uppercase'
                }}
              >
                Active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Daily XP Target */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Daily XP Target</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {userProgress.dailyGoalEarnedXp} / {userProgress.dailyGoalXp || 50} XP
                  </span>
                </div>
                <ProgressBar progress={Math.min(100, (userProgress.dailyGoalEarnedXp / (userProgress.dailyGoalXp || 50)) * 100)} height={6} />
              </div>

              {/* Active Streak */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Streak</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--streak-color)' }}>
                    {userProgress.streak} Days Active
                  </span>
                </div>
                <ProgressBar progress={userProgress.streak > 0 ? 100 : 0} height={6} color="var(--brand-primary)" />
              </div>

              {/* Overall Curriculum Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Curriculum Progress</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--state-success)' }}>
                    {totalCompletedSkills} / {totalCourseSkills} Skills
                  </span>
                </div>
                <ProgressBar progress={overallProgressPct} height={6} color="var(--state-success)" />
              </div>
            </div>
          </div>

          {/* 3. PYTHON PROJECTS (PROJECT RECOMMENDATIONS) */}
          <div
            className="card-plate card-plate-interactive"
            onClick={() => navigateTo('/app/practice')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('/app/practice');
              }
            }}
            style={{
              padding: '18px 20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon name="code" size={20} stroke={2.4} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Portfolio Projects
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                  30 buildable projects from CLI tools to full-stack services.
                </div>
              </div>
              <Icon name="arrow-right" size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          2. SKILL PREVIEW MODAL (PORTAL TO BODY)
          ======================================================== */}
      {previewState && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-overlay, rgba(10, 13, 20, 0.85))',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setPreviewState(null)}
          className="animate-fade-in"
        >
          <div
            className="card-plate animate-pop-in"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid var(--border-default)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: previewState.isCompleted ? 'rgba(0, 245, 212, 0.1)' : (previewState.isLocked ? 'var(--locked-bg, #0B0E15)' : 'var(--brand-light)'),
                  border: `1.5px solid ${previewState.isCompleted ? 'var(--brand-border)' : (previewState.isLocked ? 'var(--locked-border, #161C2C)' : 'var(--brand-border)')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: previewState.isCompleted ? 'var(--brand-primary)' : (previewState.isLocked ? 'var(--locked-text, #475569)' : 'var(--brand-primary)'),
                  flexShrink: 0
                }}
              >
                <Icon name={previewState.skill.iconName || 'code'} size={28} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {previewState.isComingSoon ? (
                    <Badge variant="neutral" size="sm">
                      <Icon name="clock" size={12} style={{ marginRight: 4 }} />
                      Coming Soon
                    </Badge>
                  ) : previewState.isLocked ? (
                    <Badge variant="neutral" size="sm">
                      <Icon name="lock" size={12} style={{ marginRight: 4 }} />
                      Locked
                    </Badge>
                  ) : previewState.needsReview ? (
                    <Badge variant="warning" size="sm">
                      <Icon name="refresh-cw" size={12} style={{ marginRight: 4 }} />
                      Needs Review
                    </Badge>
                  ) : previewState.isCompleted ? (
                    <Badge variant="success" size="sm">
                      <Icon name="check" size={12} style={{ marginRight: 4 }} />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="brand" size="sm">In Progress</Badge>
                  )}

                  {!previewState.isLocked && (
                    <button
                      onClick={() => {
                        const expl = masteryService.formatPipsExplanation(
                          previewState.masteryPips,
                          previewState.masteryPips === 5 ? 10 : (previewState.masteryPips >= 3 ? 7 : 4),
                          10,
                          previewState.masteryPips >= 4 ? 0 : 2,
                          previewState.masteryPips >= 4 ? 0 : 1
                        );
                        setPipDetailModal({ skillTitle: previewState.skill.title, explanation: expl });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Tap to view score explanation"
                    >
                      {previewState.masteryPips === UNKNOWN_MASTERY_PIPS
                        ? UNKNOWN_MASTERY_LABEL
                        : `Mastery ${previewState.masteryPips}/5`}
                      <Icon name="help-circle" size={13} />
                    </button>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: '4px 0 0'
                  }}
                >
                  {previewState.skill.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              {previewState.skill.description || 'Master fundamental concepts through real interactive Python challenges.'}
            </p>

            {/* Needs Review Alert Banner */}
            {previewState.needsReview && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1.5px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Icon name="refresh-cw" size={20} style={{ color: '#F59E0B', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#F59E0B' }}>
                    Needs Review ({previewState.masteryPips}/{previewState.initialPips || 5} pips)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {previewState.decayExplanation || 'Skill memory has decayed over time. Quick refresh restores full mastery!'}
                  </div>
                </div>
              </div>
            )}

            {/* Meta Stats: Question Count & Est. Time */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '120px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Exercises</div>
                <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {previewState.skill.lessons.length > 0 ? `${previewState.skill.lessons.length * 5} questions` : '5 questions'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '120px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Est. Time</div>
                <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  ~{previewState.skill.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 4), 0)} min
                </div>
              </div>
            </div>

            {/* Locked Notice OR Lessons List */}
            {previewState.isLocked ? (
              <div
                style={{
                  padding: '16px 18px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1.5px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ color: 'var(--text-muted)' }}>
                  <Icon name="lock" size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {previewState.isComingSoon ? 'Unit Coming Soon' : 'Skill Currently Locked'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {previewState.lockReason || 'Complete previous lessons on the path to unlock this node.'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Included Micro-Lessons
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {previewState.skill.lessons.map((les, idx) => {
                    const isDone = userProgress.completedLessonIds.includes(les.id);
                    return (
                      <button
                        key={les.id}
                        type="button"
                        onClick={() => {
                          if (!previewState.isLocked && !previewState.isComingSoon) {
                            setPreviewState(null);
                            startLesson(les.id);
                          }
                        }}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        className="hover-elevate"
                        title={`Start ${les.title}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? 'rgba(0, 245, 212, 0.15)' : 'var(--bg-surface-elevated)',
                              color: isDone ? 'var(--brand-primary)' : 'var(--text-secondary)',
                              fontSize: '0.6875rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isDone ? <Icon name="check" size={12} stroke={2.5} /> : <span className="tabular-nums">{idx + 1}</span>}
                          </span>
                          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {les.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                          +{les.xpReward} XP →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setPreviewState(null)}
              >
                Close
              </Button>

              {previewState.needsReview && !previewState.isLocked && !previewState.isComingSoon && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    refreshSkillMastery(previewState.skill.id);
                    setPreviewState(null);
                  }}
                  icon={<Icon name="sparkles" size={16} />}
                >
                  Quick Refresh (+15 XP)
                </Button>
              )}

              {!previewState.isLocked && !previewState.isComingSoon && (
                <Button
                  variant={previewState.isCompleted && !previewState.needsReview ? "secondary" : "primary"}
                  size="md"
                  onClick={() => {
                    const lessonToRun = previewState.skill.lessons[0] || nextLesson;
                    setPreviewState(null);
                    startLesson(lessonToRun.id);
                  }}
                  icon={<Icon name={previewState.isCompleted ? "refresh-cw" : "player-play"} size={16} />}
                >
                  {previewState.isCompleted ? 'Replay Lesson' : (previewState.isCurrent ? 'Continue' : 'Start Lesson')}
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================
          3. PIP EXPLANATION MODAL
          ======================================================== */}
      {pipDetailModal && (
        <Modal
          isOpen={Boolean(pipDetailModal)}
          onClose={() => setPipDetailModal(null)}
          title={`Mastery Breakdown: ${pipDetailModal.skillTitle}`}
        >
          <div style={{ padding: '8px 0 16px' }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              {pipDetailModal.explanation}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" size="md" onClick={() => setPipDetailModal(null)}>
                Got it
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          4. DYNAMIC UNIT CAPSTONE MODAL
          ======================================================== */}
      {activeCapstoneUnit && (
        <Modal
          isOpen={Boolean(activeCapstoneUnit)}
          onClose={() => setActiveCapstoneUnit(null)}
          title={`Unit ${activeCapstoneUnit.unitNumber} Capstone Milestone`}
        >
          <div style={{ padding: '4px 0 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--brand-light)',
                  border: '1.5px solid var(--brand-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  flexShrink: 0
                }}
              >
                <Icon name="award" size={28} stroke={2.5} />
              </div>
              <div>
                <Badge variant="brand" size="sm">
                  UNIT {activeCapstoneUnit.unitNumber} CAPSTONE
                </Badge>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {activeCapstoneUnit.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeCapstoneUnit.subtitle}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
              {activeCapstoneUnit.checkpoint?.description || activeCapstoneUnit.description}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px', padding: '10px 14px', backgroundColor: 'rgba(0, 245, 212, 0.08)', border: '1px solid rgba(0, 245, 212, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Mastered Concepts</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {activeCapstoneUnit.skills.filter(s => (userProgress.skillMastery[s.id] || 0) >= 4).length} / {activeCapstoneUnit.skills.length}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '140px', padding: '10px 14px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Needs Practice</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {activeCapstoneUnit.skills.filter(s => (userProgress.skillMastery[s.id] || 0) < 4).length} skills
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Skills Synthesized in Unit {activeCapstoneUnit.unitNumber}:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {activeCapstoneUnit.skills.map((skill) => {
                  const isDone = userProgress.completedSkillIds.includes(skill.id);
                  const mastery = userProgress.skillMastery[skill.id] || 0;

                  return (
                    <div
                      key={skill.id}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: isDone ? 'rgba(0, 245, 212, 0.06)' : 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isDone ? 'rgba(0, 245, 212, 0.2)' : 'var(--border-default)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Icon
                          name={isDone ? 'check' : 'code'}
                          size={15}
                          style={{ color: isDone ? 'var(--brand-primary)' : 'var(--text-secondary)' }}
                        />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {skill.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDone ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                        {mastery}/5
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

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
                  const lastSkill = activeCapstoneUnit.skills[activeCapstoneUnit.skills.length - 1];
                  const capstoneLessonId = lastSkill?.lessons[lastSkill.lessons.length - 1]?.id || `${activeCapstoneUnit.unitNumber}.1`;
                  setActiveCapstoneUnit(null);
                  startLesson(capstoneLessonId);
                }}
                icon={<Icon name="player-play" size={16} fill="#0A0D14" />}
              >
                Start Capstone Challenge (+{activeCapstoneUnit.checkpoint?.xpReward || 100} XP)
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
