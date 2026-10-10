import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { fireCelebrationConfetti } from '../utils/confetti';
import { useApp } from '../context/AppContext';
import { COURSES } from '../data/courses';
import { codeExecutionService } from '../services/codeExecutionService';
import { sound } from '../utils/audio';
import { ExecutionResult, Challenge } from '../types';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface LessonViewProps {
  lessonId?: string;
}

export const LessonView: React.FC<LessonViewProps> = ({ lessonId = 'py_lesson_3' }) => {
  const { navigateTo, completeLesson, recordMistake, theme } = useApp();

  // Find target lesson
  let targetLesson = COURSES[0].modules[0].lessons[0];
  for (const course of COURSES) {
    for (const mod of course.modules) {
      const found = mod.lessons.find(l => l.id === lessonId);
      if (found) {
        targetLesson = found;
        break;
      }
    }
  }

  const challenge: Challenge = (targetLesson.challenges && targetLesson.challenges[0]) || COURSES[0].modules[0].lessons[0].challenges![0];

  const [code, setCode] = useState<string>(challenge.starterCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'tests'>('console');

  // Reset state when lesson changes
  useEffect(() => {
    setCode(challenge.starterCode);
    setExecutionResult(null);
    setShowHint(false);
    setShowSuccessModal(false);
  }, [lessonId, challenge.starterCode]);

  // Handle keyboard shortcut: Cmd+Enter or Ctrl+Enter to run code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, challenge]);

  const handleRunCode = async () => {
    setIsRunning(true);
    sound.playClick();

    const result = await codeExecutionService.execute(code, challenge);
    setExecutionResult(result);
    setIsRunning(false);

    if (result.success) {
      sound.playSuccess();
      completeLesson(targetLesson.id, targetLesson.xpReward);

      // Trigger celebration confetti
      try {
        fireCelebrationConfetti({
          particleCount: 90,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }

      setShowSuccessModal(true);
    } else {
      sound.playError();
      // Record failed submission to the Mistake Bank
      if (result.diagnostic) {
        recordMistake({
          challengeId: challenge.id,
          lessonId: targetLesson.id,
          lessonTitle: targetLesson.title,
          conceptId: challenge.conceptId,
          conceptName: targetLesson.title,
          mistakeType: result.diagnostic.mistakeType,
          explanation: result.diagnostic.message,
          userCode: code
        });
      }
    }
  };

  const handleResetCode = () => {
    sound.playClick();
    setCode(challenge.starterCode);
    setExecutionResult(null);
  };

  // Find next lesson
  const allLessons = COURSES[0].modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === targetLesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Lesson Header Navigation */}
      <header
        style={{
          height: '56px',
          borderBottom: '1px solid var(--border-default)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigateTo('/app/course/python')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-app)',
            }}
            className="hover-elevate"
          >
            <Icon name="arrow-left" size={16} stroke={3} />
            <span>Course Syllabus</span>
          </button>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="python" size="sm"><Icon name="brand-python" size={14} style={{ marginRight: 4 }} /> Python</Badge>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {targetLesson.title}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#D97706', fontWeight: 800, backgroundColor: '#FEF3C7', padding: '4px 10px', borderRadius: '6px' }}>
            <Icon name="sparkles" size={14} fill="#FDE68A" />
            <span>+{targetLesson.xpReward} XP</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetCode}
            icon={<Icon name="history" size={13} />}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunCode}
            isLoading={isRunning}
            icon={<Icon name="player-play" size={13} fill="#fff" />}
          >
            Run Code <span style={{ opacity: 0.7, fontSize: '0.75rem', marginLeft: '4px', fontWeight: 700 }} className="desktop-only">⌘↵</span>
          </Button>
        </div>
      </header>

      {/* Main Split Screen */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }} className="lesson-split-container">
        {/* Left Instruction & Concept Pane */}
        <div
          style={{
            flex: 1,
            maxWidth: '540px',
            borderRight: '1px solid var(--border-default)',
            overflowY: 'auto',
            padding: '28px 28px 48px',
            backgroundColor: 'var(--bg-app)'
          }}
          className="lesson-instructions-pane"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Badge variant="neutral" size="sm">Exercise 1 of 1</Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Est. {targetLesson.estimatedMinutes} mins
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {challenge.title}
          </h1>

          {/* Formatted Markdown Content */}
          <div
            style={{
              fontSize: '0.9375rem',
              lineHeight: 1.65,
              color: 'var(--text-primary)',
              marginBottom: '24px'
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {challenge.instructionMarkdown}
              </div>
            </div>

            {/* Code example block if present */}
            {challenge.codeSnippetExample && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Syntax Blueprint
                </div>
                <pre
                  style={{
                    backgroundColor: '#1E1E1E',
                    color: '#9CDCFE',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    overflowX: 'auto'
                  }}
                >
                  {challenge.codeSnippetExample}
                </pre>
              </div>
            )}
          </div>

          {/* Hint Accordion */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              padding: '12px 16px',
              marginBottom: '24px'
            }}
          >
            <button
              onClick={() => setShowHint(!showHint)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                fontWeight: 600,
                fontSize: '0.84rem',
                color: showHint ? 'var(--brand-primary)' : 'var(--text-secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="bulb" size={16} fill="#FDE68A" style={{ color: '#F59E0B' }} />
                <span>Need a hint?</span>
              </div>
              <span style={{ fontSize: '0.75rem' }}>{showHint ? 'Hide' : 'Reveal'}</span>
            </button>
            {showHint && (
              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)'
                }}
                className="animate-fade-in"
              >
                💡 {challenge.hint}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Output Runner */}
        <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', minWidth: 0 }}>
          {/* Monaco Editor Pane */}
          <div style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
            <div
              style={{
                height: '36px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid var(--border-default)',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="code" size={16} style={{ color: 'var(--brand-primary)' }} stroke={2.5} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  solution.py
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Press ⌘+Enter to Run
              </span>
            </div>

            <div style={{ height: 'calc(100% - 36px)' }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(val) => setCode(val || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  padding: { top: 14, bottom: 14 },
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>

          {/* Bottom Output & Test Runner Drawer */}
          <div
            style={{
              height: '240px',
              borderTop: '1px solid var(--border-default)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Tabs */}
            <div
              style={{
                height: '38px',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                backgroundColor: 'var(--bg-app)',
                gap: '16px'
              }}
            >
              <button
                onClick={() => setActiveTab('console')}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: activeTab === 'console' ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'console' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="terminal-2" size={16} />
                <span>Console Output</span>
              </button>

              <button
                onClick={() => setActiveTab('tests')}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: activeTab === 'tests' ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'tests' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="check" size={16} stroke={3} />
                <span>Test Cases {executionResult && `(${executionResult.testResults.filter(t => t.passed).length}/${challenge.tests.length})`}</span>
              </button>

              {executionResult && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {executionResult.executionTimeMs}ms
                  </span>
                  <Badge variant={executionResult.success ? 'success' : 'error'} size="sm">
                    {executionResult.success ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Output Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#FAFAFA' }}>
              {activeTab === 'console' ? (
                <div>
                  {executionResult ? (
                    <div>
                      {executionResult.stdout ? (
                        <pre
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.84rem',
                            color: '#111827',
                            margin: 0,
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {executionResult.stdout}
                        </pre>
                      ) : (
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          (No stdout output generated)
                        </span>
                      )}

                      {/* Diagnostic Coaching Feedback */}
                      {executionResult.diagnostic && (
                        <div
                          style={{
                            marginTop: '14px',
                            backgroundColor: executionResult.success ? 'var(--success-bg)' : '#FEF2F2',
                            border: `1px solid ${executionResult.success ? 'var(--success-border)' : '#FECACA'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 14px'
                          }}
                          className="animate-fade-in"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Icon name="alert-triangle" size={16} style={{ color: executionResult.success ? 'var(--success-solid)' : '#EF4444' }} stroke={2.5} />
                            <strong style={{ fontSize: '0.84rem', color: executionResult.success ? 'var(--success-text)' : '#991B1B' }}>
                              Diagnostic Advisor:
                            </strong>
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: executionResult.success ? 'var(--success-text)' : '#7F1D1D', margin: 0, lineHeight: 1.4 }}>
                            {executionResult.diagnostic.message}
                          </p>
                          {executionResult.diagnostic.fixSuggestion && (
                            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#991B1B', fontWeight: 600 }}>
                              💡 Suggestion: {executionResult.diagnostic.fixSuggestion}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                      Click "Run Code" or press ⌘+Enter to execute your Python script.
                    </div>
                  )}
                </div>
              ) : (
                /* Tests Tab */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {challenge.tests.map((test) => {
                    const testResult = executionResult?.testResults.find(t => t.testId === test.id);
                    const passed = testResult?.passed;

                    return (
                      <div
                        key={test.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {testResult ? (
                            passed ? (
                              <Icon name="check" size={20} stroke={3} style={{ color: 'var(--success-solid)' }} />
                            ) : (
                              <Icon name="x" size={20} stroke={3} style={{ color: 'var(--error-solid)' }} />
                            )
                          ) : (
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--border-default)' }} />
                          )}
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                            {test.description}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          Expected: {test.expectedOutput}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Celebration Drawer Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '2px solid var(--brand-primary)',
            padding: '24px 32px',
            boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
          className="animate-slide-up"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)'
              }}
            >
              <Icon name="check" size={32} stroke={3} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Challenge Solved!
                </h3>
                <Badge variant="brand" size="sm">+{targetLesson.xpReward} XP</Badge>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Great work! You wrote valid Python and verified all output specifications.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowSuccessModal(false)}
            >
              Review Code
            </Button>
            {nextLesson ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigateTo(`/app/lesson/${nextLesson.id}`)}
                icon={<Icon name="chevron-right" size={16} stroke={3} />}
                iconPosition="right"
              >
                Next Lesson: {nextLesson.title}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigateTo('/app')}
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
