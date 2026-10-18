import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { progressionService } from '../services/progressionService';
import { CourseCategory } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Icon } from '../components/ui/Icon';

export const CourseExplorerView: React.FC = () => {
  const { allCourses, userProfile, userProgress, course: learningCourse, navigateTo, startLesson } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Tracks' },
    { id: 'programming', label: 'Programming' },
    { id: 'web', label: 'Web Development' },
    { id: 'cs', label: 'Computer Science' }
  ];

  const filteredCourses = selectedCategory === 'all'
    ? allCourses
    : allCourses.filter(c => c.category === selectedCategory);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Course Catalog & Learning Paths
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Structured, modular curriculums designed to take you from foundational syntax to building production software.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: selectedCategory === cat.id ? 'var(--text-primary)' : 'var(--bg-surface)',
              color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
              border: `1px solid ${selectedCategory === cat.id ? 'var(--text-primary)' : 'var(--border-default)'}`,
              transition: 'all var(--transition-fast)'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {filteredCourses.map(course => {
          const isPrimary = course.isPrimary;
          const isPython = course.id === 'python';
          // Calculate progress for Python
          const completedCount = isPython ? userProfile.completedLessonIds.length : 0;
          const progressPct = isPython && course.totalLessons > 0 
            ? Math.min(100, Math.round((completedCount / course.totalLessons) * 100)) 
            : 0;

          return (
            <Card
              key={course.id}
              variant={isPrimary ? 'interactive' : 'default'}
              padding="lg"
              onClick={() => navigateTo(`/app/course/${course.id}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isPrimary ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                position: 'relative'
              }}
            >
              {isPrimary && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Active Track
                </div>
              )}

              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <Badge variant={isPython ? 'python' : 'neutral'} size="sm">
                    {course.difficulty}
                  </Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <Icon name="clock" size={14} />
                    <span>{course.estimatedHours} hrs</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                  {course.description}
                </p>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {course.skillsTaught.slice(0, 3).map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'var(--bg-app)',
                        color: 'var(--text-secondary)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 500,
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {course.skillsTaught.length > 3 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 4px' }}>
                      +{course.skillsTaught.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Progress & Action */}
              <div>
                {isPython ? (
                  <div style={{ marginBottom: '16px' }}>
                    <ProgressBar progress={progressPct} showLabel label={`${completedCount} of ${course.totalLessons} lessons completed`} height={6} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <Icon name="book" size={16} />
                    <span>{course.totalLessons} modular lessons</span>
                  </div>
                )}

                <Button
                  variant={isPrimary ? 'primary' : 'secondary'}
                  size="md"
                  style={{ width: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPython) {
                      const nextId = progressionService.getNextLesson(userProgress || userProfile, learningCourse) || '1.1';
                      startLesson(nextId);
                    } else {
                      navigateTo(`/app/course/${course.id}`);
                    }
                  }}
                  icon={<Icon name="arrow-right" size={15} stroke={3} />}
                  iconPosition="right"
                >
                  {isPrimary ? 'Continue Track' : 'View Syllabus'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
