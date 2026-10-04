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
        borderRadius: 'var(--radius-xl, 20px)',
        border: '1.5px solid var(--border-default, #E5DDD0)',
        boxShadow: 'var(--tactile-card, 0 4px 0 #E2D9CC)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="card-plate card-plate-interactive"
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
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #8E8A83)', fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="clock" size={14} />
            {project.estimatedTime}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary, #1E1B17)',
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
            color: 'var(--text-secondary, #57534E)',
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
                color: 'var(--text-secondary, #57534E)',
                backgroundColor: 'var(--bg-surface-subtle, #FAF6EE)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-default, #E5DDD0)',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              {skill}
            </span>
          ))}
          {project.skills.length > 5 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #8E8A83)', padding: '3px 4px' }}>
              +{project.skills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ paddingTop: '16px', borderTop: '1.5px solid var(--border-subtle, #F2EBE1)' }}>
        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          size="md"
          onClick={() => onSelect(project)}
          fullWidth
          icon={<Icon name="code" size={16} />}
          iconPosition="left"
        >
          {isCompleted ? 'Resume Workspace' : 'Build Project'}
        </Button>
      </div>
    </div>
  );
};
