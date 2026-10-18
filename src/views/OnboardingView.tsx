import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/ui/Icon';
import { ProgressBar } from '../components/common/ProgressBar';
import { sound } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { codeExecutionService } from '../services/codeExecutionService';
import { 
  placementDiagnosticService, 
  DiagnosticQuestion,
  PlacementEvaluationResult 
} from '../services/placementDiagnosticService';

export const OnboardingView: React.FC = () => {
  const { 
    course, 
    navigateTo, 
    startLesson, 
    updateProfile, 
    applyDiagnosticPlacementResult 
  } = useApp();

  // Screen 0: 30-Second First Win (Instant Live Sandbox)
  // Screen 1: Path Selection (Scratch vs Placement)
  // Screen 2: 5-Tier Misconception Placement Test
  // Screen 3: Placement Summary & Calibrated Starting Point
  const [screen, setScreen] = useState<0 | 1 | 2 | 3>(0);

  // Screen 0 State
  const [sandboxCode, setSandboxCode] = useState<string>('print("Hello, World!")');
  const [sandboxOutput, setSandboxOutput] = useState<string>('');
  const [isRunningSandbox, setIsRunningSandbox] = useState<boolean>(false);
  const [hasFirstWin, setHasFirstWin] = useState<boolean>(false);

  // Placement Test State
  const questions: DiagnosticQuestion[] = placementDiagnosticService.getQuestions();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluationResult, setEvaluationResult] = useState<PlacementEvaluationResult | null>(null);

  const handleRunSandbox = async () => {
    if (isRunningSandbox) return;
    setIsRunningSandbox(true);
    setSandboxOutput('Running code via Pyodide WebAssembly...');

    try {
      const res = await codeExecutionService.executeRaw(sandboxCode);
      const out = res.stdout || (res.error ? `Error: ${res.error}` : 'Code executed with no output.');
      setSandboxOutput(out);

      if (!res.error) {
        sound.playSuccess();
        fireCelebrationConfetti();
        setHasFirstWin(true);
      } else {
        sound.playError();
      }
    } catch (err: any) {
      setSandboxOutput(`Error: ${err?.message || 'Execution error'}`);
      sound.playError();
    } finally {
      setIsRunningSandbox(false);
    }
  };

  const handleStartFromScratch = () => {
    sound.playSuccess();
    try {
      localStorage.setItem('codolingo_coach_marks', 'true');
    } catch {}
    updateProfile({ hasCompletedOnboarding: true });
    startLesson('1.1');
  };

  const handleSelectOption = (questionId: number, optionId: string) => {
    sound.playClick();
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      sound.playClick();
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Evaluate 5-Tier Placement Test
      const result = placementDiagnosticService.evaluatePlacement(answers, course);
      setEvaluationResult(result);
      applyDiagnosticPlacementResult(result);
      sound.playSuccess();
      fireCelebrationConfetti();
      setScreen(3);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '36px 20px 60px',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Step Indicators */}
      <div style={{ width: '100%', maxWidth: '680px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '6px',
                flex: 1,
                backgroundColor: i <= screen ? 'var(--brand-primary)' : 'var(--border-default)',
                borderRadius: '3px',
                transition: 'background-color var(--transition-fast)'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '680px', flex: 1 }}>
        {/* ============================================================ */}
        {/* SCREEN 0: 30-Second First Win Live Sandbox                   */}
        {/* ============================================================ */}
        {screen === 0 && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Badge variant="brand" size="md">
                <Icon name="sparkles" size={14} style={{ marginRight: 6 }} />
                30-SECOND FIRST WIN
              </Badge>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '12px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Run Your First Line of Python Right Now
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 auto', maxWidth: '520px', lineHeight: 1.5 }}>
                Zero installation. Real client-side Python execution via WebAssembly. Press <strong>Run Code</strong> to witness live execution.
              </p>
            </div>

            {/* Interactive Code Tile */}
            <div
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 'var(--radius-xl)',
                border: '2px solid var(--border-default)',
                boxShadow: 'var(--tactile-card)',
                overflow: 'hidden',
                marginBottom: '20px'
              }}
            >
              {/* Terminal Title Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  backgroundColor: '#2D2D2D',
                  borderBottom: '1px solid #3E3E3E'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#A3A3A3', marginLeft: '6px' }}>
                    sandbox.py • Python 3.11
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  ● Pyodide Ready
                </span>
              </div>

              {/* Code Input */}
              <div style={{ padding: '16px' }}>
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    color: '#E0E7FF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.05rem',
                    lineHeight: 1.5,
                    border: 'none',
                    outline: 'none',
                    resize: 'none'
                  }}
                  aria-label="Interactive Python Sandbox"
                />
              </div>

              {/* Console Stdout Panel */}
              {sandboxOutput && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#111827',
                    borderTop: '1px solid #374151',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    color: '#10B981'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Standard Output:
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{sandboxOutput}</pre>
                </div>
              )}

              {/* Run Action Bar */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#252526',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRunSandbox}
                  disabled={isRunningSandbox}
                  icon={<Icon name="player-play" size={16} />}
                >
                  {isRunningSandbox ? 'Running...' : 'Run Code (Ctrl+Enter)'}
                </Button>
              </div>
            </div>

            {/* Victory Callout & Path Selection */}
            {hasFirstWin ? (
              <div
                className="animate-slide-up"
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '2px solid var(--state-success)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', color: 'var(--state-success)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={32} stroke={3} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>
                  🎉 Victory! You just executed real Python!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 auto 20px', maxWidth: '480px' }}>
                  That was client-side code execution in under 30 seconds. Now, choose your learning pathway:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', textAlign: 'left' }}>
                  <Card
                    variant="interactive"
                    padding="md"
                    onClick={handleStartFromScratch}
                    style={{ border: '2px solid var(--border-default)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🐣</span>
                      <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Start from Scratch</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Never coded before? Step-by-step foundation walkthrough starting with Lesson 1.1.
                    </p>
                  </Card>

                  <Card
                    variant="interactive"
                    padding="md"
                    onClick={() => {
                      sound.playClick();
                      setScreen(2);
                    }}
                    style={{ border: '2px solid var(--brand-primary)', backgroundColor: 'var(--brand-light)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.4rem' }}>⚡</span>
                      <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--brand-primary)' }}>Test My Level (2 mins)</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Already know some Python? Take the 5-tier diagnostic test to unlock higher units.
                    </p>
                  </Card>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    sound.playClick();
                    setScreen(2);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Already have coding experience? Skip directly to the Placement Test →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2: 5-Tier Misconception Placement Test                */}
        {/* ============================================================ */}
        {screen === 2 && (
          <div className="animate-fade-in">
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', boxShadow: 'var(--tactile-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <Badge variant="brand" size="sm">
                  <Icon name="target" size={13} style={{ marginRight: 4 }} />
                  TIER {questions[currentQuestionIndex].tier} DIAGNOSTIC
                </Badge>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <ProgressBar progress={((currentQuestionIndex + 1) / questions.length) * 100} height={6} />
              </div>

              {(() => {
                const q = questions[currentQuestionIndex];
                const selectedOptId = answers[q.id];

                return (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {q.conceptTitle}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.4 }}>
                      {q.question}
                    </h2>

                    {q.codeSnippet && (
                      <pre style={{ backgroundColor: '#1E1E1E', color: '#D4D4D4', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '20px', overflowX: 'auto', border: '1px solid #3E3E3E' }}>
                        <code>{q.codeSnippet}</code>
                      </pre>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      {q.options.map(opt => {
                        const isSelected = selectedOptId === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            style={{
                              padding: '14px 18px',
                              borderRadius: 'var(--radius-lg)',
                              backgroundColor: isSelected ? 'var(--brand-light)' : 'var(--bg-surface)',
                              border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)'
                            }}
                            className="hover-elevate"
                          >
                            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleStartFromScratch}
                      >
                        Start from Scratch Instead
                      </Button>

                      <Button
                        variant="primary"
                        size="md"
                        disabled={!selectedOptId}
                        onClick={handleNextQuestion}
                        icon={<Icon name="arrow-right" size={16} />}
                        iconPosition="right"
                      >
                        {currentQuestionIndex === questions.length - 1 ? 'Finish Placement' : 'Next Question'}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 3: Placement Summary & Calibrated Unlocks             */}
        {/* ============================================================ */}
        {screen === 3 && evaluationResult && (
          <div className="animate-fade-in" style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)', padding: '36px 28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', boxShadow: 'var(--tactile-card)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', color: 'var(--state-success)', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="trophy" size={38} stroke={2.5} />
            </div>

            <Badge variant="success" size="md">PLACEMENT CALIBRATED</Badge>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '12px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Placed into Unit {evaluationResult.targetUnitNumber}!
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 24px' }}>
              You answered <strong>{evaluationResult.correctCount} of {evaluationResult.totalQuestions}</strong> diagnostic challenges correctly.
              {evaluationResult.masteredSkillIds.length > 0 && (
                <> We unlocked <strong>{evaluationResult.masteredSkillIds.length} skills</strong> and awarded you <strong>+{evaluationResult.awardedXp} XP</strong>.</>
              )}
            </p>

            {/* Diagnosed Focus Areas */}
            {evaluationResult.diagnosedMisconceptions.length > 0 && (
              <div
                style={{
                  maxWidth: '520px',
                  margin: '0 auto 24px',
                  padding: '14px 18px',
                  backgroundColor: '#FEF3C7',
                  border: '1.5px solid #F59E0B',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Icon name="alert-circle" size={18} style={{ color: '#D97706' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#92400E' }}>
                    Focus Areas Logged to Fix-It Lab
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#B45309', lineHeight: 1.4 }}>
                  We identified opportunities to strengthen your mental models in: {evaluationResult.diagnosedMisconceptions.join(', ')}. Targeted drills are ready in your Mistake Bank.
                </p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigateTo('/app')}
              icon={<Icon name="player-play" size={18} />}
              iconPosition="right"
              style={{ minWidth: '240px' }}
            >
              Enter Learning Path
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
