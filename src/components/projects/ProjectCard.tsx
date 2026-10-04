import React from 'react';
import { Project } from '../../data/projectsData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Icon } from '../ui/Icon';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  isCompleted?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  isCompleted = false
}) => {
  const getDifficultyBadge = () => {
    switch (project.difficulty) {
      case 'beginner':
        return <Badge variant="success" size="sm">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="warning" size="sm">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="brand" size="sm">Advanced</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{project.difficulty}</Badge>;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl, 16px)',
        border: '1px solid var(--border-default, #E5E7EB)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: 'var(--shadow-xs, 0 1px 3px rgba(0,0,0,0.05))',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="hover-elevate"
    >
      {/* Top Meta row */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getDifficultyBadge()}
            {isCompleted && (
              <Badge variant="success" size="sm" icon={<Icon name="check" size={12} stroke={3} />}>
                Built
              </Badge>
            )}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #6B7280)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="clock" size={14} />
            {project.estimatedTime}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--text-primary, #111827)',
            margin: '0 0 8px',
            lineHeight: 1.3
          }}
        >
          {project.title}
        </h3>

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary, #4B5563)',
            lineHeight: 1.55,
            margin: '0 0 18px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {project.shortDescription}
        </p>

        {/* Skills Tag Cloud */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
          {project.skills.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#374151',
                backgroundColor: '#F3F4F6',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              {skill}
            </span>
          ))}
          {project.skills.length > 5 && (
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', padding: '3px 4px' }}>
              +{project.skills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
        <Button
          variant={isCompleted ? 'outline' : 'primary'}
          size="md"
          onClick={() => onSelect(project)}
          fullWidth
          icon={<Icon name="code" size={16} />}
          iconPosition="left"
          style={{ fontWeight: 700 }}
        >
          {isCompleted ? 'Continue Building' : 'Build Project'}
        </Button>
      </div>
    </div>
  );
};
