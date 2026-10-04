import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { Project } from '../data/projectsData';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Icon } from '../components/ui/Icon';
import { sound } from '../utils/audio';
import { codeExecutionService } from '../services/codeExecutionService';

interface ProjectWorkspaceViewProps {
  project: Project;
  onBack: () => void;
}

export const ProjectWorkspaceView: React.FC<ProjectWorkspaceViewProps> = ({ project, onBack }) => {
  const storageKey = `codolingo_project_code_${project.id}`;
  const completionKey = `codolingo_project_completed_${project.id}`;

  const defaultStarter = `# Start building your project here\n# Project: ${project.title}\n# Difficulty: ${project.difficulty.toUpperCase()}\n\n`;

  const [code, setCode] = useState<string>(() => {
    return localStorage.getItem(storageKey) || defaultStarter;
  });

  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    return localStorage.getItem(completionKey) === 'true';
  });

  const [activeTab, setActiveTab] = useState<'both' | 'brief' | 'editor'>('both');
  const editorRef = useRef<any>(null);

  // Auto-save code on change
  useEffect(() => {
    localStorage.setItem(storageKey, code);
  }, [code, storageKey]);

  const handleRun = async () => {
    sound.playClick();
    setIsRunning(true);
    setHasError(false);

    try {
      const res = await codeExecutionService.executeRaw(code);
      setExecutionTime(res.executionTimeMs);
      if (res.error) {
        setHasError(true);
        setOutput(res.stdout ? `${res.stdout}\n\n[Error] ${res.error}` : `Error: ${res.error}`);
        sound.playError();
      } else {
        setOutput(res.stdout);
        sound.playSuccess();
      }
    } catch (err: any) {
      setHasError(true);
      setOutput(`Execution failed: ${err?.message || 'Unknown runtime error'}`);
      sound.playError();
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter comment? This will discard your current editor text.')) {
      setCode(defaultStarter);
      setOutput('');
      sound.playClick();
    }
  };

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    localStorage.setItem(completionKey, String(nextState));

    if (nextState) {
      sound.playSuccess();
      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else {
      sound.playClick();
    }
  };

  const scrollToEditor = () => {
    sound.playClick();
    setActiveTab('editor');
    const el = document.getElementById('project-editor-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDifficultyBadge = () => {
    switch (project.difficulty) {
      case 'beginner':
        return <Badge variant="success" size="md">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="warning" size="md">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="brand" size="md">Advanced</Badge>;
      default:
        return <Badge variant="neutral" size="md">{project.difficulty}</Badge>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-default, #E5E7EB)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary, #4B5563)',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '8px'
            }}
            title="Return to projects list"
          >
            <Icon name="arrow-left" size={18} stroke={2.5} />
            <span>Projects</span>
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #111827)' }}>
              {project.title}
            </h2>
            {getDifficultyBadge()}
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleToggleComplete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-lg, 10px)',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: isCompleted ? '1px solid #10B981' : '1px solid #D1D5DB',
              backgroundColor: isCompleted ? '#ECFDF5' : '#FFFFFF',
              color: isCompleted ? '#065F46' : '#4B5563',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <Icon name={isCompleted ? 'check' : 'circle'} size={16} stroke={2.5} />
            <span>{isCompleted ? 'Project Completed' : 'Mark as Done'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Column: Project Brief */}
        <div
          style={{
            flex: '1 1 45%',
            maxWidth: '620px',
            minWidth: '340px',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid var(--border-default, #E5E7EB)',
            overflowY: 'auto',
            padding: '32px 28px 80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
          }}
        >
          {/* Brief Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PROJECT BRIEF
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="clock" size={14} /> Est. {project.estimatedTime}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              {project.title}
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {project.shortDescription}
            </p>

            <div style={{ marginTop: '20px' }}>
              <Button
                variant="primary"
                size="md"
                onClick={scrollToEditor}
                icon={<Icon name="code" size={16} />}
                style={{ fontWeight: 700 }}
              >
                Start Building in Editor
              </Button>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E7EB' }} />

          {/* Project Goal */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="target" size={18} style={{ color: 'var(--brand-primary)' }} />
              Project Goal
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>
              {project.goal}
            </p>
            <div style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>
              <strong>What you're building:</strong> {project.whatYouAreBuilding}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="checklist" size={18} style={{ color: '#2563EB' }} />
              Requirements
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {project.requirements.map((req, idx) => (
                <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Skills & Concepts Involved */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="cpu" size={18} style={{ color: '#D97706' }} />
              Concepts & Skills Involved
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {project.skills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#1F2937',
                    backgroundColor: '#FEF3C7',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Useful Python Topics */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="book" size={18} style={{ color: '#059669' }} />
              Useful Python Topics
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.topics.map((topic, idx) => (
                <li key={idx} style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.4 }}>
                  <code style={{ backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    {topic}
                  </code>
                </li>
              ))}
            </ul>
          </div>

          {/* Things to Think About */}
          <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE', padding: '18px 20px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E40AF', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="bulb" size={18} style={{ color: '#2563EB' }} />
              Things to Think About
            </h3>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {project.thinkingPoints.map((point, idx) => (
                <li key={idx} style={{ fontSize: '0.88rem', color: '#1E3A8A', lineHeight: 1.5 }}>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Extensions */}
          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '18px 20px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="sparkles" size={18} style={{ color: '#D97706' }} />
              Ideas for Taking It Further
            </h3>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.extensions.map((ext, idx) => (
                <li key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {ext}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Terminal */}
        <div
          id="project-editor-container"
          style={{
            flex: '1 1 55%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1E1E1E',
            borderLeft: '1px solid #2D3748'
          }}
        >
          {/* Editor Header Bar */}
          <div
            style={{
              height: '48px',
              backgroundColor: '#252526',
              borderBottom: '1px solid #333333',
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon name="code" size={16} style={{ color: '#10B981' }} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#D4D4D4', fontFamily: 'var(--font-mono, monospace)' }}>
                main.py
              </span>
              <span style={{ fontSize: '0.72rem', color: '#888', backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px' }}>
                Python 3
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleResetCode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
                title="Reset to blank starter comment"
              >
                <Icon name="history" size={14} />
                <span>Reset</span>
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleRun}
                isLoading={isRunning}
                icon={<Icon name="player-play" size={14} fill="#fff" />}
                style={{ fontWeight: 700, padding: '6px 14px' }}
              >
                RUN
              </Button>
            </div>
          </div>

          {/* Monaco Python Editor */}
          <div style={{ flex: 1, minHeight: '340px' }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Terminal Output Console */}
          <div
            style={{
              height: '240px',
              backgroundColor: '#181818',
              borderTop: '2px solid #2D3748',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Console Toolbar */}
            <div
              style={{
                height: '36px',
                backgroundColor: '#1F1F1F',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #2D2D2D'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="terminal" size={14} style={{ color: '#9CA3AF' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TERMINAL OUTPUT
                </span>
                {executionTime !== null && (
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', fontFamily: 'monospace' }}>
                    ({executionTime} ms)
                  </span>
                )}
              </div>

              {output && (
                <button
                  onClick={() => setOutput('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    padding: '2px 6px'
                  }}
                >
                  Clear Console
                </button>
              )}
            </div>

            {/* Console Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 16px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: hasError ? '#F87171' : '#4ADE80'
              }}
            >
              {output ? (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {output}
                </pre>
              ) : (
                <div style={{ color: '#6B7280', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  Write your code above and click RUN to execute and see console output.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
