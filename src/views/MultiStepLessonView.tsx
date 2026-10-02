import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Lesson, LessonStep } from '../types';
import { codeExecutionService } from '../services/codeExecutionService';
import { sound } from '../utils/audio';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

interface MultiStepLessonViewProps {
  lessonId: string;
}

export const MultiStepLessonView: React.FC<MultiStepLessonViewProps> = ({ lessonId }) => {
  const { course, exitLesson, completeLesson, recordMistake } = useApp();

  // Find target lesson
  let lesson: Lesson | null = null;
  for (const unit of course.units) {
    for (const skill of unit.skills) {
      const l = skill.lessons.find(item => item.id === lessonId);
      if (l) {
        lesson = l;
        break;
      }
    }
  }

  // Fallback if not found
  if (!lesson) {
    lesson = course.units[0].skills[1].lessons[0];
  }

  const steps = lesson.steps || [];
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep: LessonStep = steps[currentStepIndex] || {
    id: 'default',
    type: 'learn',
    title: 'Lesson Introduction'
  };

  // Predict step state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [predictSubmitted, setPredictSubmitted] = useState<boolean>(false);

  // Write/Apply step state
  const [code, setCode] = useState<string>(currentStep.starterCode || '');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    stdout: string;
    error?: string;
    diagnostic?: { message: string; fixSuggestion?: string };
  } | null>(null);

  // Lesson celebration state
  const [lessonCompleted, setLessonCompleted] = useState<boolean>(false);

  // Reset local state on step change
  useEffect(() => {
    setSelectedOptionId(null);
    setPredictSubmitted(false);
    setCode(currentStep.starterCode || '');
    setExecutionResult(null);
  }, [currentStepIndex, currentStep]);

  const handlePredictSelect = (optionId: string) => {
    if (predictSubmitted) return;
    sound.playClick();
    setSelectedOptionId(optionId);
    setPredictSubmitted(true);

    const chosen = currentStep.predictOptions?.find(o => o.id === optionId);
    if (chosen?.isCorrect) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  const handleRunCode = async () => {
    if (!currentStep.tests) return;
    setIsRunning(true);
    sound.playClick();

    // Map current step into challenge format
    const mockChallenge = {
      id: currentStep.id,
      lessonId: lesson.id,
      conceptId: 'py_variables',
      title: currentStep.title,
      instructionMarkdown: currentStep.prompt || '',
      starterCode: currentStep.starterCode || '',
      solutionCode: currentStep.solutionCode || '',
      hint: currentStep.hint || '',
      type: 'code' as const,
      tests: currentStep.tests,
      diagnosticRules: currentStep.diagnosticRules
    };

    const res = await codeExecutionService.execute(code, mockChallenge);
    setIsRunning(false);
    setExecutionResult(res);

    if (res.success) {
      sound.playSuccess();
    } else {
      sound.playError();
      if (res.diagnostic) {
        recordMistake({
          skillId: lesson.skillId,
          skillTitle: 'Variables',
          lessonId: lesson.id,
          mistakeType: res.diagnostic.mistakeType || 'code_error',
          explanation: res.diagnostic.message,
          userCode: code
        });
      }
    }
  };

  const handleNextStep = () => {
    sound.playClick();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete entire lesson!
      sound.playSuccess();
      completeLesson(lesson.id, lesson.xpReward);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
      setLessonCompleted(true);
    }
  };

  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  // If entire lesson is finished, show completion screen
  if (lessonCompleted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}
        className="animate-pop-in"
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
          }}
        >
          <Icon name="award" size={46} stroke={2.5} />
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Lesson Mastered!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', marginBottom: '28px' }}>
          You wrote real code, inspected memory variables, and passed all tests.
        </p>

        {/* Reward Pills */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '36px' }}>
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#FEF3C7',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              color: '#B45309'
            }}
          >
            <Icon name="sparkles" size={18} fill="#FDE68A" />
            <span>+{lesson.xpReward} XP</span>
          </div>

          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#ECFDF5',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              color: '#065F46'
            }}
          >
            <Icon name="check" size={20} stroke={3} />
            <span>Mastery +1 Level</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={exitLesson}
          icon={<Icon name="arrow-right" size={18} stroke={3} />}
          iconPosition="right"
        >
          Return to Learning Path
        </Button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Top Header & Step Progress Bar */}
      <header
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-default)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <button
          onClick={exitLesson}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.84rem'
          }}
        >
          <Icon name="arrow-left" size={16} stroke={2.5} />
          <span>Exit Path</span>
        </button>

        {/* Center Progress Bar */}
        <div style={{ flex: 1, maxWidth: '440px', margin: '0 24px' }}>
          <ProgressBar progress={progressPercentage} height={8} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="brand" size="sm">
            Step {currentStepIndex + 1} of {steps.length}
          </Badge>
        </div>
      </header>

      {/* Main Step Interaction Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 20px 100px' }}>
        <div style={{ maxWidth: '780px', width: '100%' }}>
          {/* Step Subtitle & Title */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--brand-primary)' }}>
              {currentStep.subtitle || 'Step-by-Step Mastery'}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {currentStep.title}
            </h1>
          </div>

          {/* STEP TYPE 1: LEARN */}
          {currentStep.type === 'learn' && (
            <div className="animate-fade-in">
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-default)',
                  padding: '28px',
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  marginBottom: '32px'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {currentStep.contentMarkdown}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNextStep}
                  icon={<Icon name="chevron-right" size={18} stroke={3} />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP TYPE 2: SEE */}
          {currentStep.type === 'see' && (
            <div className="animate-fade-in">
              <div
                style={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  marginBottom: '20px',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-mono)', marginLeft: '6px' }}>
                    syntax_breakdown.py
                  </span>
                </div>
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.05rem',
                    color: '#9CDCFE',
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  {currentStep.codeSnippet}
                </pre>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  padding: '20px 24px',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  marginBottom: '32px'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {currentStep.contentMarkdown}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNextStep}
                  icon={<Icon name="chevron-right" size={18} stroke={3} />}
                  iconPosition="right"
                >
                  I Understand, Next
                </Button>
              </div>
            </div>
          )}

          {/* STEP TYPE 3: PREDICT */}
          {currentStep.type === 'predict' && (
            <div className="animate-fade-in">
              <div
                style={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 22px',
                  marginBottom: '20px'
                }}
              >
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.05rem',
                    color: '#9CDCFE',
                    margin: 0,
                    lineHeight: 1.5
                  }}
                >
                  {currentStep.predictCode}
                </pre>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                {currentStep.predictQuestion}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {currentStep.predictOptions?.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let borderCol = 'var(--border-default)';
                  let bgCol = '#FFFFFF';

                  if (predictSubmitted && isSelected) {
                    borderCol = opt.isCorrect ? 'var(--brand-primary)' : '#EF4444';
                    bgCol = opt.isCorrect ? 'var(--brand-light)' : '#FEF2F2';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePredictSelect(opt.id)}
                      disabled={predictSubmitted}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${borderCol}`,
                        backgroundColor: bgCol,
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: predictSubmitted ? 'default' : 'pointer',
                        transition: 'all 150ms'
                      }}
                      className={!predictSubmitted ? 'hover-elevate' : ''}
                    >
                      <span>{opt.text}</span>
                      {predictSubmitted && isSelected && (
                        opt.isCorrect ? (
                          <Icon name="check" size={20} stroke={3} style={{ color: 'var(--brand-primary)' }} />
                        ) : (
                          <Icon name="x" size={20} stroke={3} style={{ color: '#EF4444' }} />
                        )
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Rationale feedback */}
              {predictSubmitted && selectedOptionId && (
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: currentStep.predictOptions?.find(o => o.id === selectedOptionId)?.isCorrect
                      ? 'var(--brand-light)'
                      : '#FEF2F2',
                    border: `1px solid ${currentStep.predictOptions?.find(o => o.id === selectedOptionId)?.isCorrect ? 'var(--brand-border)' : '#FECACA'}`,
                    marginBottom: '28px'
                  }}
                  className="animate-fade-in"
                >
                  <p style={{ margin: 0, fontSize: '0.9rem', color: currentStep.predictOptions?.find(o => o.id === selectedOptionId)?.isCorrect ? 'var(--brand-text)' : '#991B1B', fontWeight: 500 }}>
                    {currentStep.predictOptions?.find(o => o.id === selectedOptionId)?.explanation}
                  </p>
                </div>
              )}

              {predictSubmitted && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNextStep}
                    icon={<Icon name="chevron-right" size={18} stroke={3} />}
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP TYPE 4, 5, 6: WRITE / APPLY / MASTERY (Monaco Editor Challenge) */}
          {(currentStep.type === 'write' || currentStep.type === 'apply' || currentStep.type === 'mastery') && (
            <div className="animate-fade-in">
              {/* Instructions Prompt */}
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  padding: '18px 22px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {currentStep.prompt}
                </div>
              </div>

              {/* Monaco Code Editor */}
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    height: '38px',
                    backgroundColor: '#F9FAFB',
                    borderBottom: '1px solid var(--border-default)',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="code" size={16} stroke={2.5} style={{ color: 'var(--brand-primary)' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      workspace.py
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Type your solution and click Run
                  </span>
                </div>

                <div style={{ height: '170px' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    theme="light"
                    options={{
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4
                    }}
                  />
                </div>

                {/* Output Console Strip */}
                {executionResult && (
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: executionResult.success ? '#ECFDF5' : '#FEF2F2',
                      borderTop: `1px solid ${executionResult.success ? '#A7F3D0' : '#FECACA'}`
                    }}
                    className="animate-fade-in"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {executionResult.success ? (
                        <Icon name="check" size={20} stroke={3} style={{ color: 'var(--brand-primary)' }} />
                      ) : (
                        <Icon name="x" size={20} stroke={3} style={{ color: '#EF4444' }} />
                      )}
                      <strong style={{ fontSize: '0.84rem', color: executionResult.success ? '#065F46' : '#991B1B' }}>
                        {executionResult.success ? 'Execution Successful! Test Passed.' : 'Execution Feedback:'}
                      </strong>
                    </div>

                    {executionResult.stdout && (
                      <pre style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#111827' }}>
                        {executionResult.stdout}
                      </pre>
                    )}

                    {executionResult.diagnostic && (
                      <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: '#7F1D1D' }}>
                        {executionResult.diagnostic.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCode(currentStep.starterCode || '')}
                  icon={<Icon name="history" size={14} />}
                >
                  Reset
                </Button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleRunCode}
                    isLoading={isRunning}
                    icon={<Icon name="player-play" size={15} fill="#fff" />}
                  >
                    Run Code
                  </Button>

                  {executionResult?.success && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleNextStep}
                      icon={<Icon name="chevron-right" size={18} stroke={3} />}
                      iconPosition="right"
                      className="animate-pop-in"
                    >
                      Next Step
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
