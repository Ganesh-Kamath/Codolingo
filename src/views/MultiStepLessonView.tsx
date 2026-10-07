import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Lesson, LessonBlock, Challenge, TestResult } from '../types';
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

type SessionPhase = 'initial' | 'review_intro' | 'review' | 'completed';
type ExerciseState = 'unanswered' | 'answering' | 'validating' | 'correct' | 'incorrect' | 'completed';

interface WrongQuestionRecord {
  block: LessonBlock;
  userAnswer?: string;
  concept?: string;
  isReviewCorrect?: boolean;
}

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

  // Lesson Progression Flow State
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('initial');
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestionRecord[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [firstAttemptCorrectCount, setFirstAttemptCorrectCount] = useState<number>(0);
  const [reviewCorrectCount, setReviewCorrectCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    courseService.getLessonBlocks('python', lessonId).then((loaded) => {
      if (isMounted) {
        setBlocks(loaded);
        setCurrentBlockIndex(0);
        setWrongQuestions([]);
        setReviewIndex(0);
        setFirstAttemptCorrectCount(0);
        setReviewCorrectCount(0);
        setSessionPhase('initial');
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to load blocks for lesson', lessonId, err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [lessonId]);

  // Current active block depending on session phase
  const currentBlock: LessonBlock = sessionPhase === 'review'
    ? (wrongQuestions[reviewIndex]?.block || { id: 'default', type: 'explanation', title: 'Review Exercise' })
    : (blocks[currentBlockIndex] || { id: 'default', type: 'explanation', title: 'Loading exercise...' });

  // Interaction State
  const [exerciseState, setExerciseState] = useState<ExerciseState>('unanswered');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [blankAnswer, setBlankAnswer] = useState<string>('');
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [code, setCode] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ title: string; msg: string; detail?: string }>({ title: '', msg: '' });
  const [executionOutput, setExecutionOutput] = useState<string>('');

  // Enhanced Question Type States: Tracing, Debugging attempts, Test Results, and Repair Flow
  const [traceInputs, setTraceInputs] = useState<Record<number, string>>({});
  const [traceFeedback, setTraceFeedback] = useState<{ checked: boolean; allPassed: boolean; failedIndex?: number; message?: string } | null>(null);
  const [debugAttempts, setDebugAttempts] = useState<number>(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showRepairFlow, setShowRepairFlow] = useState<boolean>(false);
  const [repairSelectedOptId, setRepairSelectedOptId] = useState<string | null>(null);
  const [repairAnswerChecked, setRepairAnswerChecked] = useState<boolean>(false);
  const [repairIsCorrect, setRepairIsCorrect] = useState<boolean>(false);

  // Reset state when navigating to a new block or changing phase
  useEffect(() => {
    setExerciseState('unanswered');
    setSelectedOptionId(null);
    setBlankAnswer('');
    setShowHint(false);
    setExecutionOutput('');
    setFeedbackMsg({ title: '', msg: '' });

    // Reset extended interactive states
    setTraceInputs({});
    setTraceFeedback(null);
    setDebugAttempts(0);
    setTestResults([]);
    setShowRepairFlow(false);
    setRepairSelectedOptId(null);
    setRepairAnswerChecked(false);
    setRepairIsCorrect(false);

    // Initialize code editor
    setCode(currentBlock.starterCode || '');

    // Initialize code ordering (shuffle slightly if identical to answer)
    if (currentBlock.orderingOptions && currentBlock.orderingOptions.length > 0) {
      const opts = [...currentBlock.orderingOptions];
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

    // If explanation / micro_lesson, mark ready to continue
    if (currentBlock.type === 'explanation' || currentBlock.type === 'code_example') {
      setExerciseState('completed');
    }
  }, [currentBlockIndex, reviewIndex, sessionPhase, currentBlock.id]);

  // Handler: Option Selection
  const handleOptionSelect = (optionId: string) => {
    if (exerciseState === 'correct' || exerciseState === 'incorrect') return;
    sound.playClick();
    setSelectedOptionId(optionId);
    setExerciseState('answering');
  };

  // Helper: Retrieve formatted correct answer display text
  const getCorrectAnswerDisplay = (block: LessonBlock): string => {
    if (block.options && block.options.length > 0) {
      const correctOpt = block.options.find(o => o.isCorrect);
      if (correctOpt) return correctOpt.text;
    }
    if (block.acceptedAnswers && block.acceptedAnswers.length > 0) {
      return block.acceptedAnswers.join('  OR  ');
    }
    if (block.correctAnswer) {
      if (Array.isArray(block.correctAnswer)) {
        return block.correctAnswer.map((s, i) => `${i + 1}. ${s}`).join('\n');
      }
      if (typeof block.correctAnswer === 'object') {
        return Object.entries(block.correctAnswer).map(([k, v]) => `• ${k}  ➔  ${v}`).join('\n');
      }
      return String(block.correctAnswer);
    }
    if (block.solutionCode) {
      return block.solutionCode;
    }
    return 'See explanation below';
  };

  // Handler: Check Multiple Choice / Prediction / Scenario Answer
  const checkOptionAnswer = () => {
    if (!selectedOptionId || !currentBlock.options) return;
    const chosen = currentBlock.options.find(o => o.id === selectedOptionId);

    if (chosen?.isCorrect) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: sessionPhase === 'review' ? 'Great recovery! Concept reinforced.' : 'Spot on!',
        msg: chosen.explanation || currentBlock.explanation || 'That is the correct answer.'
      });
      if (sessionPhase === 'initial') {
        setFirstAttemptCorrectCount(prev => prev + 1);
      } else if (sessionPhase === 'review') {
        setReviewCorrectCount(prev => prev + 1);
        setWrongQuestions(prev => prev.map((q, idx) => idx === reviewIndex ? { ...q, isReviewCorrect: true } : q));
      }
    } else {
      sound.playError();
      setExerciseState('incorrect');
      const tag = currentBlock.misconceptionTag || 'MISCONCEPTION_DETECTED';
      const detailMsg = currentBlock.mentalModel
        ? `Mental Model: ${currentBlock.mentalModel}`
        : (currentBlock.commonMistake ? `Common Misconception: ${currentBlock.commonMistake}` : undefined);

      setFeedbackMsg({
        title: sessionPhase === 'review' ? 'Review feedback:' : 'Misconception Identified',
        msg: chosen?.explanation || currentBlock.commonMistake || 'Review the explanation below.',
        detail: detailMsg
      });

      // Activate repair flow if repair question is present
      if (currentBlock.repairQuestion) {
        setShowRepairFlow(true);
      }

      if (sessionPhase === 'initial') {
        setWrongQuestions(prev => [
          ...prev,
          { block: currentBlock, userAnswer: chosen?.text || selectedOptionId, concept: currentBlock.concept }
        ]);
        if (lessonMeta) {
          recordMistake({
            skillId: lessonMeta.skillId,
            lessonId: lessonMeta.id,
            mistakeType: tag,
            explanation: chosen?.explanation || 'Incorrect option selected',
            userCode: chosen?.text || selectedOptionId
          });
        }
      }
    }
  };

  // Handler: Verify repair question attempt
  const handleVerifyRepair = () => {
    if (!repairSelectedOptId || !currentBlock.repairQuestion) return;
    const chosen = currentBlock.repairQuestion.options.find((o: any) => o.id === repairSelectedOptId);
    setRepairAnswerChecked(true);

    if (chosen?.isCorrect) {
      sound.playSuccess();
      setRepairIsCorrect(true);
    } else {
      sound.playError();
      setRepairIsCorrect(false);
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
        title: sessionPhase === 'review' ? 'Great recovery! Syntax confirmed.' : 'Perfect!',
        msg: currentBlock.explanation || `Correct syntax: "${trimmed}" fits the statement properly.`
      });
      if (sessionPhase === 'initial') {
        setFirstAttemptCorrectCount(prev => prev + 1);
      } else if (sessionPhase === 'review') {
        setReviewCorrectCount(prev => prev + 1);
        setWrongQuestions(prev => prev.map((q, idx) => idx === reviewIndex ? { ...q, isReviewCorrect: true } : q));
      }
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: 'Incorrect syntax',
        msg: currentBlock.explanation || currentBlock.commonMistake || `"${trimmed}" is not the expected token.`
      });

      if (sessionPhase === 'initial') {
        setWrongQuestions(prev => [
          ...prev,
          { block: currentBlock, userAnswer: trimmed, concept: currentBlock.concept }
        ]);
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
    }
  };

  // Handler: Code Ordering Step Movement
  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    if (exerciseState === 'correct' || exerciseState === 'incorrect') return;
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
    const correct = (currentBlock.correctAnswer as string[]) || currentBlock.orderingOptions || [];
    const isMatch = orderedItems.length === correct.length && orderedItems.every((item, idx) => item.trim() === correct[idx]?.trim());

    if (isMatch) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: sessionPhase === 'review' ? 'Sequence reinforced!' : 'Algorithm correctly ordered!',
        msg: currentBlock.explanation || 'Every instruction executes in the correct logical sequence.'
      });
      if (sessionPhase === 'initial') {
        setFirstAttemptCorrectCount(prev => prev + 1);
      } else if (sessionPhase === 'review') {
        setReviewCorrectCount(prev => prev + 1);
        setWrongQuestions(prev => prev.map((q, idx) => idx === reviewIndex ? { ...q, isReviewCorrect: true } : q));
      }
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: 'Sequence error',
        msg: currentBlock.explanation || 'One or more instructions were out of order. See correct sequence below.'
      });

      if (sessionPhase === 'initial') {
        setWrongQuestions(prev => [
          ...prev,
          { block: currentBlock, userAnswer: orderedItems.join(' -> '), concept: currentBlock.concept }
        ]);
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
    }
  };

  // Handler: Match Code to Concept
  const handleMatchSelect = (key: string, value: string) => {
    if (exerciseState === 'correct' || exerciseState === 'incorrect') return;
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
        title: sessionPhase === 'review' ? 'Matching reinforced!' : 'All concepts matched!',
        msg: currentBlock.explanation || 'You accurately paired each concept with its definition.'
      });
      if (sessionPhase === 'initial') {
        setFirstAttemptCorrectCount(prev => prev + 1);
      } else if (sessionPhase === 'review') {
        setReviewCorrectCount(prev => prev + 1);
        setWrongQuestions(prev => prev.map((q, idx) => idx === reviewIndex ? { ...q, isReviewCorrect: true } : q));
      }
    } else {
      sound.playError();
      setExerciseState('incorrect');
      setFeedbackMsg({
        title: 'Some matches are incorrect',
        msg: currentBlock.explanation || 'Review the correct mappings displayed below.'
      });

      if (sessionPhase === 'initial') {
        setWrongQuestions(prev => [
          ...prev,
          { block: currentBlock, userAnswer: JSON.stringify(matchedPairs), concept: currentBlock.concept }
        ]);
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
    }
  };

  // Handler: Trace Code Inputs and Verification
  const handleTraceInputChange = (stepIdx: number, val: string) => {
    if (exerciseState === 'correct' || exerciseState === 'incorrect') return;
    setTraceInputs(prev => ({ ...prev, [stepIdx]: val }));
  };

  const checkTraceAnswer = () => {
    const steps = currentBlock.traceSteps || [];
    if (steps.length === 0) return;

    let firstFailIndex = -1;
    let allPassed = true;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const userVal = (traceInputs[i] || '').trim();
      const expected = String(step.expectedValue).trim();
      if (userVal !== expected) {
        allPassed = false;
        if (firstFailIndex === -1) firstFailIndex = i;
      }
    }

    if (allPassed) {
      sound.playSuccess();
      setExerciseState('correct');
      setTraceFeedback({ checked: true, allPassed: true });
      setFeedbackMsg({
        title: sessionPhase === 'review' ? 'Variable trace mastered!' : 'Flawless Execution Trace!',
        msg: currentBlock.explanation || 'You accurately tracked the internal state of all variables across each line.'
      });
      if (sessionPhase === 'initial') {
        setFirstAttemptCorrectCount(prev => prev + 1);
      } else if (sessionPhase === 'review') {
        setReviewCorrectCount(prev => prev + 1);
        setWrongQuestions(prev => prev.map((q, idx) => idx === reviewIndex ? { ...q, isReviewCorrect: true } : q));
      }
    } else {
      sound.playError();
      setExerciseState('incorrect');
      const failedStep = steps[firstFailIndex];
      const failMsg = failedStep?.explanation || `On line ${failedStep?.lineNumber || firstFailIndex + 1}, ${failedStep?.variable} was expected to be "${failedStep?.expectedValue}", but got "${traceInputs[firstFailIndex] || ''}".`;
      setTraceFeedback({ checked: true, allPassed: false, failedIndex: firstFailIndex, message: failMsg });
      setFeedbackMsg({
        title: 'Trace State Mismatch',
        msg: failMsg,
        detail: currentBlock.explanation
      });

      if (sessionPhase === 'initial') {
        setWrongQuestions(prev => [
          ...prev,
          { block: currentBlock, userAnswer: JSON.stringify(traceInputs), concept: currentBlock.concept }
        ]);
        if (lessonMeta) {
          recordMistake({
            skillId: lessonMeta.skillId,
            lessonId: lessonMeta.id,
            mistakeType: currentBlock.misconceptionTag || 'VARIABLE_VALUE_CONFUSION',
            explanation: failMsg,
            userCode: JSON.stringify(traceInputs)
          });
        }
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
        input: t.input,
        assertionPython: (t as any).assertionPython
      }))
    };

    const res = await codeExecutionService.execute(code, challengePayload);
    setExecutionOutput(res.stdout || (res.error ? `Error: ${res.error}` : ''));
    setTestResults(res.testResults || []);

    if (res.success) {
      sound.playSuccess();
      setExerciseState('correct');
      setFeedbackMsg({
        title: sessionPhase === 'review' ? 'Code challenge mastered!' : 'Execution Successful!',
        msg: currentBlock.explanation || 'All tests passed and code executed cleanly.'
      });
      if (sessionPhase === 'initial') {
        setFirstAttemptCorrectCount(prev => prev + 1);
      } else if (sessionPhase === 'review') {
        setReviewCorrectCount(prev => prev + 1);
        setWrongQuestions(prev => prev.map((q, idx) => idx === reviewIndex ? { ...q, isReviewCorrect: true } : q));
      }
    } else {
      sound.playError();
      const newAttempts = debugAttempts + 1;
      setDebugAttempts(newAttempts);

      const isDebugExercise = currentBlock.type === 'fix_code';

      let title = res.diagnostic?.mistakeType ? `Diagnostic: ${res.diagnostic.mistakeType.replace(/_/g, ' ')}` : 'Tests Failed';
      let message = res.diagnostic?.message || res.error || 'Your code did not match expected requirements.';
      let detail = currentBlock.explanation || res.diagnostic?.fixSuggestion || 'Check the requirements and test results below.';

      // Attempt progression for debugging exercises
      if (isDebugExercise) {
        if (newAttempts === 1) {
          title = 'Attempt 1 of 3: Diagnostic Feedback';
          message = res.diagnostic?.message || res.error || 'A syntax or runtime issue was encountered.';
          detail = 'Examine the failing line and error message. Try correcting it!';
        } else if (newAttempts === 2) {
          title = 'Attempt 2 of 3: Targeted Hint';
          message = currentBlock.hint || 'Review operator syntax, colon placement, or variable types.';
          detail = res.diagnostic?.fixSuggestion || 'Keep going! Make sure comparison uses == and conditions end with :';
        } else {
          title = 'Attempt 3: Full Explanation';
          message = currentBlock.explanation || 'Review the expected fix explained below.';
          detail = 'Check the expected solution code displayed below to reinforce the pattern.';
        }
      }

      setExerciseState('incorrect');
      setFeedbackMsg({ title, msg: message, detail });

      if (sessionPhase === 'initial') {
        setWrongQuestions(prev => [
          ...prev,
          { block: currentBlock, userAnswer: code, concept: currentBlock.concept }
        ]);
        if (lessonMeta) {
          recordMistake({
            skillId: lessonMeta.skillId,
            lessonId: lessonMeta.id,
            mistakeType: currentBlock.misconceptionTag || res.diagnostic?.mistakeType || 'runtime_code_error',
            explanation: res.diagnostic?.message || 'Code execution did not pass verification.',
            userCode: code
          });
        }
      }
    }
  };

  // Handler: Advance through the lesson pipeline
  const handleNextStep = () => {
    sound.playClick();

    if (sessionPhase === 'initial') {
      if (currentBlockIndex < blocks.length - 1) {
        // Next question in initial 15-question round
        setCurrentBlockIndex(prev => prev + 1);
      } else {
        // Initial round complete! Check if any mistakes were made
        if (wrongQuestions.length > 0) {
          sound.playSuccess();
          setSessionPhase('review_intro');
        } else {
          // 15/15 correct on first attempt!
          sound.playSuccess();
          if (lessonMeta) completeLesson(lessonMeta.id, lessonMeta.xpReward);
          try {
            confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
          } catch {}
          setSessionPhase('completed');
        }
      }
    } else if (sessionPhase === 'review') {
      if (reviewIndex < wrongQuestions.length - 1) {
        // Next review question
        setReviewIndex(prev => prev + 1);
      } else {
        // Review round complete! Complete lesson with zero infinite loops
        sound.playSuccess();
        if (lessonMeta) completeLesson(lessonMeta.id, lessonMeta.xpReward);
        try {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
        } catch {}
        setSessionPhase('completed');
      }
    }
  };

  // Unique list of concepts to revisit
  const conceptsToRevisit = Array.from(
    new Set(
      wrongQuestions
        .map(q => q.concept || q.block.concept)
        .filter((c): c is string => Boolean(c))
    )
  );

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
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '20px', backgroundColor: '#FDFBF7' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '4px solid #E2D9CC',
            borderTopColor: 'var(--brand-primary, #4338CA)',
            animation: 'spin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            boxShadow: '0 4px 12px rgba(67, 56, 202, 0.15)'
          }}
        />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Forging Micro-Lesson...
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
          Synthesizing 15 interactions for {lessonMeta?.title || 'this challenge'}
        </p>
      </div>
    );
  }

  // Lesson Not Found / Empty Error State
  if (blocks.length === 0) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '20px', backgroundColor: '#FDFBF7', padding: '32px 20px', textAlign: 'center' }}>
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            border: '2px solid #FCA5A5',
            boxShadow: '0 4px 0 #F87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon name="alert-circle" size={40} style={{ color: '#EF4444' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Challenge Uncharted
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '0.95rem', lineHeight: 1.6 }}>
          We could not load curriculum items for lesson &ldquo;{lessonId}&rdquo;. You may need to complete prerequisite milestones first.
        </p>
        <Button variant="primary" size="lg" onClick={exitLesson}>
          Return to Pathway
        </Button>
      </div>
    );
  }

  // Review Intro Interstitial Screen
  if (sessionPhase === 'review_intro') {
    return (
      <div className="flex-center animate-pop-in" style={{ minHeight: '100vh', flexDirection: 'column', backgroundColor: '#FFFFFF', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="shadow-md">
          <Icon name="history" size={44} stroke={2.5} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Badge variant="warning" size="md">Review Stage</Badge>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Let's review what you missed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '28px', lineHeight: 1.5 }}>
          You completed all 15 initial questions. Now let's reinforce the <strong>{wrongQuestions.length} concept{wrongQuestions.length > 1 ? 's' : ''}</strong> you missed to lock in understanding.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ padding: '12px 20px', backgroundColor: '#F3F4F6', borderRadius: 'var(--radius-xl)', border: '1px solid #E5E7EB', fontWeight: 700, color: '#374151' }}>
            First Attempt Accuracy: {firstAttemptCorrectCount} / {blocks.length} ({Math.round(firstAttemptCorrectCount / blocks.length * 100)}%)
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            sound.playClick();
            setReviewIndex(0);
            setSessionPhase('review');
          }}
          icon={<Icon name="arrow-right" size={20} />}
          iconPosition="right"
          style={{ minWidth: '240px' }}
        >
          Start Review ({wrongQuestions.length})
        </Button>
      </div>
    );
  }

  // Completion Screen (Lesson Complete with Full Performance Breakdown)
  if (sessionPhase === 'completed' && lessonMeta) {
    const accuracy = blocks.length > 0 ? Math.round((firstAttemptCorrectCount / blocks.length) * 100) : 100;
    const isPerfect = wrongQuestions.length === 0;

    return (
      <div className="flex-center animate-pop-in" style={{ minHeight: '100vh', flexDirection: 'column', backgroundColor: '#FFFFFF', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ width: '92px', height: '92px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="shadow-lg">
          <Icon name="award" size={52} stroke={2.5} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Badge variant="brand" size="md">Lesson {lessonMeta.id} Complete</Badge>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
          {isPerfect ? 'Flawless Mastery!' : 'Lesson Complete!'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '28px', lineHeight: 1.5 }}>
          {isPerfect
            ? `Spectacular! You answered all ${blocks.length} questions correctly on your first attempt.`
            : `Great perseverance! You worked through all ${blocks.length} questions and reviewed missed concepts.`}
        </p>

        {/* Performance Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', maxWidth: '520px', width: '100%', marginBottom: '28px' }}>
          <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-xl)', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>First Attempt</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: accuracy >= 80 ? '#10B981' : '#F59E0B', marginTop: '4px' }}>
              {firstAttemptCorrectCount} / {blocks.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{accuracy}% Accuracy</div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-xl)', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mistakes Reviewed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isPerfect ? '#10B981' : '#3B82F6', marginTop: '4px' }}>
              {wrongQuestions.length > 0 ? `${reviewCorrectCount} / ${wrongQuestions.length}` : '0 Mistakes'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isPerfect ? 'Zero Mistakes' : 'Reinforced'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-xl)', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>XP Earned</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309', marginTop: '4px' }}>
              +{lessonMeta.xpReward} XP
            </div>
            <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '2px' }}>Progress Saved</div>
          </div>
        </div>

        {/* Concepts to Revisit Section */}
        {conceptsToRevisit.length > 0 && (
          <div style={{ maxWidth: '520px', width: '100%', marginBottom: '32px', textAlign: 'left', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-lg)', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Concepts To Revisit:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {conceptsToRevisit.map((concept, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {concept.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" size="lg" onClick={exitLesson} icon={<Icon name="arrow-right" size={20} />} iconPosition="right" style={{ minWidth: '240px' }}>
          Continue Learning
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
              {sessionPhase === 'review' && (
                <Badge variant="warning" size="sm">REVIEW REINFORCEMENT</Badge>
              )}
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

            {/* Selectable Options with Stitch DevRealm Tactile 3D Extrusion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(currentBlock.options || []).map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const letter = String.fromCharCode(65 + idx);

                let bgCol = '#FFFFFF';
                let borderCol = 'var(--border-default, #E5DDD0)';
                let bevelCol = '#E2D9CC';
                let textCol = 'var(--text-primary, #1E1B17)';
                let badgeBg = 'var(--bg-surface-subtle, #FAF6EE)';
                let badgeBorder = 'var(--border-default, #E5DDD0)';
                let badgeBevel = '#D5C9B7';
                let badgeColor = 'var(--text-secondary, #57534E)';

                if (exerciseState === 'correct' || exerciseState === 'incorrect') {
                  if (isSelected) {
                    if (opt.isCorrect) {
                      bgCol = '#ECFDF5';
                      borderCol = '#10B981';
                      bevelCol = '#047857';
                      textCol = '#065F46';
                      badgeBg = '#10B981';
                      badgeBorder = '#059669';
                      badgeBevel = '#047857';
                      badgeColor = '#FFFFFF';
                    } else {
                      bgCol = '#FEF2F2';
                      borderCol = '#EF4444';
                      bevelCol = '#991B1B';
                      textCol = '#991B1B';
                      badgeBg = '#EF4444';
                      badgeBorder = '#DC2626';
                      badgeBevel = '#991B1B';
                      badgeColor = '#FFFFFF';
                    }
                  } else if (opt.isCorrect && exerciseState === 'incorrect') {
                    // Clearly reveal correct answer in glowing emerald
                    borderCol = '#10B981';
                    bgCol = '#ECFDF5';
                    bevelCol = '#047857';
                    textCol = '#065F46';
                    badgeBg = '#10B981';
                    badgeBorder = '#059669';
                    badgeBevel = '#047857';
                    badgeColor = '#FFFFFF';
                  }
                } else if (isSelected) {
                  borderCol = 'var(--brand-primary, #4338CA)';
                  bgCol = 'var(--brand-light, #EEF2FF)';
                  bevelCol = '#312E81';
                  textCol = 'var(--brand-text, #312E81)';
                  badgeBg = 'var(--brand-primary, #4338CA)';
                  badgeBorder = '#312E81';
                  badgeBevel = '#1E1B4B';
                  badgeColor = '#FFFFFF';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    disabled={exerciseState === 'correct' || exerciseState === 'incorrect'}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-xl, 18px)',
                      border: `2px solid ${borderCol}`,
                      boxShadow: `0 4px 0 ${bevelCol}`,
                      backgroundColor: bgCol,
                      color: textCol,
                      textAlign: 'left',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: (exerciseState === 'correct' || exerciseState === 'incorrect') ? 'default' : 'pointer',
                      transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
                      userSelect: 'none'
                    }}
                    className={exerciseState === 'unanswered' || exerciseState === 'answering' ? 'hover-elevate' : ''}
                  >
                    <span
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        backgroundColor: badgeBg,
                        border: `1.5px solid ${badgeBorder}`,
                        boxShadow: `0 2px 0 ${badgeBevel}`,
                        color: badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {letter}
                    </span>
                    <span style={{ flex: 1, fontSize: '1rem', lineHeight: 1.45, fontFamily: 'var(--font-sans)' }}>{opt.text}</span>
                    {(exerciseState === 'correct' || exerciseState === 'incorrect') && (
                      opt.isCorrect ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                          <span>CORRECT</span>
                          <Icon name="check" size={22} stroke={3} />
                        </div>
                      ) : (
                        isSelected && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                            <span>MISSED</span>
                            <Icon name="x" size={22} stroke={3} />
                          </div>
                        )
                      )
                    )}
                  </button>
                );
              })}
            </div>

            {/* Repair Session for Predict Output, Reasoning & Misconceptions */}
            {exerciseState === 'incorrect' && currentBlock.repairQuestion && (
              <div
                className="animate-pop-in"
                style={{
                  marginTop: '24px',
                  backgroundColor: '#FEF3C7',
                  border: '2px solid #F59E0B',
                  borderRadius: 'var(--radius-xl, 16px)',
                  padding: '20px 24px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔧</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#92400E' }}>
                      CONCEPT REPAIR SESSION
                    </span>
                  </div>
                  {currentBlock.misconceptionTag && (
                    <span style={{
                      backgroundColor: '#FDE68A',
                      color: '#78350F',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700
                    }}>
                      {currentBlock.misconceptionTag}
                    </span>
                  )}
                </div>

                {/* Mental Model */}
                {currentBlock.mentalModel && (
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #FCD34D',
                    borderRadius: 'var(--radius-lg, 12px)',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    fontSize: '0.9rem',
                    color: '#78350F',
                    lineHeight: 1.5
                  }}>
                    💡 <strong>Mental Model:</strong> {currentBlock.mentalModel}
                  </div>
                )}

                {/* Repair Question */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #FCD34D',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '16px 20px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Repair Question (Verify Understanding):
                  </div>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.96rem' }}>
                    {currentBlock.repairQuestion.prompt}
                  </p>

                  {currentBlock.repairQuestion.codeSnippet && (
                    <div style={{
                      backgroundColor: '#1E1E1E',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: '#E2E8F0',
                      fontSize: '0.88rem'
                    }}>
                      <pre style={{ margin: 0 }}>{currentBlock.repairQuestion.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Repair Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {currentBlock.repairQuestion.options.map((rOpt: any) => {
                      const isRepairSelected = repairSelectedOptId === rOpt.id;
                      let rBg = isRepairSelected ? '#EEF2FF' : '#F9FAFB';
                      let rBorder = isRepairSelected ? 'var(--brand-primary, #4338CA)' : '#E5E7EB';

                      if (repairAnswerChecked) {
                        if (rOpt.isCorrect) {
                          rBg = '#ECFDF5';
                          rBorder = '#10B981';
                        } else if (isRepairSelected) {
                          rBg = '#FEF2F2';
                          rBorder = '#EF4444';
                        }
                      }

                      return (
                        <button
                          key={rOpt.id}
                          onClick={() => {
                            if (!repairAnswerChecked) {
                              sound.playClick();
                              setRepairSelectedOptId(rOpt.id);
                            }
                          }}
                          disabled={repairAnswerChecked}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1.5px solid ${rBorder}`,
                            backgroundColor: rBg,
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            cursor: repairAnswerChecked ? 'default' : 'pointer'
                          }}
                        >
                          {rOpt.text}
                        </button>
                      );
                    })}
                  </div>

                  {/* Repair Verification / Status */}
                  {!repairAnswerChecked ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!repairSelectedOptId}
                      onClick={handleVerifyRepair}
                    >
                      Verify Repair Answer
                    </Button>
                  ) : (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: repairIsCorrect ? '#ECFDF5' : '#FEF2F2',
                      border: `1px solid ${repairIsCorrect ? '#A7F3D0' : '#FECACA'}`,
                      color: repairIsCorrect ? '#065F46' : '#991B1B',
                      fontSize: '0.86rem',
                      fontWeight: 600
                    }}>
                      {repairIsCorrect
                        ? '✓ Repair confirmed! You successfully corrected the misconception.'
                        : 'Review the correct answer highlighted in green above before continuing.'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      // 3. Fill In The Blank
      case 'fill_in_the_blank':
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Badge variant="brand" size="sm">FILL IN THE BLANK</Badge>
              {sessionPhase === 'review' && <Badge variant="warning" size="sm">REVIEW REINFORCEMENT</Badge>}
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
                  onChange={(e) => setBlankAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && blankAnswer.trim() && exerciseState !== 'correct' && exerciseState !== 'incorrect') {
                      checkBlankAnswer();
                    }
                  }}
                  placeholder="e.g. print, len, while, [x * 2]..."
                  disabled={exerciseState === 'correct' || exerciseState === 'incorrect'}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-lg, 12px)',
                    border: `2px solid ${exerciseState === 'incorrect' ? '#EF4444' : (exerciseState === 'correct' ? '#10B981' : 'var(--border-default, #E5E7EB)')}`,
                    backgroundColor: exerciseState === 'incorrect' ? '#FEF2F2' : (exerciseState === 'correct' ? '#ECFDF5' : '#FFFFFF'),
                    fontSize: '1.05rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Reveal Correct Answer Immediately if Incorrect */}
              {exerciseState === 'incorrect' && (
                <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)', color: '#065F46' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Correct Expected Answer:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                    {getCorrectAnswerDisplay(currentBlock)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // 4. Code Ordering
      case 'code_ordering':
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Badge variant="brand" size="sm">CODE ORDERING</Badge>
              {sessionPhase === 'review' && <Badge variant="warning" size="sm">REVIEW REINFORCEMENT</Badge>}
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

                  {exerciseState !== 'correct' && exerciseState !== 'incorrect' && (
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

            {/* Reveal Correct Order Immediately if Incorrect */}
            {exerciseState === 'incorrect' && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Correct Execution Sequence:
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono, monospace)', color: '#065F46', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {getCorrectAnswerDisplay(currentBlock)}
                </div>
              </div>
            )}
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
              {sessionPhase === 'review' && <Badge variant="warning" size="sm">REVIEW REINFORCEMENT</Badge>}
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
                          disabled={exerciseState === 'correct' || exerciseState === 'incorrect'}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #10B981' : '1px solid #E5E7EB',
                            backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: (exerciseState === 'correct' || exerciseState === 'incorrect') ? 'default' : 'pointer'
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

            {/* Reveal Correct Matches Immediately if Incorrect */}
            {exerciseState === 'incorrect' && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Correct Concept Pairings:
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: '#065F46', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {getCorrectAnswerDisplay(currentBlock)}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Trace Code (Line-by-line variable state tracking)
      case 'trace_code': {
        const traceSteps = currentBlock.traceSteps || [];
        return (
          <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <Badge variant="brand" size="sm">VARIABLE TRACE</Badge>
              {sessionPhase === 'review' && <Badge variant="warning" size="sm">REVIEW REINFORCEMENT</Badge>}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Track the value of each variable line by line as code executes
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            <div style={{ backgroundColor: 'var(--bg-app, #F9FAFB)', padding: '20px 24px', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid var(--border-default, #E5E7EB)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
                Trace Execution Table
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {traceSteps.map((step, idx) => {
                  const userVal = traceInputs[idx] || '';
                  const isChecked = traceFeedback?.checked;
                  const isStepCorrect = isChecked && userVal.trim() === String(step.expectedValue).trim();
                  const isStepIncorrect = isChecked && !isStepCorrect;

                  let borderColor = '#E5E7EB';
                  let bgColor = '#FFFFFF';
                  if (isChecked) {
                    if (isStepCorrect) {
                      borderColor = '#10B981';
                      bgColor = '#ECFDF5';
                    } else if (isStepIncorrect) {
                      borderColor = '#EF4444';
                      bgColor = '#FEF2F2';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-lg, 12px)',
                        border: `1.5px solid ${borderColor}`,
                        backgroundColor: bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#1E1E1E',
                          color: '#A7F3D0',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.78rem',
                          borderRadius: '6px'
                        }}>
                          Line {step.lineNumber || idx + 1}
                        </span>
                        <code style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {step.codeLine}
                        </code>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          Value of <strong>{step.variable}</strong>:
                        </span>
                        <input
                          type="text"
                          value={userVal}
                          onChange={(e) => handleTraceInputChange(idx, e.target.value)}
                          disabled={exerciseState === 'correct' || exerciseState === 'incorrect'}
                          placeholder="?"
                          style={{
                            width: '80px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1.5px solid ${isStepIncorrect ? '#EF4444' : (isStepCorrect ? '#10B981' : '#D1D5DB')}`,
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                        {isChecked && (
                          isStepCorrect ? (
                            <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                          ) : (
                            <span style={{ color: '#EF4444', fontWeight: 800 }}>✗ ({step.expectedValue})</span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {exerciseState === 'incorrect' && (
                <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)', color: '#065F46' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Trace Explanation:</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {currentBlock.explanation || 'Review each step carefully. Variables hold their updated state from preceding lines.'}
                  </div>
                </div>
              )}
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
                {sessionPhase === 'review' && <Badge variant="warning" size="sm">REVIEW REINFORCEMENT</Badge>}
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
                  disabled={exerciseState === 'correct' || exerciseState === 'incorrect'}
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
                    if (exerciseState !== 'correct' && exerciseState !== 'incorrect') {
                      setCode(val || '');
                    }
                  }}
                  theme="light"
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    fontSize: 14,
                    wordWrap: 'on',
                    tabSize: 4,
                    scrollBeyondLastLine: false,
                    readOnly: exerciseState === 'correct' || exerciseState === 'incorrect',
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

            {/* Structured Test Results / Assertions */}
            {testResults.length > 0 && (
              <div style={{
                marginTop: '16px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid var(--border-default, #E5E7EB)',
                borderRadius: 'var(--radius-lg, 12px)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Test Cases ({testResults.filter(t => t.passed).length} / {testResults.length} Passed)
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testResults.map((t, idx) => (
                    <div
                      key={t.testId || idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: t.passed ? '#ECFDF5' : '#FEF2F2',
                        border: `1px solid ${t.passed ? '#A7F3D0' : '#FECACA'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          color: t.passed ? '#10B981' : '#EF4444',
                          fontWeight: 800,
                          fontSize: '1rem'
                        }}>
                          {t.passed ? '✓' : '✗'}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: t.passed ? '#065F46' : '#991B1B'
                        }}>
                          {t.description}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: t.passed ? '#059669' : '#DC2626'
                      }}>
                        {t.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reveal Solution Code: for regular questions on incorrect, or for fix_code only on Attempt 3+ */}
            {exerciseState === 'incorrect' && currentBlock.solutionCode && (currentBlock.type !== 'fix_code' || debugAttempts >= 3) && (
              <div style={{ marginTop: '16px', backgroundColor: '#1E1E1E', border: '1px solid #10B981', borderRadius: 'var(--radius-lg, 12px)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Expected Solution Code:
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'monospace' }}>python</span>
                </div>
                <pre style={{ margin: 0, color: '#A7F3D0', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {currentBlock.solutionCode}
                </pre>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unsupported block type {currentBlock.type}</div>;
    }
  };

  // Bottom Fixed Drawer with Stitch DevRealm Odyssey Tactile Actions
  const renderFooter = () => {
    let footerBg = '#FFFFFF';
    let borderColor = 'var(--border-default, #E5DDD0)';
    let drawerShadow = '0 -4px 16px rgba(30, 27, 23, 0.05)';

    if (exerciseState === 'correct') {
      footerBg = '#ECFDF5';
      borderColor = '#10B981';
      drawerShadow = '0 -6px 24px rgba(16, 185, 129, 0.15)';
    } else if (exerciseState === 'incorrect') {
      footerBg = '#FEF2F2';
      borderColor = '#EF4444';
      drawerShadow = '0 -6px 24px rgba(239, 68, 68, 0.15)';
    }

    const isCodingType = currentBlock.type === 'write_code' || currentBlock.type === 'fix_code' || currentBlock.type === 'mini_challenge' || currentBlock.type === 'refactoring_challenge';
    const isBlankType = currentBlock.type === 'fill_in_the_blank';
    const isOrderingType = currentBlock.type === 'code_ordering';
    const isMatchingType = currentBlock.type === 'match_code_to_concept';
    const isTraceType = currentBlock.type === 'trace_code';
    const isExplanation = currentBlock.type === 'explanation' || currentBlock.type === 'code_example';

    const traceStepsCount = (currentBlock.traceSteps || []).length;
    const isTraceFilled = traceStepsCount > 0 && traceStepsCount === Object.keys(traceInputs).filter(k => (traceInputs[Number(k)] || '').trim() !== '').length;

    // When exercise is in correct OR incorrect state, CONTINUE is the default action!
    const isAnswerChecked = exerciseState === 'correct' || exerciseState === 'incorrect' || exerciseState === 'completed';

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: footerBg,
          borderTop: `2px solid ${borderColor}`,
          padding: '16px 20px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: drawerShadow,
          transition: 'background-color 150ms ease, border-color 150ms ease'
        }}
        aria-live="polite"
      >
        <div style={{ width: '100%', maxWidth: '820px' }}>
          {/* Feedback Section */}
          {(exerciseState === 'correct' || exerciseState === 'incorrect') && (
            <div className="animate-pop-in" style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  flexShrink: 0,
                  backgroundColor: exerciseState === 'correct' ? '#10B981' : '#EF4444',
                  border: `2px solid ${exerciseState === 'correct' ? '#059669' : '#DC2626'}`,
                  boxShadow: `0 3px 0 ${exerciseState === 'correct' ? '#047857' : '#991B1B'}`,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name={exerciseState === 'correct' ? 'check' : 'x'} size={26} stroke={3.5} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: exerciseState === 'correct' ? '#065F46' : '#991B1B' }}>
                  {feedbackMsg.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: exerciseState === 'correct' ? '#047857' : '#7F1D1D', lineHeight: 1.45, fontWeight: 500 }}>
                  {feedbackMsg.msg}
                </p>
                {feedbackMsg.detail && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: exerciseState === 'correct' ? '#065F46' : '#991B1B', fontWeight: 600 }}>
                    💡 {feedbackMsg.detail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Button Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {exerciseState === 'incorrect' && currentBlock.type === 'fix_code' && debugAttempts < 3 ? (
              <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '440px', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setExerciseState('unanswered')}
                  style={{ flex: 1 }}
                >
                  TRY AGAIN (Attempt {debugAttempts + 1}/3)
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleNextStep}
                  style={{ flex: 1 }}
                >
                  CONTINUE
                </Button>
              </div>
            ) : isExplanation || isAnswerChecked ? (
              <Button
                variant={exerciseState === 'incorrect' ? 'danger' : 'success'}
                size="lg"
                onClick={handleNextStep}
                fullWidth
                style={{ maxWidth: '300px' }}
              >
                {exerciseState === 'incorrect' ? 'GOT IT, CONTINUE' : 'CONTINUE (+20 XP)'}
              </Button>
            ) : isCodingType ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleRunCode}
                isLoading={exerciseState === 'validating'}
                disabled={code.trim() === ''}
                fullWidth
                style={{ maxWidth: '300px' }}
              >
                RUN CODE
              </Button>
            ) : isTraceType ? (
              <Button
                variant="primary"
                size="lg"
                onClick={checkTraceAnswer}
                disabled={!isTraceFilled}
                fullWidth
                style={{ maxWidth: '300px' }}
              >
                CHECK TRACE VALUES
              </Button>
            ) : isBlankType ? (
              <Button
                variant="primary"
                size="lg"
                onClick={checkBlankAnswer}
                disabled={blankAnswer.trim() === ''}
                fullWidth
                style={{ maxWidth: '300px' }}
              >
                CHECK ANSWER
              </Button>
            ) : isOrderingType ? (
              <Button
                variant="primary"
                size="lg"
                onClick={checkOrderingAnswer}
                fullWidth
                style={{ maxWidth: '300px' }}
              >
                CHECK ORDER
              </Button>
            ) : isMatchingType ? (
              <Button
                variant="primary"
                size="lg"
                onClick={checkMatchAnswer}
                fullWidth
                style={{ maxWidth: '300px' }}
              >
                CHECK MATCHES
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={checkOptionAnswer}
                disabled={!selectedOptionId}
                fullWidth
                style={{ maxWidth: '300px' }}
              >
                CHECK ANSWER
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Header Title & Progress Computation
  const currentTotal = sessionPhase === 'review' ? wrongQuestions.length : blocks.length;
  const currentStep = sessionPhase === 'review' ? reviewIndex + 1 : currentBlockIndex + 1;
  const progressPercentage = currentTotal > 0 ? Math.round((currentStep / currentTotal) * 100) : 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app, #FDFBF7)' }}>
      {/* Top Header */}
      <header
        style={{
          height: '68px',
          borderBottom: '1.5px solid var(--border-default, #E5DDD0)',
          boxShadow: '0 2px 0 var(--border-subtle, #F2EBE1)',
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
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-subtle, #FAF6EE)',
            border: '1.5px solid var(--border-default, #E5DDD0)',
            boxShadow: '0 2px 0 var(--border-default, #E5DDD0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Exit to learning path"
        >
          <Icon name="x" size={20} stroke={2.5} />
        </button>

        <div style={{ flex: 1, maxWidth: '520px', margin: '0 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-secondary)' }}>
            <span>{sessionPhase === 'review' ? `Reviewing Mistakes (${lessonMeta.title})` : lessonMeta.title}</span>
            <span style={{ color: 'var(--brand-primary)' }}>{currentStep} of {currentTotal}</span>
          </div>
          <ProgressBar progress={progressPercentage} height={12} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              backgroundColor: '#EFF6FF',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid #BFDBFE',
              color: '#1D4ED8',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.78rem'
            }}
          >
            <Icon name="shield" size={14} fill="#BFDBFE" />
            <span>Shield Active</span>
          </div>
        </div>
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
