import React, { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { Badge } from '../components/common/Badge';
import { Project, PROJECTS_DATA, ProjectDifficulty } from '../data/projectsData';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectWorkspaceView } from './ProjectWorkspaceView';
import { PracticeWorkspaceView } from './practice/PracticeWorkspaceView';
import { practiceChallengeService, PracticeChallengeItem } from '../services/practiceChallengeService';
import { practiceStorageService } from '../services/practiceStorageService';
import { sound } from '../utils/audio';

type PracticeSubTab = 'playground' | 'challenges' | 'projects';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard' | ProjectDifficulty;

export const PracticeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeSubTab>('playground');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selection states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<PracticeChallengeItem | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);

  // Completed challenges tracker
  const completedChallengeIds = practiceStorageService.getCompletedChallengeIds();

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

  // If Playground full IDE is opened
  if (isWorkspaceOpen && activeTab === 'playground') {
    return (
      <PracticeWorkspaceView
        mode="playground"
        onBack={() => {
          sound.playClick();
          setIsWorkspaceOpen(false);
        }}
      />
    );
  }

  // If a Challenge full IDE is opened
  if (selectedChallenge) {
    const nextCh = practiceChallengeService.getNextChallenge(selectedChallenge.id);
    return (
      <PracticeWorkspaceView
        mode="challenge"
        challenge={selectedChallenge}
        onBack={() => {
          sound.playClick();
          setSelectedChallenge(null);
        }}
        onNextChallenge={nextCh ? () => {
          sound.playClick();
          setSelectedChallenge(nextCh);
        } : undefined}
      />
    );
  }

  // Challenges list
  const allChallenges = practiceChallengeService.getAllChallenges();
  const filteredChallenges = allChallenges.filter((ch) => {
    const matchesDifficulty = difficultyFilter === 'all' || ch.difficulty === difficultyFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      ch.title.toLowerCase().includes(query) ||
      ch.description.toLowerCase().includes(query) ||
      ch.topic.toLowerCase().includes(query) ||
      (ch.lessonTitle && ch.lessonTitle.toLowerCase().includes(query));

    return matchesDifficulty && matchesSearch;
  });

  // Projects list
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

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
      case 'beginner':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
      case 'medium':
      case 'intermediate':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'hard':
      case 'advanced':
        return { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
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
              Master Python through sandbox experimentation, curriculum-backed coding challenges, and capstone software projects.
            </p>
          </div>

          {/* Navigation Pill Switcher (Playground | Challenges | Projects) */}
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
                setActiveTab('playground');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
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
              <span>Playground</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('challenges');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                border: activeTab === 'challenges' ? '1.5px solid var(--border-default)' : '1.5px solid transparent',
                backgroundColor: activeTab === 'challenges' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'challenges' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'challenges' ? '0 3px 0 var(--border-default)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              <Icon name="code" size={18} style={{ color: activeTab === 'challenges' ? 'var(--brand-primary)' : 'currentColor' }} />
              <span>Challenges ({allChallenges.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('projects');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
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
          </div>
        </div>

        <div style={{ height: '1.5px', backgroundColor: 'var(--border-default, #E5DDD0)' }} />
      </div>

      {/* 1. PLAYGROUND LAUNCHER CARD */}
      {activeTab === 'playground' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              backgroundColor: '#161B22',
              border: '1.5px solid #30363D',
              borderRadius: '20px',
              padding: '36px 32px',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ maxWidth: '640px', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(88, 166, 255, 0.15)', color: '#58A6FF', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', marginBottom: '14px' }}>
                <Icon name="terminal" size={15} />
                <span>INTERACTIVE PYTHON 3 IDE</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 12px', color: '#F0F6FC' }}>
                Free-form Python Sandbox
              </h2>
              <p style={{ color: '#8B949E', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                Write, execute, and debug custom Python algorithms with instant WebAssembly execution, standard output streaming, and automatic local saving.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setIsWorkspaceOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#2EA043',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                color: '#FFFFFF',
                padding: '14px 28px',
                fontSize: '1.05rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(46, 160, 67, 0.4)',
                transition: 'all 120ms ease',
                zIndex: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3FB950';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2EA043';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Icon name="player-play" size={20} />
              <span>Launch Playground IDE</span>
            </button>
          </div>

          {/* Quick Feature highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid var(--border-default)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 0 var(--border-default)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '12px' }}>
                <Icon name="bolt" size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Instant WASM Engine</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Runs actual Python 3 code in browser sandbox with millisecond responsiveness and full standard library.
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid var(--border-default)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 0 var(--border-default)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '12px' }}>
                <Icon name="device-floppy" size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Debounced Autosave</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Your code and experiments are saved continuously to local storage, surviving browser refreshes.
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid var(--border-default)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 0 var(--border-default)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', marginBottom: '12px' }}>
                <Icon name="terminal" size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Standard I/O Terminal</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Formatted stdout capture and detailed runtime error diagnostics with line number stack traces.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHALLENGES SECTION */}
      {activeTab === 'challenges' && (
        <div className="animate-fade-in">
          {/* Filter Bar */}
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
            {/* Difficulty Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => {
                const count = diff === 'all' ? allChallenges.length : allChallenges.filter(c => c.difficulty === diff).length;
                const active = difficultyFilter === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      sound.playClick();
                      setDifficultyFilter(diff);
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      border: active ? '1.5px solid #1E1B17' : '1.5px solid var(--border-default)',
                      backgroundColor: active ? '#1E1B17' : '#FFFFFF',
                      color: active ? '#FFFFFF' : 'var(--text-primary)',
                      boxShadow: active ? '0 3px 0 #000' : '0 2px 0 var(--border-default)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {diff} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Icon
                name="search"
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search coding challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: '1.5px solid var(--border-default)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 2px 0 var(--border-default)'
                }}
              />
            </div>
          </div>

          {/* Challenges Grid */}
          {filteredChallenges.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filteredChallenges.map((ch) => {
                const isCompleted = completedChallengeIds.includes(ch.id);
                const badge = getDifficultyBadge(ch.difficulty);

                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedChallenge(ch);
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: isCompleted ? '1.5px solid #10B981' : '1.5px solid var(--border-default)',
                      borderRadius: '16px',
                      padding: '22px',
                      boxShadow: isCompleted ? '0 3px 0 #059669' : '0 3px 0 var(--border-default)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'all 120ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isCompleted ? '0 5px 0 #059669' : '0 5px 0 var(--border-default)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isCompleted ? '0 3px 0 #059669' : '0 3px 0 var(--border-default)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`
                          }}
                        >
                          {ch.difficulty.toUpperCase()}
                        </span>

                        {isCompleted ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="circle-check" size={15} /> Solved
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                            {ch.tests.length} tests
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {ch.title}
                      </h3>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ch.description.replace(/^#+\s*/, '')}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <Icon name="book" size={13} />
                        <span>{ch.lessonTitle || ch.topic}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle, #F0EAE1)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                        +{ch.xpReward} XP
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Open Challenge <Icon name="arrow-right" size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid var(--border-default)' }}>
              <Icon name="search" size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>No challenges match your filter</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Try adjusting your search keywords or switching difficulty.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. PROJECTS SECTION */}
      {activeTab === 'projects' && (
        <div className="animate-fade-in">
          {/* Controls Bar */}
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
            {/* Difficulty Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => {
                const count = diff === 'all' ? PROJECTS_DATA.length : PROJECTS_DATA.filter(p => p.difficulty === diff).length;
                const active = difficultyFilter === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      sound.playClick();
                      setDifficultyFilter(diff);
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      border: active ? '1.5px solid #1E1B17' : '1.5px solid var(--border-default)',
                      backgroundColor: active ? '#1E1B17' : '#FFFFFF',
                      color: active ? '#FFFFFF' : 'var(--text-primary)',
                      boxShadow: active ? '0 3px 0 #000' : '0 2px 0 var(--border-default)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {diff} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Icon
                name="search"
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search projects by title, topic, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: '1.5px solid var(--border-default)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 2px 0 var(--border-default)'
                }}
              />
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px'
              }}
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => {
                    sound.playClick();
                    setSelectedProject(p);
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid var(--border-default)',
                boxShadow: '0 2px 0 var(--border-default)'
              }}
            >
              <Icon name="search" size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                No projects match your filter
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Try adjusting your search query or selecting a different difficulty level.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
