import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Project, PROJECTS_DATA, ProjectDifficulty } from '../data/projectsData';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectWorkspaceView } from './ProjectWorkspaceView';
import { codeExecutionService } from '../services/codeExecutionService';

type PracticeSubTab = 'projects' | 'playground';
type DifficultyFilter = 'all' | ProjectDifficulty;

export const PracticeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeSubTab>('projects');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Playground state
  const [playgroundCode, setPlaygroundCode] = useState<string>(
    '# Python Playground\n# Test algorithms, snippets, and functions freely\n\ndef greet_learner(name):\n    return f"Welcome to the Python Playground, {name}!"\n\nmessage = greet_learner("Learner")\nprint(message)\n\n# Try loops, lists, dictionaries, or custom functions below:\nnumbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\nprint(f"Squares: {squares}")\n'
  );
  const [playgroundOutput, setPlaygroundOutput] = useState<string>('');
  const [isPlayingRunning, setIsPlayingRunning] = useState<boolean>(false);
  const [playgroundTime, setPlaygroundTime] = useState<number | null>(null);
  const [playgroundError, setPlaygroundError] = useState<boolean>(false);

  // If a project is selected, render the dedicated ProjectWorkspaceView
  if (selectedProject) {
    return (
      <ProjectWorkspaceView
        project={selectedProject}
        onBack={() => {
          sound.playClick();
          setSelectedProject(null);
        }}
      />
    );
  }

  // Filter projects by difficulty and search query
  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const matchesDifficulty = difficultyFilter === 'all' || project.difficulty === difficultyFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      project.title.toLowerCase().includes(query) ||
      project.shortDescription.toLowerCase().includes(query) ||
      project.skills.some((s) => s.toLowerCase().includes(query)) ||
      project.topics.some((t) => t.toLowerCase().includes(query));

    return matchesDifficulty && matchesSearch;
  });

  const beginnerCount = PROJECTS_DATA.filter((p) => p.difficulty === 'beginner').length;
  const intermediateCount = PROJECTS_DATA.filter((p) => p.difficulty === 'intermediate').length;
  const advancedCount = PROJECTS_DATA.filter((p) => p.difficulty === 'advanced').length;

  const handleRunPlayground = async () => {
    sound.playClick();
    setIsPlayingRunning(true);
    setPlaygroundError(false);

    try {
      const res = await codeExecutionService.executeRaw(playgroundCode);
      setPlaygroundTime(res.executionTimeMs);
      if (res.error) {
        setPlaygroundError(true);
        setPlaygroundOutput(res.stdout ? `${res.stdout}\n\n[Error] ${res.error}` : `Error: ${res.error}`);
        sound.playError();
      } else {
        setPlaygroundOutput(res.stdout);
        sound.playSuccess();
      }
    } catch (err: any) {
      setPlaygroundError(true);
      setPlaygroundOutput(`Execution failed: ${err?.message || 'Runtime error'}`);
      sound.playError();
    } finally {
      setIsPlayingRunning(false);
    }
  };

  const handleResetPlayground = () => {
    if (window.confirm('Reset playground code to default snippet?')) {
      setPlaygroundCode('# Python Playground\n# Write and execute any custom Python code here\n\nprint("Hello, world!")\n');
      setPlaygroundOutput('');
      sound.playClick();
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px 80px' }} className="animate-fade-in">
      {/* Top Header & Section Switcher */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant="brand" size="md">
                <Icon name="barbell" size={14} style={{ marginRight: 4 }} /> Practice & Build
              </Badge>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                Learn in Lessons • Build in Practice
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Practice Arena
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.5, margin: 0 }}>
              Build real-world Python applications or experiment freely with custom algorithms in the playground.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div
            style={{
              display: 'inline-flex',
              padding: '5px',
              backgroundColor: 'var(--bg-surface-subtle, #FAF6EE)',
              border: '1.5px solid var(--border-default, #E5DDD0)',
              boxShadow: '0 2px 0 var(--border-default, #E5DDD0)',
              borderRadius: 'var(--radius-xl, 16px)',
              gap: '6px'
            }}
          >
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('projects');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                border: activeTab === 'projects' ? '1.5px solid var(--border-default)' : '1.5px solid transparent',
                backgroundColor: activeTab === 'projects' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'projects' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'projects' ? '0 3px 0 var(--border-default)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              <Icon name="folder" size={18} style={{ color: activeTab === 'projects' ? 'var(--brand-primary)' : 'currentColor' }} />
              <span>Projects ({PROJECTS_DATA.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('playground');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                border: activeTab === 'playground' ? '1.5px solid var(--border-default)' : '1.5px solid transparent',
                backgroundColor: activeTab === 'playground' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'playground' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'playground' ? '0 3px 0 var(--border-default)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              <Icon name="terminal" size={18} style={{ color: activeTab === 'playground' ? 'var(--brand-primary)' : 'currentColor' }} />
              <span>Python Playground</span>
            </button>
          </div>
        </div>

        <div style={{ height: '1.5px', backgroundColor: 'var(--border-default, #E5DDD0)' }} />
      </div>

      {/* TAB 1: PROJECTS SECTION */}
      {activeTab === 'projects' && (
        <div className="animate-fade-in">
          {/* Controls Bar: Difficulty Filter Tabs & Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '28px'
            }}
          >
            {/* Difficulty Tabs: All, Beginner, Intermediate, Advanced */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  sound.playClick();
                  setDifficultyFilter('all');
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: difficultyFilter === 'all' ? '1.5px solid #1E1B17' : '1.5px solid var(--border-default)',
                  backgroundColor: difficultyFilter === 'all' ? '#1E1B17' : '#FFFFFF',
                  color: difficultyFilter === 'all' ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: difficultyFilter === 'all' ? '0 3px 0 #000' : '0 2px 0 var(--border-default)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                All ({PROJECTS_DATA.length})
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setDifficultyFilter('beginner');
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: difficultyFilter === 'beginner' ? '1.5px solid #059669' : '1.5px solid var(--border-default)',
                  backgroundColor: difficultyFilter === 'beginner' ? '#ECFDF5' : '#FFFFFF',
                  color: difficultyFilter === 'beginner' ? '#065F46' : 'var(--text-primary)',
                  boxShadow: difficultyFilter === 'beginner' ? '0 3px 0 #047857' : '0 2px 0 var(--border-default)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Beginner ({beginnerCount})
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setDifficultyFilter('intermediate');
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: difficultyFilter === 'intermediate' ? '1.5px solid #D97706' : '1.5px solid var(--border-default)',
                  backgroundColor: difficultyFilter === 'intermediate' ? '#FEF3C7' : '#FFFFFF',
                  color: difficultyFilter === 'intermediate' ? '#92400E' : 'var(--text-primary)',
                  boxShadow: difficultyFilter === 'intermediate' ? '0 3px 0 #B45309' : '0 2px 0 var(--border-default)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Intermediate ({intermediateCount})
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setDifficultyFilter('advanced');
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: difficultyFilter === 'advanced' ? '1.5px solid #4338CA' : '1.5px solid var(--border-default)',
                  backgroundColor: difficultyFilter === 'advanced' ? '#EEF2FF' : '#FFFFFF',
                  color: difficultyFilter === 'advanced' ? '#312E81' : 'var(--text-primary)',
                  boxShadow: difficultyFilter === 'advanced' ? '0 3px 0 #312E81' : '0 2px 0 var(--border-default)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Advanced ({advancedCount})
              </button>
            </div>

            {/* Keyword Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <Icon
                name="search"
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
              />
              <input
                type="text"
                placeholder="Search projects or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default, #D1D5DB)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px dashed #D1D5DB'
              }}
            >
              <Icon name="search" size={36} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#374151' }}>
                No projects matched "{searchQuery}"
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 16px' }}>
                Try adjusting your search terms or clearing difficulty filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px'
              }}
            >
              {filteredProjects.map((project) => {
                const isCompleted = localStorage.getItem(`codolingo_project_completed_${project.id}`) === 'true';
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isCompleted={isCompleted}
                    onSelect={(p) => {
                      sound.playClick();
                      setSelectedProject(p);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PYTHON PLAYGROUND SECTION */}
      {activeTab === 'playground' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Interactive Python Playground
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                A freeform coding sandbox. Write functions, test syntax, experiment with data structures, and run real Python code.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleResetPlayground}
                style={{
                  background: 'none',
                  border: '1px solid #D1D5DB',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  color: '#4B5563',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Icon name="history" size={14} />
                <span>Reset</span>
              </button>

              <Button
                variant="primary"
                size="md"
                onClick={handleRunPlayground}
                isLoading={isPlayingRunning}
                icon={<Icon name="player-play" size={16} fill="#fff" />}
                style={{ fontWeight: 700 }}
              >
                Run Code
              </Button>
            </div>
          </div>

          {/* Playground Editor + Terminal Console */}
          <div
            style={{
              borderRadius: 'var(--radius-xl, 16px)',
              border: '1px solid #2D3748',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))',
              backgroundColor: '#1E1E1E'
            }}
          >
            {/* Editor Window Header */}
            <div
              style={{
                height: '42px',
                backgroundColor: '#252526',
                borderBottom: '1px solid #333333',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: 'monospace', marginLeft: '8px' }}>
                  playground.py
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#6B7280', fontFamily: 'monospace' }}>
                Python 3 (Pyodide / WASM Runtime)
              </span>
            </div>

            {/* Monaco Editor */}
            <div style={{ height: '360px' }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                value={playgroundCode}
                onChange={(val) => setPlaygroundCode(val || '')}
                theme="vs-dark"
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

            {/* Terminal Console */}
            <div
              style={{
                height: '200px',
                backgroundColor: '#141414',
                borderTop: '2px solid #2D3748',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  height: '34px',
                  backgroundColor: '#1A1A1A',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #282828'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="terminal" size={14} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    TERMINAL OUTPUT
                  </span>
                  {playgroundTime !== null && (
                    <span style={{ fontSize: '0.7rem', color: '#6B7280', fontFamily: 'monospace' }}>
                      ({playgroundTime} ms)
                    </span>
                  )}
                </div>

                {playgroundOutput && (
                  <button
                    onClick={() => setPlaygroundOutput('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Console
                  </button>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  color: playgroundError ? '#F87171' : '#4ADE80'
                }}
              >
                {playgroundOutput ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {playgroundOutput}
                  </pre>
                ) : (
                  <div style={{ color: '#6B7280', fontStyle: 'italic', fontSize: '0.8rem' }}>
                    Click "Run Code" above to execute your Python script.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
