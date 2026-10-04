import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Lesson, LessonBlock, Challenge } from '../types';
import { courseService } from '../services/courseService';
import { codeExecutionService } from '../services/codeExecutionService';
import { sound } from '../utils/audio';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';

interface MultiStepLessonViewProps {
  lessonId: string;
}

type ExerciseState = 'unanswered' | 'answering' | 'validating' | 'correct' | 'incorrect' | 'completed';

export const MultiStepLessonView: React.FC<MultiStepLessonViewProps> = ({ lessonId }) => {
  const { course, exitLesson, completeLesson, recordMistake } = useApp();

  // Find target lesson metadata in course units
  let lessonMeta: Lesson | null = null;
  let unitTitle = '';
  for (const unit of course.units) {
    for (const skill of unit.skills) {
      const l = skill.lessons.find(item => item.id === lessonId);
      if (l) {
        lessonMeta = l;
        unitTitle = unit.title;
        break;
      }
    }
  }

  if (!lessonMeta) {
    lessonMeta = course.units[0]?.skills[0]?.lessons[0] || {
      id: '1.1',
      title: 'What Is Programming?',
      order: 1,
      estimatedMinutes: 4,
      xpReward: 25
    };
    unitTitle = course.units[0]?.title || 'Python Foundations';
  }

  // Load selected blocks asynchronously or from pre-indexed store
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    courseService.getLessonBlocks('python', lessonId).then((loaded) => {
      if (isMounted) {
        setBlocks(loaded);
        setCurrentBlockIndex(0);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to load blocks for lesson', lessonId, err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [lessonId]);

  const currentBlock: LessonBlock = blocks[currentBlockIndex] || {
    id: 'default',
    type: 'explanation',
    title: 'Loading exercise...'
  };

  // Interaction State
  const [exerciseState, setExerciseState] = useState<ExerciseState>('unanswered');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [blankAnswer, setBlankAnswer] = useState<string>('');
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ title: string; msg: string; detail?: string }>({ title: '', msg: '' });
  const [executionOutput, setExecutionOutput] = useState<string>('');

  // Reset state when navigating to a new block
  useEffect(() => {
    setExerciseState('unanswered');
    setSelectedOptionId(null);
    setBlankAnswer('');
    setShowHint(false);
    setExecutionOutput('');
    setFeedbackMsg({ title: '', msg: '' });

    // Initialize code editor
    setCode(currentBlock.starterCode || '');

    // Initialize code ordering (shuffle slightly if identical to answer)
    if (currentBlock.orderingOptions && currentBlock.orderingOptions.length > 0) {
      const opts = [...currentBlock.orderingOptions];
      // Deterministic reverse or swap so user has to interactively order it
      if (opts.length > 1) {
        const last = opts.pop()!;
        opts.unshift(last);
      }
      setOrderedItems(opts);
    } else {
      setOrderedItems([]);
    }

    // Initialize matching
    setMatchedPairs({});
    setSelectedMatchLeft(null);

    // If explanation / micro_lesson, mark ready to continue
    if (currentBlock.type === 'explanation' || currentBlock.type === 'code_example') {
      setExerciseState('completed');
    }
  }, [currentBlockIndex, currentBlock]);

  // Handler: Option Selection (Multiple Choice / Prediction / Scenario / Error Diagnosis)
  const handleOptionSelect = (optionId: string) => {
    if (exerciseState === 'correct' || exerciseState === 'incorrect') return;
    sound.playClick();
    setSelectedOptionId(optionId);
    setExerciseState('answering');
  };

  // Handler: Check Multiple Choice / Prediction / Scenario Answer
  const checkOptionAnswer = () => {
    if (!selectedOptionId || !currentBlock.options) return;
    const chosen = currentBlock.options.find(o => o.id === selectedOptionId);

    if (chosen?.isCorrect) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: 'Spot on!',
        msg: chosen.explanation || currentBlock.explanation || 'That is the correct answer.'
      });
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: 'Not quite...',
        msg: chosen?.explanation || currentBlock.commonMistake || 'Review the code trace and try again.',
        detail: currentBlock.commonMistake ? `Common Misconception: ${currentBlock.commonMistake}` : undefined
      });
      if (lessonMeta) {
        recordMistake({
          skillId: lessonMeta.skillId,
          lessonId: lessonMeta.id,
          mistakeType: (currentBlock.type as string) || 'quiz_error',
          explanation: chosen?.explanation || 'Incorrect option selected',
          userCode: chosen?.text || selectedOptionId
        });
      }
    }
  };

  // Handler: Check Fill In The Blank
  const checkBlankAnswer = () => {
    const trimmed = blankAnswer.trim();
    if (!trimmed) return;

    const accepted = currentBlock.acceptedAnswers || (currentBlock.correctAnswer ? [String(currentBlock.correctAnswer)] : []);
    const cleanUser = trimmed.replace(/^['"]|['"]$/g, '').toLowerCase();

    const isMatch = accepted.some(ans => {
      const cleanAns = String(ans).trim().replace(/^['"]|['"]$/g, '').toLowerCase();
      return cleanUser === cleanAns;
    });

    if (isMatch) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: 'Perfect!',
        msg: currentBlock.explanation || `Correct syntax: "${trimmed}" fits the statement properly.`
      });
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: 'Incorrect syntax',
        msg: currentBlock.commonMistake || `"${trimmed}" is not the expected token. ${currentBlock.hint || 'Check keyword spelling or quotes.'}`
      });
      if (lessonMeta) {
        recordMistake({
          skillId: lessonMeta.skillId,
          lessonId: lessonMeta.id,
          mistakeType: 'syntax_blank_error',
          explanation: `Entered "${trimmed}" instead of expected answer.`,
          userCode: trimmed
        });
      }
    }
  };

  // Handler: Code Ordering Step Movement
  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    if (exerciseState === 'correct') return;
    sound.playClick();
    const newItems = [...orderedItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setOrderedItems(newItems);
  };

  const checkOrderingAnswer = () => {
    const correct = currentBlock.correctAnswer as string[] || currentBlock.orderingOptions || [];
    const isMatch = orderedItems.length === correct.length && orderedItems.every((item, idx) => item.trim() === correct[idx]?.trim());

    if (isMatch) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: 'Algorithm correctly ordered!',
        msg: currentBlock.explanation || 'Every instruction executes in the correct logical sequence.'
      });
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: 'Sequence error',
        msg: currentBlock.explanation || 'One or more instructions are out of order. Consider what must happen first.'
      });
      if (lessonMeta) {
        recordMistake({
          skillId: lessonMeta.skillId,
          lessonId: lessonMeta.id,
          mistakeType: 'algorithm_sequence_error',
          explanation: 'Code sequence was arranged incorrectly.',
          userCode: orderedItems.join(' -> ')
        });
      }
    }
  };

  // Handler: Match Code to Concept
  const handleMatchSelect = (key: string, value: string) => {
    if (exerciseState === 'correct') return;
    sound.playClick();
    setMatchedPairs(prev => ({ ...prev, [key]: value }));
  };

  const checkMatchAnswer = () => {
    const targetObj = (currentBlock.correctAnswer || currentBlock.rawOptions) as Record<string, string>;
    if (!targetObj) return;

    const keys = Object.keys(targetObj);
    const allPaired = keys.every(k => matchedPairs[k]);
    if (!allPaired) return;

    const isMatch = keys.every(k => matchedPairs[k] === targetObj[k]);

    if (isMatch) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: 'All concepts matched!',
        msg: currentBlock.explanation || 'You accurately paired each concept with its definition.'
      });
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: 'Some matches are incorrect',
        msg: currentBlock.explanation || 'Review the definitions and re-pair the items.'
      });
      if (lessonMeta) {
        recordMistake({
          skillId: lessonMeta.skillId,
          lessonId: lessonMeta.id,
          mistakeType: 'concept_matching_error',
          explanation: 'Concept pairing mismatch',
          userCode: JSON.stringify(matchedPairs)
        });
      }
    }
  };

  // Handler: Run Code (write_the_code, fix_the_code, mini_challenge, refactoring_challenge)
  const handleRunCode = async () => {
    if (!lessonMeta) return;
    setExerciseState('validating');
    sound.playClick();

    const challengePayload: Challenge = {
      id: currentBlock.id,
      lessonId: lessonMeta.id,
      title: currentBlock.title || 'Code Exercise',
      starterCode: currentBlock.starterCode || '',
      solutionCode: currentBlock.solutionCode || '',
      hint: currentBlock.hint || '',
      type: 'code',
      tests: (currentBlock.tests || []).map(t => ({
        id: t.id,
        description: t.description,
        expectedOutput: t.expectedOutput,
        input: t.input
      }))
    };

    const res = await codeExecutionService.execute(code, challengePayload);
    setExecutionOutput(res.stdout || (res.error ? `Error: ${res.error}` : ''));

    if (res.success) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: 'Execution Successful!',
        msg: currentBlock.explanation || 'All tests passed and code executed cleanly.'
      });
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: res.diagnostic?.mistakeType ? `Diagnostic: ${res.diagnostic.mistakeType.replace(/_/g, ' ')}` : 'Tests Failed',
        msg: res.diagnostic?.message || res.error || 'Your code output did not match the expected specification.',
        detail: res.diagnostic?.fixSuggestion || currentBlock.hint || 'Check indentation, variables, and function calls.'
      });
      if (lessonMeta) {
        recordMistake({
          skillId: lessonMeta.skillId,
          lessonId: lessonMeta.id,
          mistakeType: res.diagnostic?.mistakeType || 'runtime_code_error',
          explanation: res.diagnostic?.message || 'Code execution did not pass verification.',
          userCode: code
        });
      }
    }
  };

  // Handler: Next Step / Complete Lesson
  const handleNextStep = () => {
    sound.playClick();
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      sound.playSuccess();
      if (lessonMeta) {
        completeLesson(lessonMeta.id, lessonMeta.xpReward);
      }
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}
      setExerciseState('completed');
    }
  };

  const progressPercentage = blocks.length > 0 ? Math.round(((currentBlockIndex + 1) / blocks.length) * 100) : 100;

  // Helper: Format Markdown Text with Python Code Fences
  const renderFormattedMarkdown = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);

    return (
      <div style={{ lineHeight: 1.7, fontSize: '1rem', color: 'var(--text-primary)' }}>
        {parts.map((part, idx) => {
          if (part.startsWith('```')) {
            const cleanCode = part.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '16px 20px',
                  margin: '16px 0',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid #2D3748',
                  overflowX: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.72rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
                  <span>python</span>
                </div>
                <pre style={{ margin: 0, color: '#E2E8F0', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  {cleanCode}
                </pre>
              </div>
            );
          }

          // Format bold and backticks
          return (
            <div key={idx} style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
              {part}
            </div>
          );
        })}
      </div>
    );
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #E5E7EB', borderTopColor: '#10B981', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Preparing micro-lesson...</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Selecting the top 15 interactions for {lessonMeta?.title}</p>
      </div>
    );
  }

  // Completion Screen (Finished all ~15 blocks)
  if (currentBlockIndex >= blocks.length - 1 && exerciseState === 'completed' && lessonMeta) {
    return (
      <div className="flex-center animate-pop-in" style={{ minHeight: '100vh', flexDirection: 'column', backgroundColor: '#FFFFFF', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ width: '92px', height: '92px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="shadow-lg">
          <Icon name="award" size={52} stroke={2.5} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Badge variant="brand" size="md">Lesson {lessonMeta.id} Complete</Badge>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Lesson Mastered!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '480px', marginBottom: '32px', lineHeight: 1.5 }}>
          You completed all {blocks.length} structured exercises in <strong>{lessonMeta.title}</strong>.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ padding: '14px 24px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-xl)', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, color: '#B45309' }}>
            <Icon name="sparkles" size={22} fill="#FDE68A" />
            <span style={{ fontSize: '1.2rem' }}>+{lessonMeta.xpReward} XP</span>
          </div>
          <div style={{ padding: '14px 24px', backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-xl)', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, color: '#065F46' }}>
            <Icon name="check" size={22} stroke={3} />
            <span style={{ fontSize: '1.2rem' }}>Mastery +1</span>
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={exitLesson} icon={<Icon name="arrow-right" size={20} />} iconPosition="right" style={{ minWidth: '240px' }}>
          Continue Track
        </Button>
      </div>
    );
  }

  // Render specific interaction component based on block type
  const renderBlockContent = () => {
    switch (currentBlock.type) {
      // 1. Micro Lesson / Explanation
      case 'explanation':
      case 'code_example':
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '120px' }}>
            <div style={{ backgroundColor: 'var(--bg-app, #F9FAFB)', padding: '28px', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid var(--border-default, #E5E7EB)' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.contentMarkdown)}
            </div>
          </div>
        );

      // 2. Multiple Choice, Output Prediction, Code Prediction, Error Diagnosis, Scenario, Trace
      case 'multiple_choice':
      case 'output_prediction':
      case 'code_prediction':
      case 'error_diagnosis':
      case 'real_world_scenario':
      case 'trace_execution':
      case 'short_quiz':
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
            {/* Header info badge */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <Badge variant={currentBlock.type === 'error_diagnosis' ? 'error' : (currentBlock.type === 'real_world_scenario' ? 'brand' : 'neutral')} size="sm">
                {currentBlock.type.replace(/_/g, ' ').toUpperCase()}
              </Badge>
              {currentBlock.difficulty && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Level: {currentBlock.difficulty.toUpperCase()}
                </span>
              )}
            </div>

            {/* Prompt with Code Fences */}
            <div style={{ marginBottom: '24px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            {/* Selectable Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(currentBlock.options || []).map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const letter = String.fromCharCode(65 + idx);

                let bgCol = '#FFFFFF';
                let borderCol = 'var(--border-default, #E5E7EB)';
                let textCol = 'var(--text-primary, #111827)';

                if (exerciseState === 'correct' || exerciseState === 'incorrect') {
                  if (isSelected) {
                    bgCol = opt.isCorrect ? '#ECFDF5' : '#FEF2F2';
                    borderCol = opt.isCorrect ? '#10B981' : '#EF4444';
                    textCol = opt.isCorrect ? '#065F46' : '#991B1B';
                  } else if (opt.isCorrect && exerciseState === 'incorrect') {
                    borderCol = '#10B981';
                    bgCol = '#F0FDF4';
                  }
                } else if (isSelected) {
                  borderCol = '#10B981';
                  bgCol = '#ECFDF5';
                  textCol = '#065F46';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    disabled={exerciseState === 'correct'}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: `2px solid ${borderCol}`,
                      backgroundColor: bgCol,
                      color: textCol,
                      textAlign: 'left',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: exerciseState === 'correct' ? 'default' : 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                  >
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? (opt.isCorrect && (exerciseState === 'correct' || exerciseState === 'incorrect') ? '#10B981' : '#10B981') : '#F3F4F6',
                        color: isSelected ? '#FFFFFF' : '#4B5563',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {letter}
                    </span>
                    <span style={{ flex: 1, fontSize: '0.98rem', lineHeight: 1.4 }}>{opt.text}</span>
                    {(exerciseState === 'correct' || exerciseState === 'incorrect') && isSelected && (
                      opt.isCorrect ? (
                        <Icon name="check" size={20} style={{ color: '#10B981' }} stroke={3} />
                      ) : (
                        <Icon name="x" size={20} style={{ color: '#EF4444' }} stroke={3} />
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // 3. Fill In The Blank
      case 'fill_in_the_blank':
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Badge variant="brand" size="sm">FILL IN THE BLANK</Badge>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            <div style={{ backgroundColor: 'var(--bg-app, #F9FAFB)', padding: '24px', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid var(--border-default, #E5E7EB)' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Your Answer (exact syntax or keyword):
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={blankAnswer}
                  onChange={(e) => {
                    setBlankAnswer(e.target.value);
                    if (exerciseState === 'incorrect') setExerciseState('unanswered');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && blankAnswer.trim()) checkBlankAnswer();
                  }}
                  placeholder="e.g. print, len, while, [x * 2]..."
                  disabled={exerciseState === 'correct'}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-lg, 12px)',
                    border: '2px solid var(--border-default, #E5E7EB)',
                    fontSize: '1.05rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        );

      // 4. Code Ordering
      case 'code_ordering':
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Badge variant="brand" size="sm">CODE ORDERING</Badge>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                Use arrows to arrange steps in execution sequence
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orderedItems.map((itemText, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid var(--border-default, #E5E7EB)',
                    borderRadius: 'var(--radius-lg, 12px)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                      {itemText}
                    </span>
                  </div>

                  {exerciseState !== 'correct' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => moveOrderItem(idx, 'up')}
                        disabled={idx === 0}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: idx === 0 ? '#F9FAFB' : '#FFFFFF', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveOrderItem(idx, 'down')}
                        disabled={idx === orderedItems.length - 1}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: idx === orderedItems.length - 1 ? '#F9FAFB' : '#FFFFFF', cursor: idx === orderedItems.length - 1 ? 'not-allowed' : 'pointer' }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      // 5. Match Code to Concept
      case 'match_code_to_concept': {
        const rawOpts = (currentBlock.rawOptions || currentBlock.correctAnswer || {}) as Record<string, string>;
        const keys = Object.keys(rawOpts);
        const values = Object.values(rawOpts);

        return (
          <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Badge variant="brand" size="sm">CONCEPT MATCHING</Badge>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {keys.map((k) => (
                <div key={k} style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{k}:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {values.map((v, vIdx) => {
                      const isSelected = matchedPairs[k] === v;
                      return (
                        <button
                          key={vIdx}
                          onClick={() => handleMatchSelect(k, v)}
                          disabled={exerciseState === 'correct'}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #10B981' : '1px solid #E5E7EB',
                            backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                          }}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 6. Write the Code, Fix the Code, Mini Challenge, Refactoring
      case 'write_code':
      case 'fix_code':
      case 'mini_challenge':
      case 'refactoring_challenge':
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Badge variant={currentBlock.type === 'fix_code' ? 'error' : 'brand'} size="sm">
                  {currentBlock.type === 'fix_code' ? 'DEBUG & REPAIR' : 'PYTHON CODE CHALLENGE'}
                </Badge>
              </div>

              {currentBlock.hint && (
                <button
                  onClick={() => setShowHint(prev => !prev)}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Icon name="sparkles" size={16} />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              )}
            </div>

            {/* Prompt Instructions */}
            <div style={{ marginBottom: '20px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            {/* Hint Box */}
            {showHint && currentBlock.hint && (
              <div className="animate-fade-in" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg, 12px)', padding: '14px 18px', marginBottom: '18px', color: '#1E40AF', fontSize: '0.9rem' }}>
                💡 <strong>Hint:</strong> {currentBlock.hint}
              </div>
            )}

            {/* Monaco Python Editor */}
            <div style={{ borderRadius: 'var(--radius-xl, 16px)', border: '1px solid var(--border-default, #E5E7EB)', overflow: 'hidden', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: '38px', backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-default, #E5E7EB)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="code" size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-secondary)' }}>
                    solution.py
                  </span>
                </div>
                <button
                  onClick={() => setCode(currentBlock.starterCode || '')}
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Icon name="history" size={14} /> Reset
                </button>
              </div>

              <div style={{ height: '240px' }}>
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={code}
                  onChange={(val) => {
                    setCode(val || '');
                    if (exerciseState === 'incorrect') setExerciseState('unanswered');
                  }}
                  theme="light"
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    fontSize: 14,
                    wordWrap: 'on',
                    tabSize: 4,
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 }
                  }}
                />
              </div>
            </div>

            {/* Output / Console Preview */}
            {executionOutput && (
              <div style={{ backgroundColor: '#1E1E1E', color: '#E2E8F0', borderRadius: 'var(--radius-lg, 12px)', padding: '14px 18px', marginTop: '12px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Execution Output</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{executionOutput}</pre>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unsupported block type {currentBlock.type}</div>;
    }
  };

  // Bottom Fixed Drawer
  const renderFooter = () => {
    let footerBg = '#FFFFFF';
    let borderColor = 'var(--border-default, #E5E7EB)';

    if (exerciseState === 'correct') {
      footerBg = '#ECFDF5';
      borderColor = '#A7F3D0';
    } else if (exerciseState === 'incorrect') {
      footerBg = '#FEF2F2';
      borderColor = '#FECACA';
    }

    const isCodingType = currentBlock.type === 'write_code' || currentBlock.type === 'fix_code' || currentBlock.type === 'mini_challenge' || currentBlock.type === 'refactoring_challenge';
    const isBlankType = currentBlock.type === 'fill_in_the_blank';
    const isOrderingType = currentBlock.type === 'code_ordering';
    const isMatchingType = currentBlock.type === 'match_code_to_concept';
    const isOptionType = currentBlock.type === 'multiple_choice' || currentBlock.type === 'output_prediction' || currentBlock.type === 'code_prediction' || currentBlock.type === 'error_diagnosis' || currentBlock.type === 'real_world_scenario' || currentBlock.type === 'trace_execution' || currentBlock.type === 'short_quiz';
    const isExplanation = currentBlock.type === 'explanation' || currentBlock.type === 'code_example';

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: footerBg,
          borderTop: `1px solid ${borderColor}`,
          padding: '16px 24px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Feedback Section */}
          {(exerciseState === 'correct' || exerciseState === 'incorrect') && (
            <div className="animate-pop-in" style={{ marginBottom: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: exerciseState === 'correct' ? '#10B981' : '#EF4444',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name={exerciseState === 'correct' ? 'check' : 'x'} size={22} stroke={3} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: exerciseState === 'correct' ? '#065F46' : '#991B1B' }}>
                  {feedbackMsg.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: exerciseState === 'correct' ? '#065F46' : '#7F1D1D', lineHeight: 1.4 }}>
                  {feedbackMsg.msg}
                </p>
                {feedbackMsg.detail && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: exerciseState === 'correct' ? '#047857' : '#B91C1C', fontStyle: 'italic' }}>
                    {feedbackMsg.detail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Button Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              {exerciseState === 'incorrect' && (
                <button
                  onClick={() => setExerciseState('unanswered')}
                  style={{ background: 'none', border: 'none', color: '#991B1B', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', padding: '8px' }}
                >
                  RETRY
                </button>
              )}
            </div>

            <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end' }}>
              {isExplanation || exerciseState === 'completed' || exerciseState === 'correct' ? (
                <Button
                  variant={exerciseState === 'correct' ? 'success' : 'primary'}
                  size="lg"
                  onClick={handleNextStep}
                  fullWidth
                  style={{ maxWidth: '280px' }}
                >
                  CONTINUE
                </Button>
              ) : isCodingType ? (
                <Button
                  variant={exerciseState === 'incorrect' ? 'danger' : 'primary'}
                  size="lg"
                  onClick={handleRunCode}
                  isLoading={exerciseState === 'validating'}
                  disabled={code.trim() === '' || exerciseState === 'incorrect'}
                  fullWidth
                  style={{ maxWidth: '280px' }}
                >
                  RUN CODE
                </Button>
              ) : isBlankType ? (
                <Button
                  variant={exerciseState === 'incorrect' ? 'danger' : 'primary'}
                  size="lg"
                  onClick={checkBlankAnswer}
                  disabled={blankAnswer.trim() === '' || exerciseState === 'incorrect'}
                  fullWidth
                  style={{ maxWidth: '280px' }}
                >
                  CHECK
                </Button>
              ) : isOrderingType ? (
                <Button
                  variant={exerciseState === 'incorrect' ? 'danger' : 'primary'}
                  size="lg"
                  onClick={checkOrderingAnswer}
                  disabled={exerciseState === 'incorrect'}
                  fullWidth
                  style={{ maxWidth: '280px' }}
                >
                  CHECK ORDER
                </Button>
              ) : isMatchingType ? (
                <Button
                  variant={exerciseState === 'incorrect' ? 'danger' : 'primary'}
                  size="lg"
                  onClick={checkMatchAnswer}
                  disabled={exerciseState === 'incorrect'}
                  fullWidth
                  style={{ maxWidth: '280px' }}
                >
                  CHECK MATCHES
                </Button>
              ) : (
                <Button
                  variant={exerciseState === 'incorrect' ? 'danger' : 'primary'}
                  size="lg"
                  onClick={checkOptionAnswer}
                  disabled={!selectedOptionId || exerciseState === 'incorrect'}
                  fullWidth
                  style={{ maxWidth: '280px' }}
                >
                  CHECK
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Top Header */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border-default, #E5E7EB)',
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
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
          title="Exit to learning path"
        >
          <Icon name="x" size={24} stroke={2.5} />
        </button>

        <div style={{ flex: 1, maxWidth: '440px', margin: '0 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <span>{lessonMeta.title}</span>
            <span>{currentBlockIndex + 1} / {blocks.length}</span>
          </div>
          <ProgressBar progress={progressPercentage} height={10} />
        </div>

        <div style={{ width: '24px' }} />
      </header>

      {/* Main Block Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 20px' }}>
        <div style={{ maxWidth: '780px', width: '100%' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>
            {currentBlock.title}
          </h1>
          {renderBlockContent()}
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      {renderFooter()}
    </div>
  );
};
