import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/ui/Icon';
import { ProgressBar } from '../components/common/ProgressBar';
import { sound } from '../utils/audio';

type ExperienceLevel = 'brand_new' | 'know_little' | 'experienced';

interface PlacementQuestion {
  id: number;
  skillId: string;
  lessonId: string;
  conceptTitle: string;
  question: string;
  codeSnippet?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    skillId: 'py_skill_1_1',
    lessonId: '1.1',
    conceptTitle: 'What is Programming & Output',
    question: 'What does the following Python statement do?',
    codeSnippet: 'print("Hello, Python!")',
    options: [
      { id: 'opt_1', text: 'Outputs the text "Hello, Python!" to the terminal', isCorrect: true },
      { id: 'opt_2', text: 'Saves "Hello, Python!" into a file', isCorrect: false },
      { id: 'opt_3', text: 'Raises a SyntaxError because print is not defined', isCorrect: false }
    ]
  },
  {
    id: 2,
    skillId: 'py_skill_1_2',
    lessonId: '1.2',
    conceptTitle: 'Order of Operations & Expressions',
    question: 'What is the numeric value of `result` after this line runs?',
    codeSnippet: 'result = 4 + 2 * 3',
    options: [
      { id: 'opt_1', text: '18', isCorrect: false },
      { id: 'opt_2', text: '10 (multiplication 2 * 3 evaluates before addition 4)', isCorrect: true },
      { id: 'opt_3', text: '14', isCorrect: false }
    ]
  },
  {
    id: 3,
    skillId: 'py_skill_1_3',
    lessonId: '1.3',
    conceptTitle: 'Data Types & Strings vs Numbers',
    question: 'What happens when Python runs this code?',
    codeSnippet: 'total = "50" + 10',
    options: [
      { id: 'opt_1', text: 'total becomes 60', isCorrect: false },
      { id: 'opt_2', text: 'total becomes "5010"', isCorrect: false },
      { id: 'opt_3', text: 'Raises a TypeError: cannot concatenate str and int', isCorrect: true }
    ]
  },
  {
    id: 4,
    skillId: 'py_skill_1_4',
    lessonId: '1.4',
    conceptTitle: 'Variables & Comparisons',
    question: 'Which line properly checks if variable `score` is equal to 100 in an `if` statement?',
    options: [
      { id: 'opt_1', text: 'if score == 100:', isCorrect: true },
      { id: 'opt_2', text: 'if score = 100:', isCorrect: false },
      { id: 'opt_3', text: 'if score === 100:', isCorrect: false }
    ]
  },
  {
    id: 5,
    skillId: 'py_skill_1_5',
    lessonId: '1.5',
    conceptTitle: 'Condition Boundaries & Logical and',
    question: 'Which condition succeeds when `age` is 18 or older AND `has_ticket` is True?',
    options: [
      { id: 'opt_1', text: 'if age >= 18 and has_ticket:', isCorrect: true },
      { id: 'opt_2', text: 'if age > 18 or has_ticket:', isCorrect: false },
      { id: 'opt_3', text: 'if age => 18 && has_ticket:', isCorrect: false }
    ]
  }
];

export const OnboardingView: React.FC = () => {
  const { navigateTo, startLesson, updateProfile, skipSkillsViaPlacement } = useApp();

  // Screen 1: Welcome & Experience Level
  // Screen 2: Pick Daily Goal (10, 20, 40 XP)
  // Screen 3: Brand New Coach Marks launch OR 5-Question Placement Quiz
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('brand_new');
  const [dailyGoalXp, setDailyGoalXp] = useState<number>(20);

  // Placement Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [skippedCount, setSkippedCount] = useState<number>(0);

  const handleSelectExperience = (level: ExperienceLevel) => {
    sound.playClick();
    setExperienceLevel(level);
  };

  const handleSelectDailyGoal = (xp: number) => {
    sound.playClick();
    setDailyGoalXp(xp);
  };

  const handleProceedToScreen2 = () => {
    sound.playClick();
    setScreen(2);
  };

  const handleProceedToScreen3 = () => {
    sound.playClick();
    updateProfile({ dailyGoalXp });
    setScreen(3);
  };

  const handleStartBrandNew = () => {
    sound.playSuccess();
    try {
      localStorage.setItem('codolingo_coach_marks', 'true');
    } catch {}
    startLesson('1.1');
  };

  const handleAnswerPlacement = (questionId: number, optionId: string) => {
    sound.playClick();
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < PLACEMENT_QUESTIONS.length - 1) {
      sound.playClick();
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Evaluate Placement Quiz!
      sound.playSuccess();
      const masteredSkills: string[] = [];
      const masteredLessons: string[] = [];

      PLACEMENT_QUESTIONS.forEach(q => {
        const selectedOpt = q.options.find(o => o.id === quizAnswers[q.id]);
        if (selectedOpt?.isCorrect) {
          masteredSkills.push(q.skillId);
          masteredLessons.push(q.lessonId);
        }
      });

      if (masteredSkills.length > 0) {
        skipSkillsViaPlacement(masteredSkills, masteredLessons);
      }

      setSkippedCount(masteredSkills.length);
      setQuizCompleted(true);
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
      {/* 3-Step Progress Indicators */}
      <div style={{ width: '100%', maxWidth: '640px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(i => (
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

      <div style={{ width: '100%', maxWidth: '640px', flex: 1 }}>
        {/* ============================================================ */}
        {/* SCREEN 1: Welcome & Experience Level                         */}
        {/* ============================================================ */}
        {screen === 1 && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <Badge variant="brand" size="md">Welcome to Codolingo</Badge>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '12px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Learn Python by writing Python
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 auto', maxWidth: '480px', lineHeight: 1.5 }}>
                One micro-habit at a time. How much coding have you done before?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {[
                {
                  id: 'brand_new' as ExperienceLevel,
                  title: 'Brand new to coding',
                  desc: 'Never written a line of code. Start from absolute first principles.',
                  iconName: 'sparkles'
                },
                {
                  id: 'know_little' as ExperienceLevel,
                  title: 'Know a little',
                  desc: 'Know basic concepts like variables and loops. Ready for deliberate practice.',
                  iconName: 'code'
                },
                {
                  id: 'experienced' as ExperienceLevel,
                  title: 'Experienced in another language',
                  desc: 'Familiar with JS, C++, Java, etc. Pick up Python syntax and idioms fast.',
                  iconName: 'terminal'
                }
              ].map(opt => {
                const isSelected = experienceLevel === opt.id;
                return (
                  <Card
                    key={opt.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => handleSelectExperience(opt.id)}
                    style={{
                      border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                      backgroundColor: isSelected ? 'var(--brand-light)' : 'var(--bg-surface)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-app)',
                        color: isSelected ? '#FFFFFF' : 'var(--brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon name={opt.iconName} size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
                          {opt.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleProceedToScreen2}
              icon={<Icon name="arrow-right" size={18} />}
              iconPosition="right"
            >
              Continue
            </Button>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2: Pick Daily Goal (10, 20, 40 XP / day)              */}
        {/* ============================================================ */}
        {screen === 2 && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <Badge variant="brand" size="md">Step 2: Rhythm & Goals</Badge>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '12px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Set your daily goal
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 auto', maxWidth: '480px', lineHeight: 1.5 }}>
                Consistency beats intensity. How much time do you want to invest each day?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {[
                {
                  xp: 10,
                  label: 'Casual',
                  desc: '5 minutes a day • 1 quick lesson',
                  tag: 'Relaxed'
                },
                {
                  xp: 20,
                  label: 'Regular',
                  desc: '10 minutes a day • 1-2 lessons',
                  tag: 'Recommended'
                },
                {
                  xp: 40,
                  label: 'Intense',
                  desc: '20 minutes a day • Deep practice session',
                  tag: 'Fast Track'
                }
              ].map(opt => {
                const isSelected = dailyGoalXp === opt.xp;
                return (
                  <Card
                    key={opt.xp}
                    variant="interactive"
                    padding="md"
                    onClick={() => handleSelectDailyGoal(opt.xp)}
                    style={{
                      border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                      backgroundColor: isSelected ? 'var(--brand-light)' : 'var(--bg-surface)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {opt.label}
                        </h3>
                        {opt.tag === 'Recommended' && <Badge variant="brand" size="sm">Recommended</Badge>}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {opt.desc}
                      </p>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-primary)', fontFamily: 'var(--font-display)' }}>
                      {opt.xp} XP
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleProceedToScreen3}
              icon={<Icon name="arrow-right" size={18} />}
              iconPosition="right"
            >
              Continue
            </Button>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 3: Brand New Coach Marks OR 5-Question Placement Quiz */}
        {/* ============================================================ */}
        {screen === 3 && (
          <div className="animate-fade-in">
            {experienceLevel === 'brand_new' ? (
              // Brand New Experience: Immediate Start with Coach Marks explanation
              <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)', padding: '36px 28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="player-play" size={32} />
                </div>
                <Badge variant="brand" size="md">You're All Set!</Badge>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '12px', marginBottom: '10px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  Ready to write your first Python line!
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 24px' }}>
                  We'll start Lesson 1.1 right away. You'll see coach tips pointing to the <strong>Run</strong> button (test code output), <strong>Check</strong> button (submit for tests), and <strong>Progress</strong> bar.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '440px', margin: '0 auto 28px', textAlign: 'left' }}>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>1. CODE</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Interactive Monaco editor</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>2. RUN</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>In-browser Python output</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>3. CHECK</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Automated test validation</div>
                  </div>
                </div>

                <Button
                  variant="success"
                  size="lg"
                  onClick={handleStartBrandNew}
                  icon={<Icon name="player-play" size={18} />}
                  iconPosition="right"
                  style={{ minWidth: '220px' }}
                >
                  Start Lesson 1
                </Button>
              </div>
            ) : (
              // Placement Quiz Experience (5 Questions)
              <div>
                {!quizCompleted ? (
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <Badge variant="brand" size="sm">PLACEMENT QUIZ</Badge>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        Question {currentQuizIndex + 1} of {PLACEMENT_QUESTIONS.length}
                      </span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <ProgressBar progress={((currentQuizIndex + 1) / PLACEMENT_QUESTIONS.length) * 100} height={6} />
                    </div>

                    {/* Question Header */}
                    {(() => {
                      const q = PLACEMENT_QUESTIONS[currentQuizIndex];
                      const selectedOptId = quizAnswers[q.id];

                      return (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            {q.conceptTitle}
                          </div>
                          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.4 }}>
                            {q.question}
                          </h2>

                          {q.codeSnippet && (
                            <pre style={{ backgroundColor: '#1E1E1E', color: '#D4D4D4', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '20px', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
                              <code>{q.codeSnippet}</code>
                            </pre>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                            {q.options.map(opt => {
                              const isSelected = selectedOptId === opt.id;
                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => handleAnswerPlacement(q.id, opt.id)}
                                  style={{
                                    padding: '14px 18px',
                                    borderRadius: 'var(--radius-lg)',
                                    backgroundColor: isSelected ? 'var(--brand-light)' : 'var(--bg-surface)',
                                    border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)'
                                  }}
                                >
                                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                    {opt.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="primary"
                              size="md"
                              disabled={!selectedOptId}
                              onClick={handleNextQuizQuestion}
                              icon={<Icon name="arrow-right" size={16} />}
                              iconPosition="right"
                            >
                              {currentQuizIndex === PLACEMENT_QUESTIONS.length - 1 ? 'Finish Placement Quiz' : 'Next Question'}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  // Placement Quiz Completed Summary
                  <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)', padding: '36px 28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--state-success-subtle)', color: 'var(--state-success)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={40} stroke={2.5} />
                    </div>
                    <Badge variant="success" size="md">Placement Complete</Badge>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '12px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {skippedCount > 0 ? `You mastered ${skippedCount} skills!` : 'Placement finished!'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.5, maxWidth: '480px', margin: '0 auto 24px' }}>
                      {skippedCount > 0
                        ? `Based on your quiz results, ${skippedCount} skills have been marked as mastered ("Skipped via placement test"). You are ready to dive in at your exact level.`
                        : `We have calibrated your curriculum from the beginning of Unit 1 so you can build rock-solid Python habits.`}
                    </p>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigateTo('/app')}
                      icon={<Icon name="map" size={18} />}
                      iconPosition="right"
                      style={{ minWidth: '220px' }}
                    >
                      Go to Learning Path
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
