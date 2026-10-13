import React from 'react';
import { useApp } from '../context/AppContext';
import { COURSES } from '../data/courses';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { progressionService } from '../services/progressionService';

interface CourseDetailViewProps {
  courseId?: string;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({ courseId = 'python' }) => {
  const { userProfile, userProgress, course: learningCourse, navigateTo, startLesson } = useApp();
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const isPython = course.id === 'python';

  const effectiveModules = isPython
    ? learningCourse.units.slice(0, 6).map((u, idx) => ({
        id: u.id,
        title: u.title,
        description: u.description,
        order: idx + 1,
        lessons: u.skills.flatMap(s => s.lessons)
      }))
    : course.modules;

  const totalLessonsCount = isPython
    ? effectiveModules.reduce((acc, m) => acc + m.lessons.length, 0)
    : course.totalLessons;

  const completedCount = isPython
    ? effectiveModules.flatMap(m => m.lessons).filter(l => userProfile.completedLessonIds.includes(l.id)).length
    : userProfile.completedLessonIds.length;

  const progressPct = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
  const currentNextLessonId = progressionService.getNextLesson(userProgress || userProfile, learningCourse) || '1.1';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigateTo('/app/learn')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.9rem',
          fontWeight: 800,
          color: 'var(--text-secondary)',
          marginBottom: '20px',
          padding: '6px 12px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-app)',
          transition: 'transform 0.2s ease',
        }}
        className="hover-elevate"
      >
        <Icon name="arrow-left" size={16} stroke={3} />
        <span>Course Catalog</span>
      </button>

      {/* Course Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Badge variant="python" size="md"><Icon name="brand-python" size={14} style={{ marginRight: 4 }} /> Python Track</Badge>
              <Badge variant="brand" size="md"><Icon name="shield-check" size={14} style={{ marginRight: 4 }} /> Adaptive Mastery</Badge>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{course.difficulty}</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {course.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.6 }}>
              {course.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, backgroundColor: 'var(--bg-app)', padding: '6px 12px', borderRadius: '8px' }}>
              <Icon name="clock" size={16} />
              <span>{course.estimatedHours} hours of deep learning</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#D97706', fontWeight: 800, backgroundColor: '#FEF3C7', padding: '6px 12px', borderRadius: '8px' }}>
              <Icon name="sparkles" size={16} fill="#FDE68A" />
              <span>{totalLessonsCount * 25} total XP available</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Overall Syllabus Completion</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{completedCount} / {totalLessonsCount} lessons</span>
          </div>
          <ProgressBar progress={progressPct} height={12} />
        </div>
      </div>

      {/* Modules & Lessons Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {effectiveModules.map((mod, modIdx) => (
          <div key={mod.id}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isPython ? `Unit ${modIdx + 1}` : `Module ${modIdx + 1}`}
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {mod.title}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {mod.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mod.lessons.map((lesson) => {
                const isCompleted = userProfile.completedLessonIds.includes(lesson.id);
                const isNext = !isCompleted && lesson.id === currentNextLessonId;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      if (isCompleted || isNext) {
                        startLesson(lesson.id);
                      }
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-lg)',
                      border: isNext ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: (isCompleted || isNext) ? 'pointer' : 'not-allowed',
                      opacity: (isCompleted || isNext) ? 1 : 0.6,
                      transition: 'all var(--transition-fast)'
                    }}
                    className={(isCompleted || isNext) ? 'hover-elevate' : ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* State icon */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? 'var(--brand-light)' : isNext ? '#EFF6FF' : 'var(--bg-app)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isCompleted ? 'var(--brand-primary)' : isNext ? '#2563EB' : 'var(--text-muted)',
                          boxShadow: isNext ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'none'
                        }}
                      >
                        {isCompleted ? (
                          <Icon name="check" size={24} stroke={3} />
                        ) : isNext ? (
                          <Icon name="player-play" size={20} fill="#2563EB" />
                        ) : (
                          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{lesson.order}</span>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {lesson.title}
                          </h3>
                          {isNext && (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '1px 6px', borderRadius: '4px' }}>
                              Next Up
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '6px', marginBottom: '4px' }}>
                          <Icon name="sparkles" size={14} fill="#FDE68A" />
                          +{lesson.xpReward} XP
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          ~{lesson.estimatedMinutes} min
                        </span>
                      </div>

                      <Button
                        variant={isCompleted ? 'secondary' : isNext ? 'primary' : 'outline'}
                        size="md"
                        disabled={!isCompleted && !isNext}
                        icon={isCompleted ? <Icon name="history" size={14} /> : (isNext ? <Icon name="player-play" size={14} fill="#fff" /> : <Icon name="lock" size={14} />)}
                      >
                        {isCompleted ? 'Review' : isNext ? 'Start' : 'Locked'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
