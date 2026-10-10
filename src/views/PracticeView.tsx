import React, { useState, useMemo } from 'react';
import { Icon } from '../components/ui/Icon';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Project, PROJECTS_DATA, ProjectDifficulty } from '../data/projectsData';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectWorkspaceView } from './ProjectWorkspaceView';
import { PracticeWorkspaceView } from './practice/PracticeWorkspaceView';
import { PlaygroundWorkspace } from './practice/PlaygroundWorkspace';
import { practiceChallengeService, PracticeChallengeItem } from '../services/practiceChallengeService';
import { practiceStorageService } from '../services/practiceStorageService';
import { sound } from '../utils/audio';

type PracticeSubTab = 'playground' | 'challenges' | 'projects';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard' | ProjectDifficulty;
type StatusFilter = 'all' | 'solved' | 'unsolved';

export const PracticeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeSubTab>('playground');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selection states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<PracticeChallengeItem | null>(null);

  // Completed challenges tracker
  const completedChallengeIds = practiceStorageService.getCompletedChallengeIds();

  // Challenges list
  const allChallenges = practiceChallengeService.getAllChallenges();

  // Distinct Topics
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    allChallenges.forEach((c) => {
      if (c.topic) set.add(c.topic.trim());
    });
    return Array.from(set).sort();
  }, [allChallenges]);

  // Filtered Challenges
  const filteredChallenges = allChallenges.filter((ch) => {
    const matchesDifficulty = difficultyFilter === 'all' || ch.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === 'all' || ch.topic.toLowerCase() === topicFilter.toLowerCase();
    const isCompleted = completedChallengeIds.includes(ch.id);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'solved' && isCompleted) ||
      (statusFilter === 'unsolved' && !isCompleted);

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      ch.title.toLowerCase().includes(query) ||
      ch.description.toLowerCase().includes(query) ||
      ch.topic.toLowerCase().includes(query) ||
      (ch.lessonTitle && ch.lessonTitle.toLowerCase().includes(query));

    return matchesDifficulty && matchesTopic && matchesStatus && matchesSearch;
  });

  // Filtered Projects
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

  const handleResetFilters = () => {
    sound.playClick();
    setDifficultyFilter('all');
    setTopicFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

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

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
      case 'beginner':
        return { bg: 'var(--success-bg, #ECFDF5)', text: 'var(--success-text, #065F46)', border: 'var(--success-border, #A7F3D0)' };
      case 'medium':
      case 'intermediate':
        return { bg: 'var(--warning-bg, #FEF3C7)', text: 'var(--warning-text, #92400E)', border: 'var(--warning-border, #FDE68A)' };
      case 'hard':
      case 'advanced':
        return { bg: 'var(--error-bg, #FEE2E2)', text: 'var(--error-text, #991B1B)', border: 'var(--error-border, #FECACA)' };
      default:
        return { bg: 'var(--bg-surface-subtle)', text: 'var(--text-secondary)', border: 'var(--border-default)' };
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px 80px' }} className="animate-fade-in">
      {/* Top Header & Section Switcher */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Practice Arena
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.5, margin: 0 }}>
              Freeform sandbox, curriculum coding challenges, and capstone software projects.
            </p>
          </div>

          {/* Navigation Pill Switcher (Playground | Challenges | Projects) */}
          <div
            style={{
              display: 'inline-flex',
              padding: '5px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1.5px solid var(--border-default)',
              boxShadow: '0 2px 0 var(--border-default)',
              borderRadius: 'var(--radius-xl)',
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
                padding: '10px 18px',
                borderRadius: '12px',
                border: activeTab === 'playground' ? '1.5px solid var(--border-default)' : '1.5px solid transparent',
                backgroundColor: activeTab === 'playground' ? 'var(--bg-surface)' : 'transparent',
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
                padding: '10px 18px',
                borderRadius: '12px',
                border: activeTab === 'challenges' ? '1.5px solid var(--border-default)' : '1.5px solid transparent',
                backgroundColor: activeTab === 'challenges' ? 'var(--bg-surface)' : 'transparent',
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
                padding: '10px 18px',
                borderRadius: '12px',
                border: activeTab === 'projects' ? '1.5px solid var(--border-default)' : '1.5px solid transparent',
                backgroundColor: activeTab === 'projects' ? 'var(--bg-surface)' : 'transparent',
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

        <div style={{ height: '1.5px', backgroundColor: 'var(--border-default)' }} />
      </div>

      {/* 1. PLAYGROUND WORKSPACE */}
      {activeTab === 'playground' && (
        <div className="animate-fade-in" style={{ width: '100%' }}>
          <PlaygroundWorkspace isEmbedded={true} />
        </div>
      )}

      {/* 2. CHALLENGES SECTION */}
      {activeTab === 'challenges' && (
        <div className="animate-fade-in">
          {/* Top Filter Bar (Difficulty, Status, and Search) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '18px'
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
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1.5px solid var(--text-primary)' : '1.5px solid var(--border-default)',
                      backgroundColor: active ? 'var(--text-primary)' : 'var(--bg-surface)',
                      color: active ? 'var(--bg-app)' : 'var(--text-primary)',
                      boxShadow: active ? '0 3px 0 rgba(0,0,0,0.25)' : '0 2px 0 var(--border-default)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {diff} ({count})
                  </button>
                );
              })}
            </div>

            {/* Status Filter (All / Solved / Unsolved) */}
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--border-default)',
                gap: '4px'
              }}
            >
              {(['all', 'solved', 'unsolved'] as const).map((status) => {
                const active = statusFilter === status;
                const icon = status === 'solved' ? 'check' : status === 'unsolved' ? 'circle' : 'list';
                return (
                  <button
                    key={status}
                    onClick={() => {
                      sound.playClick();
                      setStatusFilter(status);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                      color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      boxShadow: active ? '0 2px 0 var(--border-default)' : 'none',
                      textTransform: 'capitalize'
                    }}
                  >
                    <Icon name={icon} size={13} stroke={2.5} />
                    <span>{status}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '360px' }}>
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
                placeholder="Search by title, prompt, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 2px 0 var(--border-default)'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Topic Filter Chips Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '14px',
              marginBottom: '20px',
              scrollbarWidth: 'thin'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', marginRight: '4px' }}>
              Topics:
            </span>

            <button
              onClick={() => {
                sound.playClick();
                setTopicFilter('all');
              }}
              style={{
                whiteSpace: 'nowrap',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                border: topicFilter === 'all' ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
                backgroundColor: topicFilter === 'all' ? 'var(--brand-primary)' : 'var(--bg-surface)',
                color: topicFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: topicFilter === 'all' ? '0 2px 0 var(--brand-bevel)' : '0 1px 0 var(--border-default)',
                transition: 'all 120ms ease'
              }}
            >
              All Topics
            </button>

            {availableTopics.map((top) => {
              const active = topicFilter.toLowerCase() === top.toLowerCase();
              return (
                <button
                  key={top}
                  onClick={() => {
                    sound.playClick();
                    setTopicFilter(top);
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    border: active ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
                    backgroundColor: active ? 'var(--brand-primary)' : 'var(--bg-surface)',
                    color: active ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    boxShadow: active ? '0 2px 0 var(--brand-bevel)' : '0 1px 0 var(--border-default)',
                    transition: 'all 120ms ease'
                  }}
                >
                  {top}
                </button>
              );
            })}
          </div>

          {/* Active Filter Summary Bar if filtered */}
          {(difficultyFilter !== 'all' || topicFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== '') && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                marginBottom: '20px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span>
                Showing <strong>{filteredChallenges.length}</strong> of {allChallenges.length} challenges matching filters
              </span>
              <button
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Icon name="refresh" size={13} />
                <span>Reset filters</span>
              </button>
            </div>
          )}

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
                      backgroundColor: 'var(--bg-surface)',
                      border: isCompleted ? '1.5px solid var(--success-text)' : '1.5px solid var(--border-default)',
                      borderRadius: '16px',
                      padding: '22px',
                      boxShadow: isCompleted ? '0 3px 0 var(--success-text)' : '0 3px 0 var(--border-default)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'all 120ms ease'
                    }}
                    className="card-plate-interactive"
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
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
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success-text, #059669)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="circle-check" size={15} stroke={2.5} /> Solved
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="sparkles" size={13} /> +{ch.xpReward} XP
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Open Challenge <Icon name="arrow-right" size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '16px',
                border: '1.5px solid var(--border-default)',
                boxShadow: '0 2px 0 var(--border-default)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--text-muted)'
                }}
              >
                <Icon name="search" size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                No challenges match your filters
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 20px', maxWidth: '420px', marginInline: 'auto' }}>
                We couldn't find any challenges matching your current search and filter combination.
              </p>
              <Button variant="primary" size="md" onClick={handleResetFilters} icon={<Icon name="refresh" size={15} />}>
                Reset all filters
              </Button>
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
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1.5px solid var(--text-primary)' : '1.5px solid var(--border-default)',
                      backgroundColor: active ? 'var(--text-primary)' : 'var(--bg-surface)',
                      color: active ? 'var(--bg-app)' : 'var(--text-primary)',
                      boxShadow: active ? '0 3px 0 rgba(0,0,0,0.25)' : '0 2px 0 var(--border-default)',
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
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
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
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '16px',
                border: '1.5px solid var(--border-default)',
                boxShadow: '0 2px 0 var(--border-default)'
              }}
            >
              <Icon name="search" size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                No projects match your filter
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 16px' }}>
                Try adjusting your search query or selecting a different difficulty level.
              </p>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Reset filter
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
