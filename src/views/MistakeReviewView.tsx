import React, { useState, useMemo, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext';
import { MistakeRecord } from '../types';
import { sound } from '../utils/audio';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { codeExecutionService } from '../services/codeExecutionService';
import {
  ALL_REPAIR_DRILLS,
  getRepairDrillByTag,
  ConceptRepairDrill,
  RepairStep
} from '../curriculum/python/repair';
import { MisconceptionTag } from '../types/question';

export const MistakeReviewView: React.FC = () => {
  const { mistakes, resolveMistake, navigateTo, theme, currentRoute } = useApp();

  // Active repair drill state
  const [activeDrill, setActiveDrill] = useState<ConceptRepairDrill | null>(null);
  const [activeMistake, setActiveMistake] = useState<MistakeRecord | null>(null);
  const [activeSteps, setActiveSteps] = useState<[RepairStep, RepairStep, RepairStep, RepairStep] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Interaction states inside drill
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [optionSubmitted, setOptionSubmitted] = useState<boolean>(false);
  const [userCode, setUserCode] = useState<string>('');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ passed: boolean; message: string } | null>(null);
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(0);
  const [drillCompleted, setDrillCompleted] = useState<boolean>(false);

  // Check URL or route for deep link drill (?drill=<tag>)
  useEffect(() => {
    let drillParam: string | null = null;
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      drillParam = params.get('drill');
    }
    if (!drillParam && currentRoute.includes('drill=')) {
      const parts = currentRoute.split('drill=');
      if (parts[1]) {
        drillParam = decodeURIComponent(parts[1].split('&')[0]);
      }
    }

    if (drillParam) {
      const drill = getRepairDrillByTag(drillParam);
      if (drill) {
        startDrill(drill);
      }
    }
  }, [currentRoute]);

  // Compute status for each concept drill based on user's mistakes history
  const getConceptStatus = (tag: MisconceptionTag) => {
    const matching = mistakes.filter(m => m.mistakeType === tag);
    if (matching.length === 0) return { status: 'solid' as const, label: 'Solid', color: 'success' as const, unresolvedCount: 0 };
    const unresolved = matching.filter(m => !m.resolved);
    if (unresolved.length > 0) return { status: 'needs_repair' as const, label: 'Needs repair', color: 'warning' as const, unresolvedCount: unresolved.length };
    if (matching.length === 1) return { status: 'improving' as const, label: 'Improving', color: 'brand' as const, unresolvedCount: 0 };
    return { status: 'solid' as const, label: 'Solid', color: 'success' as const, unresolvedCount: 0 };
  };

  const startDrill = (drill: ConceptRepairDrill, mistake?: MistakeRecord) => {
    sound.playClick();
    const targetMistake = mistake || mistakes.find(m => m.mistakeType === drill.tag && !m.resolved) || mistakes.find(m => m.mistakeType === drill.tag);
    setActiveDrill(drill);
    setActiveMistake(targetMistake || null);
    const steps = drill.getSteps(targetMistake?.userCode);
    setActiveSteps(steps);
    setCurrentStepIndex(0);
    resetStepState(steps[0]);
    setDrillCompleted(false);
  };

  const resetStepState = (step: RepairStep) => {
    setSelectedOptionId(null);
    setOptionSubmitted(false);
    setUserCode(step.starterCode || '');
    setTerminalOutput('');
    setTestResult(null);
    setCurrentHintLevel(0);
  };

  const handleNextStep = () => {
    if (!activeSteps) return;
    if (currentStepIndex < activeSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      resetStepState(activeSteps[nextIndex]);
      sound.playClick();
    } else {
      // Completed all 4 steps!
      sound.playRepair();
      setDrillCompleted(true);
      if (activeMistake) {
        resolveMistake(activeMistake.id);
      }
    }
  };

  const handleRunCode = async () => {
    sound.playClick();
    setIsExecuting(true);
    setTerminalOutput('Executing Python via Pyodide...\n');
    try {
      const res = await codeExecutionService.executeRaw(userCode);
      if (res.error) {
        setTerminalOutput(`${res.error}\n`);
      } else {
        setTerminalOutput(res.stdout || '(Program completed with no terminal output)\n');
      }
    } catch (err) {
      setTerminalOutput(`Execution error: ${err}\n`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCheckCode = async (step: RepairStep) => {
    sound.playClick();
    setIsExecuting(true);
    try {
      const rawRes = await codeExecutionService.executeRaw(userCode);
      if (rawRes.error) {
        sound.playError();
        setTestResult({ passed: false, message: rawRes.error });
        setTerminalOutput(rawRes.error);
        setIsExecuting(false);
        return;
      }

      const out = (rawRes.stdout || '').trim();

      // Check expected output if defined on the step
      if (step.expectedOutput) {
        const expected = step.expectedOutput.trim();
        if (!out.includes(expected) && out !== expected) {
          sound.playError();
          setTestResult({
            passed: false,
            message: `Output mismatch. Expected: "${expected}", but got: "${out || '(no output)'}". Check hint if needed.`
          });
          setTerminalOutput(rawRes.stdout || '');
          setIsExecuting(false);
          return;
        }
      }

      // Check all test cases and Python assertion rules
      if (step.testCases && step.testCases.length > 0) {
        let allPassed = true;
        let failReason = '';

        for (const tc of step.testCases) {
          if (tc.expectedOutput) {
            const expected = tc.expectedOutput.trim();
            if (!out.includes(expected) && out !== expected) {
              allPassed = false;
              failReason = `Test "${tc.description || 'Output check'}": Expected "${expected}" in output, but got "${out || '(no output)'}".`;
              break;
            }
          }

          if (tc.assertionPython) {
            const assertScript = `${userCode}\n\n# Codolingo Test Assertion\n${tc.assertionPython}`;
            const assertRes = await codeExecutionService.executeRaw(assertScript);
            if (assertRes.error) {
              allPassed = false;
              failReason = `Test "${tc.description || 'Assertion'}": ${assertRes.error}`;
              break;
            }
          }
        }

        if (allPassed) {
          sound.playSuccess();
          setTestResult({ passed: true, message: 'All assertions passed! Output and logic match expected result.' });
          setTerminalOutput(rawRes.stdout || '');
        } else {
          sound.playError();
          setTestResult({ passed: false, message: failReason || 'Assertion check failed.' });
          setTerminalOutput(rawRes.stdout || '');
        }
      } else if (step.expectedOutput) {
        sound.playSuccess();
        setTestResult({ passed: true, message: 'All assertions passed! Output matches expected result.' });
        setTerminalOutput(rawRes.stdout || '');
      } else {
        // Fallback for steps without explicit test cases or expectedOutput: require non-empty code and execution
        if (userCode.trim().length > 0) {
          sound.playSuccess();
          setTestResult({ passed: true, message: 'Code executed cleanly with no errors.' });
          setTerminalOutput(rawRes.stdout || '');
        } else {
          sound.playError();
          setTestResult({ passed: false, message: 'Please write your solution code before submitting.' });
        }
      }
    } catch (err) {
      sound.playError();
      setTestResult({ passed: false, message: `Evaluation error: ${err}` });
    } finally {
      setIsExecuting(false);
    }
  };

  // Group drills by categories
  const categories = useMemo(() => {
    const map: { [cat: string]: ConceptRepairDrill[] } = {};
    ALL_REPAIR_DRILLS.forEach(drill => {
      if (!map[drill.category]) map[drill.category] = [];
      map[drill.category].push(drill);
    });
    return map;
  }, []);

  const totalUnresolved = mistakes.filter(m => !m.resolved).length;

  // -------------------------------------------------------------
  // RENDER: 4-Step Repair Drill Runner Modal / View
  // -------------------------------------------------------------
  if (activeDrill && activeSteps) {
    const currentStep = activeSteps[currentStepIndex];

    if (drillCompleted) {
      return (
        <div style={{ maxWidth: '640px', margin: '40px auto', padding: '40px 24px', textAlign: 'center' }} className="animate-pop-in">
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', color: 'var(--state-success)', border: '2px solid var(--state-success)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={48} stroke={3} />
          </div>
          <Badge variant="success" size="md">Concept Repaired</Badge>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '12px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {activeDrill.friendlyTitle}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '28px' }}>
            You completed the 4-step repair drill! You spotted the bug, mastered the mental model, fixed the syntax, and proved your understanding with a transfer challenge.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', marginBottom: '32px' }}>
            <Icon name="sparkles" size={18} color="var(--state-warning)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>+50 XP Banked • Mastery Progressed</span>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setActiveDrill(null);
                setActiveSteps(null);
              }}
              icon={<Icon name="arrow-right" size={18} />}
              iconPosition="right"
            >
              Return to Fix-It Lab
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '840px', margin: '20px auto', padding: '20px 20px 80px' }} className="animate-fade-in">
        {/* Drill Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={() => {
              setActiveDrill(null);
              setActiveSteps(null);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
          >
            <Icon name="arrow-left" size={16} /> Exit Drill
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="brand" size="sm">STEP {currentStepIndex + 1} OF 4</Badge>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{currentStep.title}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <ProgressBar progress={((currentStepIndex + 1) / 4) * 100} height={6} />
        </div>

        {/* Drill Title & Subtitle */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
            {currentStep.title}: {currentStep.whatWereFixing}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            {activeDrill.friendlyTitle} • {activeDrill.category}
          </p>
        </div>

        {/* STEP 1: SPOT IT (Multiple Choice / Predict Output) */}
        {currentStep.stepNumber === 1 && (
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {currentStep.prompt}
            </p>

            {currentStep.codeSnippet && (
              <pre style={{ backgroundColor: 'var(--code-bg, #1E1E1E)', color: 'var(--code-text, #D4D4D4)', padding: '16px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '20px', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
                <code>{currentStep.codeSnippet}</code>
              </pre>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {currentStep.options?.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let bg = 'var(--bg-surface)';
                let border = isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)';

                if (optionSubmitted) {
                  if (opt.isCorrect) {
                    bg = 'var(--state-success-subtle)';
                    border = '2px solid var(--state-success)';
                  } else if (isSelected && !opt.isCorrect) {
                    bg = 'var(--state-error-subtle)';
                    border = '2px solid var(--state-error)';
                  }
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (!optionSubmitted) setSelectedOptionId(opt.id);
                    }}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: bg,
                      border,
                      cursor: optionSubmitted ? 'default' : 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{opt.text}</div>
                    {optionSubmitted && (opt.isCorrect || isSelected) && (
                      <div style={{ fontSize: '0.82rem', marginTop: '6px', color: opt.isCorrect ? 'var(--state-success)' : 'var(--state-error)' }}>
                        {opt.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {!optionSubmitted ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedOptionId}
                  onClick={() => {
                    sound.playClick();
                    setOptionSubmitted(true);
                    const opt = currentStep.options?.find(o => o.id === selectedOptionId);
                    if (opt?.isCorrect) sound.playSuccess();
                    else sound.playError();
                  }}
                >
                  Confirm Choice
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  onClick={handleNextStep}
                  icon={<Icon name="arrow-right" size={16} />}
                  iconPosition="right"
                >
                  Continue to Step 2
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: UNDERSTAND WHY (Mental model explanation + Diagram) */}
        {currentStep.stepNumber === 2 && (
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
              <Icon name="bulb" size={14} /> Mental Model
            </div>

            <p style={{ fontSize: '1.02rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '18px' }}>
              {currentStep.explanationText}
            </p>

            {currentStep.diagram && (
              <pre style={{ backgroundColor: 'var(--bg-app)', color: 'var(--brand-primary)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '20px', border: '1px solid var(--border-subtle)', whiteSpace: 'pre-wrap' }}>
                {currentStep.diagram}
              </pre>
            )}

            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
              {currentStep.prompt}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {currentStep.options?.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let bg = 'var(--bg-surface)';
                let border = isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)';

                if (optionSubmitted) {
                  if (opt.isCorrect) {
                    bg = 'var(--state-success-subtle)';
                    border = '2px solid var(--state-success)';
                  } else if (isSelected && !opt.isCorrect) {
                    bg = 'var(--state-error-subtle)';
                    border = '2px solid var(--state-error)';
                  }
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (!optionSubmitted) setSelectedOptionId(opt.id);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: bg,
                      border,
                      cursor: optionSubmitted ? 'default' : 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt.text}</div>
                    {optionSubmitted && (opt.isCorrect || isSelected) && (
                      <div style={{ fontSize: '0.8rem', marginTop: '4px', color: opt.isCorrect ? 'var(--state-success)' : 'var(--state-error)' }}>
                        {opt.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {!optionSubmitted ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedOptionId}
                  onClick={() => {
                    sound.playClick();
                    setOptionSubmitted(true);
                    const opt = currentStep.options?.find(o => o.id === selectedOptionId);
                    if (opt?.isCorrect) sound.playSuccess();
                    else sound.playError();
                  }}
                >
                  Verify Understanding
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  onClick={handleNextStep}
                  icon={<Icon name="arrow-right" size={16} />}
                  iconPosition="right"
                >
                  Continue to Fix It
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 & STEP 4: CODE EDITOR (FIX IT & PROVE IT with Run + Check) */}
        {(currentStep.stepNumber === 3 || currentStep.stepNumber === 4) && (
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {currentStep.prompt}
            </p>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-default)', marginBottom: '14px' }}>
              <Editor
                height="170px"
                language="python"
                value={userCode}
                onChange={(val) => setUserCode(val || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  tabSize: 4
                }}
              />
            </div>

            {/* Run / Check Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  icon={<Icon name="player-play" size={14} />}
                >
                  Run Output
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCheckCode(currentStep)}
                  disabled={isExecuting}
                  icon={<Icon name="check" size={14} />}
                >
                  Check Solution
                </Button>
              </div>

              {/* Progressive Hints Button */}
              {currentHintLevel < 3 && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentHintLevel(prev => Math.min(3, prev + 1));
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Icon name="help" size={14} /> Need a hint? ({currentHintLevel}/3)
                </button>
              )}
            </div>

            {/* Hint Box */}
            {currentHintLevel > 0 && (
              <div style={{ backgroundColor: 'var(--brand-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-subtle)', fontSize: '0.86rem', color: 'var(--brand-text)' }}>
                <strong>Hint {currentHintLevel}:</strong> {currentStep.progressiveHints[currentHintLevel - 1]}
              </div>
            )}

            {/* Terminal Output */}
            {terminalOutput && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Standard Output (stdout):
                </div>
                <pre style={{ backgroundColor: '#18181B', color: '#FAFAFA', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', margin: 0, overflowX: 'auto', maxHeight: '100px' }}>
                  {terminalOutput}
                </pre>
              </div>
            )}

            {/* Test Case Feedback */}
            {testResult && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: testResult.passed ? 'var(--state-success-subtle)' : 'var(--state-error-subtle)', border: testResult.passed ? '1px solid var(--state-success)' : '1px solid var(--state-error)', color: testResult.passed ? 'var(--state-success)' : 'var(--state-error)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '16px' }}>
                {testResult.message}
              </div>
            )}

            {testResult?.passed && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="success"
                  size="md"
                  onClick={handleNextStep}
                  icon={<Icon name="arrow-right" size={16} />}
                  iconPosition="right"
                >
                  {currentStep.stepNumber === 3 ? 'Continue to Prove It' : 'Complete Concept Repair'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Fix-It Lab Main View (Concept Cards & Categories)
  // -------------------------------------------------------------
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 20px 80px' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
            Fix-It Lab
          </h1>
          {totalUnresolved > 0 ? (
            <Badge variant="warning" size="md">{totalUnresolved} Needs Repair</Badge>
          ) : (
            <Badge variant="success" size="md">All Clear</Badge>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
          Master Python by targeting tricky misconceptions. Each drill walks you through a 4-step repair: Spot It, Understand Why, Fix It, and Prove It.
        </p>
      </div>

      {/* If 0 mistakes total: Inviting All Clear banner */}
      {mistakes.length === 0 && (
        <Card variant="default" padding="lg" style={{ marginBottom: '36px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', color: 'var(--state-success)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle-check" size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
            Your Mistake Bank is Clean!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            You have no recorded mistakes. You can proactively practice common Python traps below to build ironclad muscle memory before you encounter them in lessons.
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => startDrill(ALL_REPAIR_DRILLS[0])}
            icon={<Icon name="tool" size={16} />}
          >
            Practice Tricky Concepts Proactively
          </Button>
        </Card>
      )}

      {/* Categorized Concept Grid */}
      {Object.entries(categories).map(([categoryName, drills]) => (
        <div key={categoryName} style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Icon name="tag" size={18} color="var(--brand-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
              {categoryName}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {drills.map((drill) => {
              const { label, color, unresolvedCount } = getConceptStatus(drill.tag);
              const latestMistake = mistakes.find(m => m.mistakeType === drill.tag);

              return (
                <div
                  key={drill.tag}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-xl)',
                    border: unresolvedCount > 0 ? '1.5px solid var(--state-warning-border)' : '1px solid var(--border-default)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                  className="hover-elevate"
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {drill.friendlyTitle}
                      </h3>
                      <Badge variant={color} size="sm">{label}</Badge>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                      {drill.description}
                    </p>

                    {/* Most recent code snippet if available */}
                    {latestMistake?.userCode && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Recent Snippet:
                        </div>
                        <pre style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', margin: 0, overflowX: 'auto', border: '1px solid var(--border-subtle)', maxHeight: '70px' }}>
                          <code>{latestMistake.userCode}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      4-Step Concept Drill
                    </span>
                    <Button
                      variant={unresolvedCount > 0 ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => startDrill(drill, latestMistake)}
                      icon={<Icon name="tool" size={14} />}
                    >
                      {unresolvedCount > 0 ? 'Repair Concept (4 steps)' : 'Practice Concept'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
