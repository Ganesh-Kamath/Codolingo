import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { fireCelebrationConfetti } from '../utils/confetti';
import { useApp } from '../context/AppContext';
import { Lesson, LessonBlock, Challenge, TestResult } from '../types';
import { courseService } from '../services/courseService';
import { codeExecutionService } from '../services/codeExecutionService';
import { sound } from '../utils/audio';
import { Icon } from '../components/ui/Icon';
import { Button, ProgressBar, Badge, Modal, IconButton, SortableCodeList } from '../components/common';
import { formatMisconceptionTag } from '../utils/formatters';

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
  const { course, userProgress, reducedMotion, navigateTo, exitLesson, completeLesson, recordMistake, theme } = useApp();

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

  // Load selected blocks asynchronously or from pre-indexed store
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'not_found' | 'error'>('loading');
  const [loadErrorReason, setLoadErrorReason] = useState<string>('');
  const [loadingSlow, setLoadingSlow] = useState<boolean>(false);
  const [reloadCounter, setReloadCounter] = useState<number>(0);

  // Lesson Progression Flow State
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('initial');
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestionRecord[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [firstAttemptCorrectCount, setFirstAttemptCorrectCount] = useState<number>(0);
  const [reviewCorrectCount, setReviewCorrectCount] = useState<number>(0);
  const [isCompletionRecorded, setIsCompletionRecorded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoadStatus('loading');
    setLoadingSlow(false);
    setShowExitModal(false);

    const slowTimer = setTimeout(() => {
      if (isMounted) setLoadingSlow(true);
    }, 10000);

    if (typeof window !== 'undefined' && (window as any).__SIMULATE_LOAD_ERROR) {
      clearTimeout(slowTimer);
      setBlocks([]);
      setLoadStatus('error');
      setLoadErrorReason('Failed to load lesson blocks: Simulated network connection error.');
      return;
    }

    if (typeof window !== 'undefined' && (window as any).__SIMULATE_UNSUPPORTED_TYPE && lessonMeta) {
      clearTimeout(slowTimer);
      setBlocks([{
        id: 'unsupported_test',
        type: 'quantum_code_circuit' as any,
        title: 'Quantum Circuit Simulator',
        explanation: 'Interactive qubit entanglement challenge'
      }]);
      setCurrentBlockIndex(0);
      setWrongQuestions([]);
      setReviewIndex(0);
      setFirstAttemptCorrectCount(0);
      setReviewCorrectCount(0);
      setIsCompletionRecorded(false);
      setSessionPhase('initial');
      setLoadStatus('ok');
      return;
    }

    courseService.resolveLessonBlocks('python', lessonId).then((result) => {
      if (!isMounted) return;
      clearTimeout(slowTimer);

      if (result.status === 'ok' && result.blocks.length > 0 && lessonMeta) {
        setBlocks(result.blocks);
        setCurrentBlockIndex(0);
        setWrongQuestions([]);
        setReviewIndex(0);
        setFirstAttemptCorrectCount(0);
        setReviewCorrectCount(0);
        setIsCompletionRecorded(false);
        setSessionPhase('initial');
        setLoadStatus('ok');
      } else if (result.status === 'not_found' || result.blocks.length === 0 || !lessonMeta) {
        setBlocks([]);
        setLoadStatus('not_found');
        setLoadErrorReason(result.reason || `Lesson "${lessonId}" could not be found.`);
      } else {
        setBlocks([]);
        setLoadStatus('error');
        setLoadErrorReason(result.reason || `Failed to load lesson "${lessonId}".`);
      }
    }).catch((err) => {
      if (!isMounted) return;
      clearTimeout(slowTimer);
      console.error('Failed to load blocks for lesson', lessonId, err);
      setBlocks([]);
      setLoadStatus('error');
      setLoadErrorReason(err?.message || 'Unexpected network or runtime error.');
    });

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
    };
  }, [lessonId, reloadCounter]);

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
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
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

  // Phase 2 Interactive Upgrades: Exit Modal, Keyboard Nav, XP Animation & Diagnostics
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [lessonStartTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [displayedXp, setDisplayedXp] = useState<number>(0);
  const [isEngineWarming, setIsEngineWarming] = useState<boolean>(false);
  const [expandedTests, setExpandedTests] = useState<Record<number, boolean>>({});
  const [monacoLoaded, setMonacoLoaded] = useState<boolean>(false);
  const [monacoTimedOut, setMonacoTimedOut] = useState<boolean>(false);
  const [showCoachMarks, setShowCoachMarks] = useState<boolean>(false);

  // Reset overlay & modal states on lessonId change
  useEffect(() => {
    setShowExitModal(false);
    setShowCoachMarks(false);
  }, [lessonId]);

  // Monaco 8s timeout watchdog for coding questions
  useEffect(() => {
    setMonacoTimedOut(false);
    setMonacoLoaded(false);
    const isCoding = currentBlock.type === 'write_code' || currentBlock.type === 'fix_code' || currentBlock.type === 'mini_challenge' || currentBlock.type === 'refactoring_challenge';
    if (!isCoding) return;

    const timer = setTimeout(() => {
      setMonacoTimedOut(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [currentBlockIndex, sessionPhase, currentBlock.type]);

  // Calculate elapsed time upon completion
  useEffect(() => {
    if (sessionPhase === 'completed') {
      const elapsed = Math.max(1, Math.floor((Date.now() - lessonStartTime) / 1000));
      setElapsedSeconds(elapsed);
    }
  }, [sessionPhase, lessonStartTime]);

  // Animated count-up for XP upon completion
  useEffect(() => {
    if (sessionPhase === 'completed' && lessonMeta) {
      const target = lessonMeta.xpReward;
      const isMotionReduced = reducedMotion || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (isMotionReduced) {
        setDisplayedXp(target);
        return;
      }
      let start = 0;
      const duration = 1000;
      const interval = 25;
      const step = Math.max(1, Math.ceil(target / (duration / interval)));
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setDisplayedXp(target);
          clearInterval(timer);
        } else {
          setDisplayedXp(start);
        }
      }, interval);
      return () => clearInterval(timer);
    }
  }, [sessionPhase, lessonMeta, reducedMotion]);

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

  // Keyboard-first listener: Enter=Check/Continue, 1-4=Select Option, Esc=Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExitModal) return;

      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest('.monaco-editor'))
      );

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowExitModal(true);
        return;
      }

      if (isInput) return;

      // 1-4 option selection for multiple choice
      if (['1', '2', '3', '4'].includes(e.key) && currentBlock.options && currentBlock.options.length > 0) {
        const optIdx = parseInt(e.key, 10) - 1;
        if (optIdx >= 0 && optIdx < currentBlock.options.length) {
          e.preventDefault();
          handleOptionSelect(currentBlock.options[optIdx].id);
          return;
        }
      }

      // Enter for Check / Continue
      if (e.key === 'Enter') {
        e.preventDefault();
        if (exerciseState === 'correct' || exerciseState === 'incorrect' || exerciseState === 'completed') {
          handleNextStep();
        } else if (exerciseState === 'answering' || currentBlock.type === 'fill_in_the_blank' || currentBlock.type === 'code_ordering' || currentBlock.type === 'match_code_to_concept' || currentBlock.type === 'trace_code') {
          if (currentBlock.type === 'fill_in_the_blank') checkBlankAnswer();
          else if (currentBlock.type === 'code_ordering') checkOrderingAnswer();
          else if (currentBlock.type === 'match_code_to_concept') checkMatchAnswer();
          else if (currentBlock.type === 'trace_code') checkTraceAnswer();
          else if (selectedOptionId) checkOptionAnswer();
        } else if (['write_code', 'fix_code', 'mini_challenge', 'refactoring_challenge'].includes(currentBlock.type)) {
          handleRunCode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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

    const warmTimer = setTimeout(() => {
      setIsEngineWarming(true);
    }, 450);

    const res = await codeExecutionService.execute(code, challengePayload);
    clearTimeout(warmTimer);
    setIsEngineWarming(false);
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
          // All correct on first attempt!
          sound.playSuccess();
          if (!isCompletionRecorded && lessonMeta) {
            setIsCompletionRecorded(true);
            completeLesson(lessonMeta.id, lessonMeta.xpReward, {
              firstAttemptCorrectCount: blocks.length,
              totalQuestions: blocks.length,
              hintsUsed: hintsUsedCount,
              unresolvedMistakesCount: 0
            });
          }
          // Confetti restraint: only on accuracy >= 80, unit completion (e.g. 1.6, 2.7, 3.5, 4.4, 5.6, 6.8), or streak milestone
          const isStreakMilestone = [3, 7, 14, 30].includes(userProgress.streak + 1);
          const isUnitCapstone = ['1.6', '2.7', '3.5', '4.4', '5.6', '6.8'].includes(lessonMeta?.id || '');
          if (isUnitCapstone || isStreakMilestone || true) { // 100% accuracy here is >= 80%
            try {
              fireCelebrationConfetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
            } catch {}
          }
          setSessionPhase('completed');
        }
      }
    } else if (sessionPhase === 'review') {
      if (reviewIndex < wrongQuestions.length - 1) {
        // Next review question
        setReviewIndex(prev => prev + 1);
      } else {
        // Review round complete! Check if any review questions are still unresolved
        const unmastered = wrongQuestions.filter(q => !q.isReviewCorrect);
        if (unmastered.length > 0) {
          // Re-queue remaining unmastered questions
          setWrongQuestions(unmastered);
          setReviewIndex(0);
          setExerciseState('unanswered');
          setFeedbackMsg({ title: '', msg: '' });
          return;
        }

        sound.playSuccess();
        const finalAccuracy = blocks.length > 0 ? Math.round((firstAttemptCorrectCount / blocks.length) * 100) : 100;
        if (!isCompletionRecorded && lessonMeta) {
          setIsCompletionRecorded(true);
          completeLesson(lessonMeta.id, lessonMeta.xpReward, {
            firstAttemptCorrectCount,
            totalQuestions: blocks.length,
            hintsUsed: hintsUsedCount,
            unresolvedMistakesCount: wrongQuestions.length
          });
        }
        // Confetti restraint: only when accuracy >= 80%, unit completion, or streak milestone (never on low accuracy)
        const isStreakMilestone = [3, 7, 14, 30].includes(userProgress.streak + 1);
        const isUnitCapstone = ['1.6', '2.7', '3.5', '4.4', '5.6', '6.8'].includes(lessonMeta?.id || '');
        if (finalAccuracy >= 80 || isUnitCapstone || isStreakMilestone) {
          try {
            fireCelebrationConfetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
          } catch {}
        }
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

  // 1. Loading Screen (Themed with Lesson-Shaped Skeleton & Timeout Guidance)
  if (loadStatus === 'loading') {
    return (
      <div
        className="flex-center"
        style={{
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '24px',
          backgroundColor: 'var(--bg-app)',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid var(--border-default)',
            borderTopColor: 'var(--brand-primary)',
            animation: 'spin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            boxShadow: 'var(--shadow-md)'
          }}
        />
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Getting your lesson ready...
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, maxWidth: '420px', lineHeight: 1.5 }}>
            Synthesizing interactive challenge sequence for {lessonMeta?.title ? `"${lessonMeta.title}"` : `Lesson ${lessonId}`}
          </p>
        </div>

        {/* 10s Slow Loading Hint & Retry */}
        {loadingSlow && (
          <div
            className="animate-pop-in"
            style={{
              marginTop: '12px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)',
              maxWidth: '440px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', color: 'var(--warning-solid)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Icon name="alert-triangle" size={16} />
              <span>This is taking longer than usual</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              The runtime may be assembling curriculum resources. You can wait or retry loading now.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setReloadCounter(c => c + 1)}
                icon={<Icon name="reload" size={14} />}
              >
                Retry
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={exitLesson}
              >
                Back to Path
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Not Found Screen
  if (loadStatus === 'not_found' || !lessonMeta) {
    return (
      <div
        className="flex-center"
        style={{
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: 'var(--bg-app)',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-light)',
            border: '2px solid var(--brand-border)',
            color: 'var(--brand-primary)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon name="compass" size={40} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          We couldn't find this lesson
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          We could not locate curriculum content for lesson &ldquo;{lessonId}&rdquo;. It may not exist yet or may have been relocated.
        </p>
        <Button variant="primary" size="lg" onClick={exitLesson} icon={<Icon name="arrow-left" size={18} />}>
          Back to Learning Path
        </Button>
      </div>
    );
  }

  // 3. Load Error Screen
  if (loadStatus === 'error' || blocks.length === 0) {
    return (
      <div
        className="flex-center"
        style={{
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: 'var(--bg-app)',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: 'var(--error-bg)',
            border: '2px solid var(--error-border)',
            color: 'var(--error-solid)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon name="alert-circle" size={40} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Unable to Load Lesson
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          {loadErrorReason || `An error occurred while forging exercises for lesson "${lessonId}".`}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setReloadCounter(c => c + 1)}
            icon={<Icon name="reload" size={18} />}
          >
            Try Again
          </Button>
          <Button variant="secondary" size="lg" onClick={exitLesson}>
            Back to Path
          </Button>
        </div>
      </div>
    );
  }

  // 4. Review Intro Interstitial Screen (Themed)
  if (sessionPhase === 'review_intro') {
    return (
      <div className="flex-center animate-pop-in" style={{ minHeight: '100vh', flexDirection: 'column', backgroundColor: 'var(--bg-app)', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-solid)', border: '2px solid var(--warning-border)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="shadow-md">
          <Icon name="history" size={44} stroke={2.5} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Badge variant="warning" size="md">Review Stage</Badge>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Let's review what you missed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '28px', lineHeight: 1.5 }}>
          You completed all initial questions. Now let's reinforce the <strong>{wrongQuestions.length} concept{wrongQuestions.length > 1 ? 's' : ''}</strong> you missed to lock in understanding.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', fontWeight: 700, color: 'var(--text-primary)' }}>
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
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return (
      <div className="flex-center animate-pop-in" style={{ minHeight: '100vh', flexDirection: 'column', backgroundColor: 'var(--bg-app)', padding: '40px 20px', textAlign: 'center' }}>
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            backgroundColor: 'var(--state-success-subtle)',
            color: 'var(--state-success)',
            border: '2px solid var(--state-success)',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="animate-bounce"
        >
          <Icon name="award" size={54} stroke={2.5} />
        </div>

        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Badge variant="brand" size="md">Lesson {lessonMeta.id} Complete</Badge>
          {isPerfect && <Badge variant="success" size="md">Flawless 100%</Badge>}
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {isPerfect ? 'Flawless Mastery!' : 'Lesson Complete!'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '20px', lineHeight: 1.5 }}>
          {isPerfect
            ? `Spectacular! You answered all ${blocks.length} questions correctly on your first attempt.`
            : `Great perseverance! You mastered all ${blocks.length} interactions and reinforced your understanding.`}
        </p>

        {/* Streak Status Line */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
          <Icon name="flame" size={18} color="var(--state-warning)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {userProgress.streak > 1 ? `${userProgress.streak}-day streak active` : '1-day streak started!'}
          </span>
        </div>

        {/* Performance Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', maxWidth: '580px', width: '100%', marginBottom: '28px' }}>
          {/* XP Card */}
          <div style={{
            padding: '18px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--state-warning-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--state-warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              XP Earned
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--state-warning)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              +{displayedXp} XP
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Icon name="coin" size={14} /> Banked
            </div>
          </div>

          {/* Accuracy Card */}
          <div style={{
            padding: '18px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accuracy
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: accuracy >= 80 ? 'var(--state-success)' : 'var(--state-warning)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {firstAttemptCorrectCount}/{blocks.length} First Try
            </div>
          </div>

          {/* Time Card */}
          <div style={{
            padding: '18px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Time Taken
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-primary)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              {timeDisplay}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Focus Time
            </div>
          </div>

          {/* Review Card - Clickable deep link to Fix-It Lab */}
          <div
            onClick={() => {
              if (wrongQuestions.length > 0) {
                navigateTo('/app/review');
              }
            }}
            role={wrongQuestions.length > 0 ? 'button' : undefined}
            tabIndex={wrongQuestions.length > 0 ? 0 : undefined}
            onKeyDown={(e) => {
              if (wrongQuestions.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
                navigateTo('/app/review');
              }
            }}
            title={wrongQuestions.length > 0 ? 'Click to open Fix-It Lab' : undefined}
            style={{
              padding: '18px 14px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: wrongQuestions.length > 0 ? '1.5px solid var(--state-warning-border)' : '1.5px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              cursor: wrongQuestions.length > 0 ? 'pointer' : 'default',
              transition: 'transform var(--transition-fast)'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: wrongQuestions.length > 0 ? 'var(--state-warning)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reviews {wrongQuestions.length > 0 && '⚡'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isPerfect ? 'var(--state-success)' : 'var(--brand-primary)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              {wrongQuestions.length > 0 ? `${reviewCorrectCount}/${wrongQuestions.length}` : '0'}
            </div>
            <div style={{ fontSize: '0.75rem', color: wrongQuestions.length > 0 ? 'var(--brand-primary)' : 'var(--text-secondary)', marginTop: '2px', fontWeight: wrongQuestions.length > 0 ? 600 : 400 }}>
              {isPerfect ? 'Zero Mistakes' : 'Fix-It Lab →'}
            </div>
          </div>
        </div>

        {/* Concepts to Revisit Section */}
        {conceptsToRevisit.length > 0 && (
          <div style={{ maxWidth: '580px', width: '100%', marginBottom: '32px', textAlign: 'left', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', border: '1.5px solid var(--border-default)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="history" size={16} /> Concepts Needing Attention:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {conceptsToRevisit.map((concept, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--brand-light)',
                    color: 'var(--brand-text)',
                    border: '1px solid var(--border-subtle)',
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const first = conceptsToRevisit[0];
                navigateTo(first ? `/app/review?drill=${encodeURIComponent(first)}` : '/app/review');
              }}
              icon={<Icon name="tool" size={15} />}
            >
              Repair in Fix-It Lab
            </Button>
          </div>
        )}

        <Button
          variant="success"
          size="lg"
          onClick={exitLesson}
          icon={<Icon name="arrow-right" size={20} />}
          iconPosition="right"
          style={{ minWidth: '260px' }}
        >
          Continue to Pathway
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
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '28px', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid var(--border-default)' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.contentMarkdown)}
            </div>
          </div>
        );

      // 2. Multiple Choice, Output Prediction, Code Prediction, Error Diagnosis, Scenario, Trace
      case 'multiple_choice':
      case 'output_prediction':
      case 'predict_output':
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
            <div style={{ marginBottom: '20px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            {/* Code Snippet (if provided separately) */}
            {currentBlock.codeSnippet && !((currentBlock.content || currentBlock.prompt || '').includes(currentBlock.codeSnippet)) && (
              <div style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 'var(--radius-lg, 12px)',
                padding: '16px 20px',
                marginBottom: '20px',
                border: '1px solid #334155',
                overflowX: 'auto',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>python</div>
                <pre style={{ margin: 0, color: '#F8FAFC', fontFamily: 'var(--font-mono)', fontSize: '0.94rem', lineHeight: 1.5 }}>
                  {currentBlock.codeSnippet}
                </pre>
              </div>
            )}

            {/* Selectable Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(currentBlock.options || []).map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const letter = String.fromCharCode(65 + idx);

                let bgCol = 'var(--bg-surface)';
                let borderCol = 'var(--border-default)';
                let bevelCol = 'var(--border-default)';
                let textCol = 'var(--text-primary)';
                let badgeBg = 'var(--bg-surface-subtle)';
                let badgeBorder = 'var(--border-default)';
                let badgeBevel = 'var(--border-default)';
                let badgeColor = 'var(--text-secondary)';

                if (exerciseState === 'correct' || exerciseState === 'incorrect') {
                  if (isSelected) {
                    if (opt.isCorrect) {
                      bgCol = 'var(--state-success-subtle)';
                      borderCol = 'var(--state-success)';
                      bevelCol = 'var(--state-success)';
                      textCol = 'var(--state-success)';
                      badgeBg = 'var(--state-success)';
                      badgeBorder = 'var(--state-success)';
                      badgeBevel = 'var(--state-success)';
                      badgeColor = '#FFFFFF';
                    } else {
                      bgCol = 'var(--state-error-subtle)';
                      borderCol = 'var(--state-error)';
                      bevelCol = 'var(--state-error)';
                      textCol = 'var(--state-error)';
                      badgeBg = 'var(--state-error)';
                      badgeBorder = 'var(--state-error)';
                      badgeBevel = 'var(--state-error)';
                      badgeColor = '#FFFFFF';
                    }
                  } else if (opt.isCorrect && exerciseState === 'incorrect') {
                    // Clearly reveal correct answer in glowing emerald
                    borderCol = 'var(--state-success)';
                    bgCol = 'var(--state-success-subtle)';
                    bevelCol = 'var(--state-success)';
                    textCol = 'var(--state-success)';
                    badgeBg = 'var(--state-success)';
                    badgeBorder = 'var(--state-success)';
                    badgeBevel = 'var(--state-success)';
                    badgeColor = '#FFFFFF';
                  }
                } else if (isSelected) {
                  borderCol = 'var(--brand-primary)';
                  bgCol = 'var(--brand-light)';
                  bevelCol = 'var(--brand-hover)';
                  textCol = 'var(--brand-text)';
                  badgeBg = 'var(--brand-primary)';
                  badgeBorder = 'var(--brand-hover)';
                  badgeBevel = 'var(--brand-hover)';
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
                    {exerciseState === 'unanswered' || exerciseState === 'answering' ? (
                      <kbd
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 7px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700
                        }}
                        className="desktop-only"
                      >
                        {idx + 1}
                      </kbd>
                    ) : null}
                    {(exerciseState === 'correct' || exerciseState === 'incorrect') && (
                      opt.isCorrect ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--state-success)', fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                          <span>CORRECT</span>
                          <Icon name="check" size={22} stroke={3} />
                        </div>
                      ) : (
                        isSelected && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--state-error)', fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
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
                    <Icon name="tool" size={18} style={{ color: '#92400E' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#92400E' }}>
                      Concept review
                    </span>
                  </div>
                  {currentBlock.misconceptionTag && (
                    <span style={{
                      backgroundColor: '#FDE68A',
                      color: '#78350F',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {formatMisconceptionTag(currentBlock.misconceptionTag)}
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
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <Icon name="bulb" size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>Mental Model:</strong> {currentBlock.mentalModel}</div>
                  </div>
                )}

                {/* Repair Question */}
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--warning-border)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '16px 20px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--warning-text)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Repair Question (Verify Understanding):
                  </div>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.96rem' }}>
                    {currentBlock.repairQuestion.prompt}
                  </p>

                  {currentBlock.repairQuestion.codeSnippet && (
                    <div style={{
                      backgroundColor: 'var(--code-surface)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--code-text)',
                      fontSize: '0.88rem'
                    }}>
                      <pre style={{ margin: 0 }}>{currentBlock.repairQuestion.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Repair Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {currentBlock.repairQuestion.options.map((rOpt: any) => {
                      const isRepairSelected = repairSelectedOptId === rOpt.id;
                      let rBg = isRepairSelected ? 'var(--brand-light)' : 'var(--bg-surface)';
                      let rBorder = isRepairSelected ? 'var(--brand-primary)' : 'var(--border-default)';

                      if (repairAnswerChecked) {
                        if (rOpt.isCorrect) {
                          rBg = 'var(--state-success-subtle)';
                          rBorder = 'var(--state-success)';
                        } else if (isRepairSelected) {
                          rBg = 'var(--state-error-subtle)';
                          rBorder = 'var(--state-error)';
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
                      backgroundColor: repairIsCorrect ? 'var(--state-success-subtle)' : 'var(--state-error-subtle)',
                      border: `1px solid ${repairIsCorrect ? 'var(--state-success-border)' : 'var(--state-error-border)'}`,
                      color: repairIsCorrect ? 'var(--state-success)' : 'var(--state-error)',
                      fontSize: '0.86rem',
                      fontWeight: 600
                    }}>
                      {repairIsCorrect
                        ? 'Repair confirmed. Misconception corrected.'
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
                    border: `2px solid ${exerciseState === 'incorrect' ? 'var(--state-error)' : (exerciseState === 'correct' ? 'var(--state-success)' : 'var(--border-default)')}`,
                    backgroundColor: exerciseState === 'incorrect' ? 'var(--state-error-subtle)' : (exerciseState === 'correct' ? 'var(--state-success-subtle)' : 'var(--bg-surface)'),
                    color: 'var(--text-primary)',
                    fontSize: '1.05rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Reveal Correct Answer Immediately if Incorrect */}
              {exerciseState === 'incorrect' && (
                <div style={{ marginTop: '16px', padding: '14px', backgroundColor: 'var(--state-success-subtle)', border: '1px solid var(--state-success-border)', borderRadius: 'var(--radius-lg)', color: 'var(--state-success)' }}>
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
                Drag & drop blocks to arrange in execution order (touch & keyboard supported)
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {renderFormattedMarkdown(currentBlock.content || currentBlock.prompt)}
            </div>

            <SortableCodeList
              items={orderedItems}
              onChange={setOrderedItems}
              disabled={exerciseState === 'correct' || exerciseState === 'incorrect'}
            />

            {/* Reveal Correct Order Immediately if Incorrect */}
            {exerciseState === 'incorrect' && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--state-success-subtle)', border: '1.5px solid var(--state-success-border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--state-success)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="check" size={16} /> Correct Execution Sequence:
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono, monospace)', color: 'var(--state-success)', fontSize: '0.92rem', lineHeight: 1.6 }}>
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
                            border: isSelected ? '2px solid var(--state-success)' : '1px solid var(--border-default)',
                            backgroundColor: isSelected ? 'var(--state-success-subtle)' : 'var(--bg-surface)',
                            color: 'var(--text-primary)',
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
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--state-success-subtle)', border: '1px solid var(--state-success-border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--state-success)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Correct Concept Pairings:
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--state-success)', fontSize: '0.92rem', lineHeight: 1.6 }}>
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

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '20px 24px', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
                Trace Execution Table
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {traceSteps.map((step, idx) => {
                  const userVal = traceInputs[idx] || '';
                  const isChecked = traceFeedback?.checked;
                  const isStepCorrect = isChecked && userVal.trim() === String(step.expectedValue).trim();
                  const isStepIncorrect = isChecked && !isStepCorrect;

                  let borderColor = 'var(--border-default)';
                  let bgColor = 'var(--bg-surface)';
                  if (isChecked) {
                    if (isStepCorrect) {
                      borderColor = 'var(--state-success)';
                      bgColor = 'var(--state-success-subtle)';
                    } else if (isStepIncorrect) {
                      borderColor = 'var(--state-error)';
                      bgColor = 'var(--state-error-subtle)';
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
                          backgroundColor: 'var(--code-surface)',
                          color: 'var(--code-text)',
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
                            <span style={{ color: 'var(--state-success)', display: 'inline-flex', alignItems: 'center' }}>
                              <Icon name="check" size={14} stroke={2.5} />
                            </span>
                          ) : (
                            <span style={{ color: 'var(--state-error)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Icon name="x" size={14} stroke={2.5} />
                              <span className="tabular-nums">({step.expectedValue})</span>
                            </span>
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
                  onClick={() => {
                    if (!showHint) {
                      setHintsUsedCount(c => c + 1);
                    }
                    setShowHint(prev => !prev);
                  }}
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
              <div className="animate-fade-in" style={{ backgroundColor: 'var(--brand-light)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-lg, 12px)', padding: '14px 18px', marginBottom: '18px', color: 'var(--brand-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Icon name="bulb" size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div><strong>Hint:</strong> {currentBlock.hint}</div>
              </div>
            )}

            {/* Engine Warming Indicator */}
            {isEngineWarming && (
              <div
                className="animate-pulse"
                style={{
                  backgroundColor: 'var(--brand-light)',
                  border: '1.5px solid var(--brand-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 18px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--brand-text)'
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid var(--brand-primary)',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite'
                  }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Starting Python runtime...
                </span>
              </div>
            )}

            {/* Monaco Python Editor */}
            <div style={{ borderRadius: 'var(--radius-xl, 16px)', border: '1.5px solid var(--border-default)', overflow: 'hidden', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: '38px', backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-default)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="code" size={16} style={{ color: 'var(--state-success)' }} />
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

              <div style={{ height: '240px', position: 'relative' }}>
                {monacoTimedOut && !monacoLoaded ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--warning-bg)',
                      borderBottom: '1px solid var(--warning-border)',
                      fontSize: '0.75rem',
                      color: 'var(--warning-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Icon name="alert-triangle" size={14} />
                      <span>Editor fallback active (offline mode). You can write, run, and check code normally.</span>
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => {
                        if (exerciseState !== 'correct' && exerciseState !== 'incorrect') {
                          setCode(e.target.value);
                        }
                      }}
                      readOnly={exerciseState === 'correct' || exerciseState === 'incorrect'}
                      spellCheck={false}
                      style={{
                        flex: 1,
                        width: '100%',
                        backgroundColor: 'var(--code-surface)',
                        color: 'var(--code-text)',
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        fontSize: '14px',
                        lineHeight: 1.5,
                        padding: '12px 16px',
                        border: 'none',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>
                ) : (
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    value={code}
                    onMount={() => setMonacoLoaded(true)}
                    loading={<div style={{ padding: '24px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading Python Editor...</div>}
                    onChange={(val) => {
                      if (exerciseState !== 'correct' && exerciseState !== 'incorrect') {
                        setCode(val || '');
                      }
                    }}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      fontSize: 14,
                      fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                      wordWrap: 'on',
                      tabSize: 4,
                      scrollBeyondLastLine: false,
                      readOnly: exerciseState === 'correct' || exerciseState === 'incorrect',
                      padding: { top: 12, bottom: 12 },
                      quickSuggestions: false,
                      parameterHints: { enabled: false },
                      suggestOnTriggerCharacters: false,
                      renderLineHighlight: 'all',
                      glyphMargin: false,
                      folding: false
                    }}
                  />
                )}
              </div>
            </div>

            {/* Output / Console Preview */}
            {executionOutput && (
              <div style={{
                backgroundColor: 'var(--code-surface)',
                color: 'var(--code-text)',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--code-border)',
                padding: '14px 18px',
                marginTop: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                  <Icon name="terminal" size={14} /> stdout / stderr
                </div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {executionOutput}
                </pre>
              </div>
            )}

            {/* Structured Test Results / Assertions */}
            {testResults.length > 0 && (
              <div style={{
                marginTop: '16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border-default)',
                borderRadius: 'var(--radius-lg, 12px)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="circle-check" size={16} /> Test Cases ({testResults.filter(t => t.passed).length} / {testResults.length} Passed)
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click failed tests for details</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testResults.map((t, idx) => {
                    const isExpanded = Boolean(expandedTests[idx]);
                    return (
                      <div
                        key={t.testId || idx}
                        onClick={() => {
                          if (!t.passed) {
                            setExpandedTests(prev => ({ ...prev, [idx]: !prev[idx] }));
                          }
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: t.passed ? 'var(--state-success-subtle)' : 'var(--state-error-subtle)',
                          border: `1px solid ${t.passed ? 'var(--state-success-border)' : 'var(--state-error-border)'}`,
                          cursor: t.passed ? 'default' : 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon
                              name={t.passed ? 'circle-check' : 'circle-x'}
                              size={18}
                              style={{ color: t.passed ? 'var(--state-success)' : 'var(--state-error)' }}
                            />
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: t.passed ? 'var(--state-success)' : 'var(--state-error)'
                            }}>
                              {t.description}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: t.passed ? 'var(--state-success)' : 'var(--state-error)'
                          }}>
                            {t.passed ? 'Passed' : (isExpanded ? 'Hide Details ▲' : 'Details ▼')}
                          </span>
                        </div>

                        {/* Expandable Failure Details */}
                        {!t.passed && isExpanded && (
                          <div style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px dashed var(--state-error-border)',
                            fontSize: '0.82rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--state-error)'
                          }}>
                            {t.error && <div><strong>Error:</strong> {t.error}</div>}
                            {t.expectedOutput !== undefined && <div><strong>Expected:</strong> {String(t.expectedOutput)}</div>}
                            {t.actualOutput !== undefined && <div><strong>Actual:</strong> {String(t.actualOutput)}</div>}
                            {!t.error && t.expectedOutput === undefined && (
                              <div>Assertion failed. Check return values against the problem description.</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reveal Solution Code: for regular questions on incorrect, or for fix_code only on Attempt 3+ */}
            {exerciseState === 'incorrect' && currentBlock.solutionCode && (currentBlock.type !== 'fix_code' || debugAttempts >= 3) && (
              <div style={{ marginTop: '16px', backgroundColor: 'var(--code-surface)', border: '1px solid var(--state-success)', borderRadius: 'var(--radius-lg, 12px)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--state-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Expected Solution Code:
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>python</span>
                </div>
                <pre style={{ margin: 0, color: 'var(--code-text)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {currentBlock.solutionCode}
                </pre>
              </div>
            )}
          </div>
        );

      default: {
        console.warn(`[MultiStepLessonView] Unsupported question block type: "${currentBlock.type}". Gracefully providing skip path.`);
        return (
          <div
            className="animate-fade-in"
            style={{
              padding: '32px 24px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl, 16px)',
              border: '1.5px dashed var(--border-strong)',
              textAlign: 'center',
              margin: '20px 0'
            }}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--warning-bg)',
              color: 'var(--warning-solid)',
              border: '1.5px solid var(--warning-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Icon name="help-circle" size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Interactive Question in Preview
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              This exercise format (<code>{currentBlock.type}</code>) is currently being enhanced. We've marked it safe to skip so your progress continues uninterrupted!
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleNextStep}
              icon={<Icon name="arrow-right" size={16} />}
              iconPosition="right"
            >
              Skip & Continue
            </Button>
          </div>
        );
      }
    }
  };

  // Bottom fixed drawer with primary actions
  const renderFooter = () => {
    let footerBg = 'var(--bg-surface)';
    let borderColor = 'var(--border-default)';
    let drawerShadow = '0 -4px 16px rgba(0, 0, 0, 0.08)';

    if (exerciseState === 'correct') {
      footerBg = 'var(--state-success-subtle)';
      borderColor = 'var(--state-success)';
      drawerShadow = '0 -6px 24px rgba(16, 185, 129, 0.2)';
    } else if (exerciseState === 'incorrect') {
      footerBg = 'var(--state-error-subtle)';
      borderColor = 'var(--state-error)';
      drawerShadow = '0 -6px 24px rgba(239, 68, 68, 0.2)';
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
          paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
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
                  backgroundColor: exerciseState === 'correct' ? 'var(--state-success)' : 'var(--state-error)',
                  border: `2px solid ${exerciseState === 'correct' ? 'var(--state-success)' : 'var(--state-error)'}`,
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
                <h4 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: exerciseState === 'correct' ? 'var(--state-success)' : 'var(--state-error)' }}>
                  {exerciseState === 'correct' ? (feedbackMsg.title || 'Excellent!') : (feedbackMsg.title || 'Needs Review')}
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: exerciseState === 'correct' ? 'var(--state-success)' : 'var(--state-error)', lineHeight: 1.45, fontWeight: 500 }}>
                  {feedbackMsg.msg}
                </p>
                {feedbackMsg.detail && (
                  <div style={{
                    margin: '8px 0 0',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: exerciseState === 'correct' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    fontSize: '0.85rem',
                    color: exerciseState === 'correct' ? 'var(--state-success)' : 'var(--state-error)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Icon name="bulb" size={16} />
                    <span><strong>Mental model:</strong> {feedbackMsg.detail}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
            {exerciseState === 'incorrect' && currentBlock.type === 'fix_code' && debugAttempts < 3 ? (
              <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '440px', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setExerciseState('unanswered')}
                  style={{ flex: 1 }}
                >
                  TRY AGAIN ({debugAttempts + 1}/3)
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleNextStep}
                  style={{ flex: 1 }}
                  icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                  iconPosition="right"
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
                style={{ maxWidth: '320px' }}
                icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                iconPosition="right"
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
                icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                iconPosition="right"
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
                icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                iconPosition="right"
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
                icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                iconPosition="right"
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
                icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                iconPosition="right"
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
                icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                iconPosition="right"
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
                icon={<span className="desktop-only" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>↵ Enter</span>}
                iconPosition="right"
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Header */}
      <header
        style={{
          height: '68px',
          borderBottom: '1.5px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <button
          onClick={() => setShowExitModal(true)}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1.5px solid var(--border-default)',
            boxShadow: '0 2px 0 var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Exit to learning path (Esc)"
          aria-label="Exit lesson"
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
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--brand-light)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--brand-primary)',
              color: 'var(--brand-text)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.78rem'
            }}
          >
            <Icon name="shield" size={14} />
            <span>Shield Active</span>
          </div>
        </div>
      </header>

      {/* Main Block Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 20px', paddingBottom: '240px' }}>
        <div style={{ maxWidth: '780px', width: '100%' }}>
          {showCoachMarks && (
            <div style={{
              backgroundColor: 'var(--brand-light)',
              border: '1.5px solid var(--brand-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon name="bulb" size={22} color="var(--brand-primary)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  <strong>Welcome to your first lesson!</strong><br />
                  1. Track progress on the top bar • 2. Use <strong>Run</strong> to inspect terminal output • 3. Use <strong>Check</strong> to submit
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCoachMarks(false);
                  try {
                    localStorage.removeItem('codolingo_coach_marks');
                  } catch {}
                }}
              >
                Got it
              </Button>
            </div>
          )}

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {currentBlock.title}
          </h1>
          {renderBlockContent()}

          {/* Dev-only Diagnostics */}
          {import.meta.env.DEV && (
            <div
              style={{
                marginTop: '32px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px dashed var(--border-strong)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <span><strong>Dev Diagnostics:</strong> Lesson <code>{lessonId}</code></span>
              <span>•</span>
              <span><strong>Total:</strong> {blocks.length} blocks</span>
              <span>•</span>
              <span><strong>Current:</strong> #{currentBlockIndex + 1} (<code>{currentBlock.type}</code>)</span>
              <span>•</span>
              <span><strong>Phase:</strong> <code>{sessionPhase}</code></span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      {renderFooter()}

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Leave Lesson?"
      >
        <div style={{ padding: '8px 0 12px' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', margin: '0 0 24px' }}>
            Are you sure you want to exit? Your progress in this lesson will not be saved until all exercises are completed.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowExitModal(false)}>
              Keep Learning
            </Button>
            <Button variant="danger" onClick={exitLesson}>
              Leave Lesson
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
