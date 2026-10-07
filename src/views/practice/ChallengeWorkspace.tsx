import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { PracticeWorkspaceHeader } from './PracticeWorkspaceHeader';
import { DEFAULT_LANGUAGE, LanguageDefinition } from '../../types/languages';
import { PracticeChallengeItem } from '../../services/practiceChallengeService';
import { practiceStorageService } from '../../services/practiceStorageService';
import { codeExecutionService } from '../../services/codeExecutionService';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { Icon } from '../../components/ui/Icon';
import { ExecutionResult } from '../../types';

interface ChallengeWorkspaceProps {
  challenge: PracticeChallengeItem;
  onBack: () => void;
  onNextChallenge?: () => void;
}

export const ChallengeWorkspace: React.FC<ChallengeWorkspaceProps> = ({
  challenge,
  onBack,
  onNextChallenge
}) => {
  const { recordMistake } = useApp();
  const [selectedLanguage] = useState<LanguageDefinition>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState<string>(() => {
    return practiceStorageService.getChallengeCode(challenge.id, challenge.starterCode);
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'hints'>('problem');
  const [isPassed, setIsPassed] = useState<boolean>(() => {
    return practiceStorageService.isChallengeCompleted(challenge.id);
  });
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(440);
  const [resultsHeight, setResultsHeight] = useState<number>(230);
  const [bottomTab, setBottomTab] = useState<'tests' | 'stdout' | 'diagnostic'>('tests');

  // Resizing references
  const isDraggingHorizontalRef = useRef<boolean>(false);
  const isDraggingVerticalRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startWidthRef = useRef<number>(440);
  const startHeightRef = useRef<number>(230);
  const editorRef = useRef<any>(null);

  // Debounced Autosave per challenge (600ms)
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      practiceStorageService.saveChallengeCode(challenge.id, code);
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [code, challenge.id]);

  // Handle Horizontal & Vertical Drag Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHorizontalRef.current) {
        const deltaX = e.clientX - startXRef.current;
        const newWidth = Math.max(300, Math.min(window.innerWidth - 450, startWidthRef.current + deltaX));
        setLeftPanelWidth(newWidth);
      } else if (isDraggingVerticalRef.current) {
        const deltaY = startYRef.current - e.clientY;
        const newHeight = Math.max(120, Math.min(window.innerHeight - 200, startHeightRef.current + deltaY));
        setResultsHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isDraggingHorizontalRef.current = false;
      isDraggingVerticalRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeHorizontalStart = (e: React.MouseEvent) => {
    isDraggingHorizontalRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = leftPanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeVerticalStart = (e: React.MouseEvent) => {
    isDraggingVerticalRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = resultsHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRunAndValidate = async () => {
    if (isRunning) return;
    sound.playClick();
    setIsRunning(true);
    setHasRun(true);

    try {
      const res = await codeExecutionService.execute(code, challenge);
      setExecutionResult(res);

      if (res.success) {
        setIsPassed(true);
        practiceStorageService.setChallengeCompleted(challenge.id, true);
        sound.playSuccess();
        try {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else {
        sound.playError();
        // Switch to diagnostic tab if diagnostic rule triggered
        if (res.diagnostic) {
          setBottomTab('diagnostic');
        } else {
          setBottomTab('tests');
        }

        // Record mistake in AppContext / Mistake Bank if diagnostic or failed
        recordMistake({
          skillId: challenge.skillId || `py_skill_${challenge.lessonId.replace('.', '_')}`,
          skillTitle: challenge.topic,
          challengeId: challenge.id,
          lessonId: challenge.lessonId,
          lessonTitle: challenge.lessonTitle,
          conceptId: challenge.conceptId,
          conceptName: challenge.topic,
          mistakeType: res.diagnostic?.mistakeType || (challenge.diagnosticRules?.[0]?.mistakeType) || 'challenge_test_failure',
          explanation: res.diagnostic?.message || (res.error ? `Runtime error: ${res.error}` : 'Challenge test cases failed validation.'),
          userCode: code
        });
      }
    } catch (err: any) {
      sound.playError();
      const fallbackResult: ExecutionResult = {
        success: false,
        stdout: '',
        error: err?.message || 'Execution failed',
        testResults: (challenge.tests || []).map(t => ({
          testId: t.id,
          description: t.description,
          passed: false,
          actualOutput: '',
          expectedOutput: t.isHidden ? '' : t.expectedOutput,
          error: err?.message || 'Execution error'
        })),
        executionTimeMs: 0
      };
      setExecutionResult(fallbackResult);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunAndValidate();
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset code to initial challenge starter code?')) {
      sound.playClick();
      setCode(challenge.starterCode);
      practiceStorageService.resetChallengeCode(challenge.id, challenge.starterCode);
      setExecutionResult(null);
      setHasRun(false);
    }
  };

  const getDifficultyBadgeColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { bg: '#1C3326', text: '#7EE787', border: '#238636' };
      case 'medium':
        return { bg: '#342817', text: '#F0883E', border: '#9E6A03' };
      case 'hard':
        return { bg: '#351F28', text: '#FF7B72', border: '#DA3633' };
      default:
        return { bg: '#1C2128', text: '#ADBAC7', border: '#2D333B' };
    }
  };

  const badgeStyle = getDifficultyBadgeColor(challenge.difficulty);

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: '#0D1117',
        color: '#C9D1D9',
        overflow: 'hidden'
      }}
    >
      {/* Workspace Header */}
      <PracticeWorkspaceHeader
        title={challenge.title}
        subtitle={`${challenge.topic} • ${challenge.difficulty.toUpperCase()}`}
        backLabel="Challenges"
        onBack={onBack}
        selectedLanguage={selectedLanguage}
        saveStatus={saveStatus}
        rightExtra={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#21262D',
                border: '1px solid #30363D',
                borderRadius: '8px',
                color: '#C9D1D9',
                padding: '6px 13px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 120ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#30363D';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#21262D';
                e.currentTarget.style.color = '#C9D1D9';
              }}
              title="Reset code to starter snippet"
            >
              <Icon name="refresh" size={14} />
              <span>Reset</span>
            </button>

            {challenge.solutionCode && (
              <button
                onClick={() => setShowSolutionModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#21262D',
                  border: '1px solid #30363D',
                  borderRadius: '8px',
                  color: '#8B949E',
                  padding: '6px 12px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F0F6FC';
                  e.currentTarget.style.borderColor = '#58A6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8B949E';
                  e.currentTarget.style.borderColor = '#30363D';
                }}
                title="View reference solution"
              >
                <Icon name="bulb" size={14} />
                <span>Solution</span>
              </button>
            )}

            {isPassed && onNextChallenge && (
              <button
                onClick={onNextChallenge}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#21262D',
                  border: '1px solid #388BFD',
                  borderRadius: '8px',
                  color: '#58A6FF',
                  padding: '6px 13px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1F6FEB';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#21262D';
                  e.currentTarget.style.color = '#58A6FF';
                }}
                title="Advance to next practice challenge"
              >
                <span>Next Challenge</span>
                <Icon name="arrow-right" size={14} />
              </button>
            )}

            <button
              onClick={handleRunAndValidate}
              disabled={isRunning}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isPassed ? '#238636' : '#1F6FEB',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
                padding: '6px 18px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                boxShadow: isPassed ? '0 0 12px rgba(46, 160, 67, 0.4)' : '0 0 12px rgba(31, 111, 235, 0.35)',
                opacity: isRunning ? 0.8 : 1,
                transition: 'all 120ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isRunning) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!isRunning) e.currentTarget.style.opacity = '1';
              }}
              title="Run & Test Solution (Ctrl + Enter)"
            >
              {isRunning ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: '2px solid #FFFFFF',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  <span>Testing...</span>
                </>
              ) : isPassed ? (
                <>
                  <Icon name="check" size={15} stroke={2.5} />
                  <span>Submit / Pass</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
                    (Ctrl+Enter)
                  </span>
                </>
              ) : (
                <>
                  <Icon name="player-play" size={15} />
                  <span>Run & Test</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
                    (Ctrl+Enter)
                  </span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Main Workspace Split (Problem Statement vs Editor & Results) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Side: Problem Statement & Hints */}
        <div
          style={{
            width: `${leftPanelWidth}px`,
            minWidth: '280px',
            backgroundColor: '#0D1117',
            borderRight: '1px solid #21262D',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Tab Navigation (Problem vs Hints) */}
          <div
            style={{
              height: '36px',
              backgroundColor: '#161B22',
              borderBottom: '1px solid #21262D',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: '6px'
            }}
          >
            <button
              onClick={() => setActiveTab('problem')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: activeTab === 'problem' ? '#21262D' : 'transparent',
                border: 'none',
                color: activeTab === 'problem' ? '#F0F6FC' : '#8B949E',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Icon name="book" size={14} />
              <span>Description</span>
            </button>

            {challenge.hints && challenge.hints.length > 0 && (
              <button
                onClick={() => setActiveTab('hints')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'hints' ? '#21262D' : 'transparent',
                  border: 'none',
                  color: activeTab === 'hints' ? '#F0F6FC' : '#8B949E',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Icon name="bulb" size={14} />
                <span>Hints ({challenge.hints.length})</span>
              </button>
            )}
          </div>

          {/* Tab Body */}
          <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto', lineHeight: 1.6 }}>
            {activeTab === 'problem' ? (
              <div className="animate-fade-in">
                {/* Meta header pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: badgeStyle.bg,
                      color: badgeStyle.text,
                      border: `1px solid ${badgeStyle.border}`
                    }}
                  >
                    {challenge.difficulty.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                    {challenge.lessonTitle}
                  </span>
                  {isPassed && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#7EE787',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon name="check" size={13} stroke={3} /> Solved
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F0F6FC', margin: '0 0 14px', lineHeight: 1.3 }}>
                  {challenge.title}
                </h2>

                {/* Markdown prompt */}
                <div
                  style={{
                    color: '#C9D1D9',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-sans, system-ui)'
                  }}
                >
                  {challenge.description}
                </div>

                {/* Target Expected Output preview if present */}
                {challenge.expectedOutput && (
                  <div style={{ marginTop: '20px' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#8B949E',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Target Output
                    </div>
                    <div
                      style={{
                        backgroundColor: '#161B22',
                        border: '1px solid #21262D',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.82rem',
                        color: '#7EE787',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {challenge.expectedOutput}
                    </div>
                  </div>
                )}

                {/* Test cases list preview */}
                <div style={{ marginTop: '22px' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#8B949E',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Test Suite ({challenge.tests.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {challenge.tests.map((test, idx) => (
                      <div
                        key={test.id || idx}
                        style={{
                          backgroundColor: '#161B22',
                          border: '1px solid #21262D',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Icon name="circle-dot" size={13} style={{ color: '#58A6FF' }} />
                        <span style={{ color: '#F0F6FC' }}>{test.description}</span>
                        {test.isHidden && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              fontSize: '0.68rem',
                              color: '#8B949E',
                              backgroundColor: '#21262D',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F0F6FC', margin: '0 0 6px' }}>
                  Guided Hints
                </h3>
                {challenge.hints?.map((hint, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#161B22',
                      border: '1px solid #21262D',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '0.85rem',
                      color: '#C9D1D9',
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: '#21262D',
                        color: '#58A6FF',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div style={{ whiteSpace: 'pre-wrap', fontFamily: hint.includes('\n') || hint.includes('print') ? 'var(--font-mono, monospace)' : 'inherit' }}>
                      {hint}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Resize Bar */}
        <div
          onMouseDown={handleResizeHorizontalStart}
          style={{
            width: '4px',
            cursor: 'col-resize',
            backgroundColor: '#21262D',
            transition: 'background-color 120ms ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#58A6FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#21262D'; }}
          title="Drag to resize panel"
        />

        {/* Right Side: Monaco Code Editor & Real-time Test Execution Console */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            backgroundColor: '#0D1117'
          }}
        >
          {/* Top Code Panel */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '180px',
              position: 'relative'
            }}
          >
            {/* Editor File Tab */}
            <div
              style={{
                height: '36px',
                backgroundColor: '#161B22',
                borderBottom: '1px solid #21262D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#0D1117',
                    borderTop: '2px solid #58A6FF',
                    borderRight: '1px solid #21262D',
                    borderLeft: '1px solid #21262D',
                    padding: '6px 14px',
                    fontSize: '0.8125rem',
                    color: '#F0F6FC',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600
                  }}
                >
                  <Icon name="brand-python" size={14} style={{ color: '#58A6FF' }} />
                  <span>solution.py</span>
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#8B949E', fontFamily: 'var(--font-mono, monospace)' }}>
                Python 3 • Monaco
              </span>
            </div>

            {/* Monaco Component */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <Editor
                height="100%"
                language={selectedLanguage.monacoLanguage}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  padding: { top: 12, bottom: 12 },
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true }
                }}
              />
            </div>
          </div>

          {/* Vertical Resize Bar for Results */}
          <div
            onMouseDown={handleResizeVerticalStart}
            style={{
              height: '4px',
              cursor: 'row-resize',
              backgroundColor: '#21262D',
              transition: 'background-color 120ms ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#58A6FF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#21262D'; }}
            title="Drag to resize test results"
          />

          {/* Bottom Test Results & Output Panel */}
          <div
            style={{
              height: `${resultsHeight}px`,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '120px',
              backgroundColor: '#090D13'
            }}
          >
            {/* Results Tab Navigation Header */}
            <div
              style={{
                height: '36px',
                backgroundColor: '#161B22',
                borderBottom: '1px solid #21262D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setBottomTab('tests')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: bottomTab === 'tests' ? '#21262D' : 'transparent',
                    border: 'none',
                    color: bottomTab === 'tests' ? '#F0F6FC' : '#8B949E',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icon name="list-check" size={14} />
                  <span>Test Cases</span>
                  {executionResult && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: executionResult.success ? '#1C3326' : '#351F28',
                        color: executionResult.success ? '#7EE787' : '#FF7B72'
                      }}
                    >
                      {executionResult.testResults.filter(t => t.passed).length}/{executionResult.testResults.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setBottomTab('stdout')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: bottomTab === 'stdout' ? '#21262D' : 'transparent',
                    border: 'none',
                    color: bottomTab === 'stdout' ? '#F0F6FC' : '#8B949E',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icon name="terminal" size={14} />
                  <span>Stdout</span>
                </button>

                {executionResult?.diagnostic && (
                  <button
                    onClick={() => setBottomTab('diagnostic')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: bottomTab === 'diagnostic' ? '#2B1D11' : 'transparent',
                      border: 'none',
                      color: '#F0883E',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Icon name="alert-triangle" size={14} />
                    <span>Diagnostic</span>
                  </button>
                )}
              </div>

              {executionResult?.executionTimeMs !== undefined && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#8B949E',
                    backgroundColor: '#21262D',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                >
                  {executionResult.executionTimeMs}ms
                </span>
              )}
            </div>

            {/* Results Tab Content */}
            <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto' }}>
              {!hasRun ? (
                <div style={{ color: '#484F58', fontSize: '0.8125rem', fontStyle: 'italic', fontFamily: 'var(--font-mono, monospace)' }}>
                  {`# Press 'Run & Test' (Ctrl+Enter) to evaluate your Python solution against all test assertions.`}
                </div>
              ) : (
                <>
                  {/* TAB 1: Test Cases View */}
                  {bottomTab === 'tests' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {executionResult?.testResults.map((tr, idx) => {
                        const originalTest = challenge.tests.find(t => t.id === tr.testId) || challenge.tests[idx];
                        const isHidden = originalTest?.isHidden || false;

                        return (
                          <div
                            key={tr.testId || idx}
                            style={{
                              backgroundColor: tr.passed ? '#0E1D16' : '#211216',
                              border: `1px solid ${tr.passed ? '#238636' : '#DA3633'}`,
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '0.8125rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tr.passed ? '0' : '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon
                                  name={tr.passed ? 'check' : 'x'}
                                  size={15}
                                  stroke={2.5}
                                  style={{ color: tr.passed ? '#7EE787' : '#FF7B72' }}
                                />
                                <span style={{ color: '#F0F6FC', fontWeight: 600 }}>
                                  {tr.description || `Test Case ${idx + 1}`}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: tr.passed ? '#7EE787' : '#FF7B72',
                                  fontFamily: 'var(--font-mono, monospace)'
                                }}
                              >
                                {tr.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>

                            {/* Detailed failure view (strictly hiding hidden test outputs) */}
                            {!tr.passed && (
                              <div
                                style={{
                                  marginTop: '4px',
                                  paddingTop: '4px',
                                  borderTop: '1px solid rgba(255,255,255,0.05)',
                                  fontSize: '0.78rem',
                                  fontFamily: 'var(--font-mono, monospace)',
                                  color: '#C9D1D9'
                                }}
                              >
                                {isHidden ? (
                                  <div style={{ color: '#F0883E' }}>
                                    🔒 Hidden test failed. Expected output is protected.
                                  </div>
                                ) : (
                                  <div>
                                    {tr.error && (
                                      <div style={{ color: '#FF7B72', marginBottom: '2px' }}>
                                        {tr.error}
                                      </div>
                                    )}
                                    {tr.expectedOutput && (
                                      <div>
                                        <span style={{ color: '#8B949E' }}>Expected: </span>
                                        <span style={{ color: '#7EE787' }}>{tr.expectedOutput}</span>
                                      </div>
                                    )}
                                    {tr.actualOutput && (
                                      <div>
                                        <span style={{ color: '#8B949E' }}>Received: </span>
                                        <span style={{ color: '#FF7B72' }}>{tr.actualOutput}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 2: Stdout / Errors View */}
                  {bottomTab === 'stdout' && (
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
                      {executionResult?.error && (
                        <div style={{ color: '#FF7B72', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                          {executionResult.error}
                        </div>
                      )}
                      {executionResult?.stdout ? (
                        <div style={{ color: '#7EE787', whiteSpace: 'pre-wrap' }}>
                          {executionResult.stdout}
                        </div>
                      ) : (
                        <div style={{ color: '#8B949E', fontStyle: 'italic' }}>
                          (Program finished with no printed stdout output)
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Diagnostic View */}
                  {bottomTab === 'diagnostic' && executionResult?.diagnostic && (
                    <div
                      style={{
                        backgroundColor: '#2B1D11',
                        border: '1px solid #D29922',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ color: '#F0883E', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="alert-triangle" size={15} />
                        <span>Diagnostic: {executionResult.diagnostic.mistakeType.replace(/_/g, ' ')}</span>
                      </div>
                      <div style={{ color: '#E6EDF3', marginBottom: executionResult.diagnostic.fixSuggestion ? '6px' : '0' }}>
                        {executionResult.diagnostic.message}
                      </div>
                      {executionResult.diagnostic.fixSuggestion && (
                        <div style={{ color: '#7EE787', fontSize: '0.8125rem' }}>
                          💡 Suggestion: {executionResult.diagnostic.fixSuggestion}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reference Solution Modal */}
      {showSolutionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setShowSolutionModal(false)}
        >
          <div
            style={{
              backgroundColor: '#161B22',
              border: '1px solid #30363D',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              color: '#F0F6FC'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="bulb" size={18} style={{ color: '#E3B341' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Reference Solution</h3>
              </div>
              <button
                onClick={() => setShowSolutionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8B949E',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#0D1117',
                border: '1px solid #21262D',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.875rem',
                color: '#7EE787',
                whiteSpace: 'pre-wrap',
                marginBottom: '20px'
              }}
            >
              {challenge.solutionCode}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowSolutionModal(false)}
                style={{
                  backgroundColor: '#21262D',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#C9D1D9',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
