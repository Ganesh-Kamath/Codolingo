import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MistakeRecord } from '../types';
import { sound } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

interface MisconceptionDrillConfig {
  starterCode: (item: MistakeRecord) => string;
  hint: string;
  validate: (code: string, item: MistakeRecord) => { passed: boolean; errorReason?: string };
}

const MISCONCEPTION_CONFIGS: Record<string, MisconceptionDrillConfig> = {
  // 1. Assignment vs Comparison
  'assignment_in_condition': {
    starterCode: () => '# Fix the comparison below:\nscore = 100\n\n# Change = to == for comparison:\nif score == 100:\n    print("Perfect score!")',
    hint: 'In Python, = assigns a value, while == compares equality.',
    validate: (code) => {
      const hasComparison = code.includes('==') || code.includes('!=') || code.includes('<=') || code.includes('>=');
      const hasAssignmentInIf = /if\s+[\w]+\s*=\s*[^=]/.test(code);
      if (!hasComparison) return { passed: false, errorReason: 'Condition must use comparison operator (==) rather than assignment.' };
      if (hasAssignmentInIf) return { passed: false, errorReason: 'Found single = inside if statement. Use == for equality.' };
      return { passed: true };
    }
  },
  'ASSIGNMENT_VS_COMPARISON': {
    starterCode: () => '# Fix the comparison below:\nscore = 100\n\n# Change = to == for comparison:\nif score == 100:\n    print("Perfect score!")',
    hint: 'In Python, = assigns a value, while == compares equality.',
    validate: (code) => {
      const hasComparison = code.includes('==') || code.includes('!=') || code.includes('<=') || code.includes('>=');
      const hasAssignmentInIf = /if\s+[\w]+\s*=\s*[^=]/.test(code);
      if (!hasComparison) return { passed: false, errorReason: 'Condition must use comparison operator (==) rather than assignment.' };
      if (hasAssignmentInIf) return { passed: false, errorReason: 'Found single = inside if statement. Use == for equality.' };
      return { passed: true };
    }
  },

  // 2. Case Sensitivity
  'case_sensitivity': {
    starterCode: () => '# Python is strictly case-sensitive:\n# Fix the capitalization of the function name:\nprint("Hello, Python!")',
    hint: 'Python built-in functions like print() must be lowercase.',
    validate: (code) => {
      if (code.includes('Print(') || code.includes('PRINT(')) {
        return { passed: false, errorReason: 'Python function names are lowercase. Use print() instead of Print().' };
      }
      if (!code.includes('print(')) return { passed: false, errorReason: 'Code must call print().' };
      return { passed: true };
    }
  },

  // 3. String vs Number
  'STRING_VS_NUMBER': {
    starterCode: () => '# You cannot concatenate string and int with + directly.\n# Convert age to a string:\nage = 18\nprint("Age: " + str(age))',
    hint: 'Use str(age), comma separation, or an f-string to output numbers with text.',
    validate: (code) => {
      const usesStr = /str\s*\(\s*age\s*\)/.test(code);
      const usesComma = /print\s*\([^)]*,[^)]*\)/.test(code);
      const usesFString = /f["'].*\{age\}.*["']/.test(code);
      const rawConcat = /["']\s*\+\s*age\b/.test(code) || /\bage\s*\+\s*["']/.test(code);
      if (rawConcat) return { passed: false, errorReason: 'Cannot use + between string and integer without converting first.' };
      if (usesStr || usesComma || usesFString) return { passed: true };
      return { passed: false, errorReason: 'Convert age using str(age) or separate arguments with a comma.' };
    }
  },
  'WRONG_TYPE': {
    starterCode: () => '# Fix the type conversion below:\nage = "20"\n# Convert string to integer before adding:\ntotal = int(age) + 5\nprint(total)',
    hint: 'Convert string to integer using int().',
    validate: (code) => {
      if (!code.includes('int(') && !code.includes('float(')) {
        return { passed: false, errorReason: 'Convert string variable using int(...).' };
      }
      return { passed: true };
    }
  },

  // 4. Input is String
  'INPUT_IS_STRING': {
    starterCode: () => '# input() returns string text. Convert it to integer for calculation:\nuser_num = "10"\nscore = int(user_num) * 2\nprint(score)',
    hint: 'Wrap user_num in int(...) to do math.',
    validate: (code) => {
      if (!code.includes('int(') && !code.includes('float(')) {
        return { passed: false, errorReason: 'Convert the input value using int(...).' };
      }
      return { passed: true };
    }
  },

  // 5. Condition Boundary
  'CONDITION_BOUNDARY': {
    starterCode: () => '# Fix the boundary condition below to include 100:\nscore = 100\nif score >= 100:\n    print("Maximum score reached!")',
    hint: 'Use >= or <= to include the threshold number.',
    validate: (code) => {
      if (code.includes('score > 100') || code.includes('score < 100')) {
        return { passed: false, errorReason: 'Use >= or <= to include the boundary value 100.' };
      }
      if (code.includes('>=') || code.includes('<=')) return { passed: true };
      return { passed: false, errorReason: 'Condition must use inclusive comparison (>= or <=).' };
    }
  },

  // 6. Precedence Confusion
  'PRECEDENCE_CONFUSION': {
    starterCode: () => '# Group the addition before multiplying by 2:\naverage = (10 + 20) / 2\nprint(average)',
    hint: 'Parentheses force expressions to evaluate before multiplication/division.',
    validate: (code) => {
      if (code.includes('(10 + 20)') || code.includes('(10+20)') || code.includes('(')) {
        return { passed: true };
      }
      return { passed: false, errorReason: 'Group (10 + 20) inside parentheses.' };
    }
  },

  // 7. Variable vs Value
  'VARIABLE_VALUE_CONFUSION': {
    starterCode: () => '# Print the variable value, NOT the literal text "name":\nname = "Python"\nprint(name)',
    hint: 'Pass the variable name without quotes to print its value.',
    validate: (code) => {
      if (code.includes('print("name")') || code.includes("print('name')")) {
        return { passed: false, errorReason: 'Quoting "name" prints literal letters. Remove quotes to print variable contents.' };
      }
      if (code.includes('print(name)')) return { passed: true };
      return { passed: false, errorReason: 'Pass name to print() without quotation marks.' };
    }
  },

  // 8. Syntax Error
  'SYNTAX_ERROR': {
    starterCode: () => '# In Python, if statements must end with a colon (:):\nis_active = True\nif is_active:\n    print("Active")',
    hint: 'Ensure header statements like if, else, for, while, and def end with a colon (:).',
    validate: (code) => {
      if (!/if\s+[\w\s><=!]+:/.test(code) && !code.includes(':')) {
        return { passed: false, errorReason: 'Missing colon (:) at the end of the if statement.' };
      }
      return { passed: true };
    }
  },

  // 9. Indentation Error
  'INDENTATION_ERROR': {
    starterCode: () => '# Blocks under if statements must be indented:\nis_ready = True\nif is_ready:\n    print("Ready to launch")',
    hint: 'Indent statements inside the block by 4 spaces.',
    validate: (code) => {
      const lines = code.split('\n');
      const ifIdx = lines.findIndex(l => l.trim().startsWith('if ') && l.trim().endsWith(':'));
      if (ifIdx >= 0 && ifIdx + 1 < lines.length) {
        const nextLine = lines[ifIdx + 1];
        if (nextLine.trim() && !nextLine.startsWith(' ') && !nextLine.startsWith('\t')) {
          return { passed: false, errorReason: 'Statements inside if block must be indented.' };
        }
      }
      return { passed: true };
    }
  },

  // 10. Wrong Operator
  'WRONG_OPERATOR': {
    starterCode: () => '# Python uses != for inequality:\nx = 10\ny = 20\nif x != y:\n    print("Not equal")',
    hint: 'Use != for not equal.',
    validate: (code) => {
      if (code.includes('!==') || code.includes('<>')) {
        return { passed: false, errorReason: 'Python uses != for inequality (not !== or <>).' };
      }
      if (code.includes('!=')) return { passed: true };
      return { passed: false, errorReason: 'Use the != operator.' };
    }
  },

  // 11. Boolean Logic Confusion
  'BOOLEAN_LOGIC_CONFUSION': {
    starterCode: () => '# Use the and keyword to check both conditions:\nage = 20\nhas_id = True\nif age >= 18 and has_id:\n    print("Access granted")',
    hint: 'Combine conditions using the and keyword.',
    validate: (code) => {
      if (code.includes('&&') || code.includes('||')) {
        return { passed: false, errorReason: 'Python uses "and" and "or" keywords, not && or ||.' };
      }
      if (code.includes(' and ') || code.includes(' or ')) return { passed: true };
      return { passed: false, errorReason: 'Use the "and" operator to combine boolean conditions.' };
    }
  },

  // 12. Loop / Off-by-one
  'OFF_BY_ONE': {
    starterCode: () => '# range(1, 6) generates numbers 1, 2, 3, 4, 5:\nfor i in range(1, 6):\n    print(i)',
    hint: 'range(start, stop) stops before stop. Use range(1, 6) to include 5.',
    validate: (code) => {
      if (code.includes('range(1, 5)')) {
        return { passed: false, errorReason: 'range(1, 5) stops at 4. Use range(1, 6) to include 5.' };
      }
      if (code.includes('range(1, 6)')) return { passed: true };
      return { passed: false, errorReason: 'Specify range(1, 6) to include numbers 1 to 5.' };
    }
  },
  'LOOP_EXECUTION_CONFUSION': {
    starterCode: () => '# range(1, 6) generates numbers 1, 2, 3, 4, 5:\nfor i in range(1, 6):\n    print(i)',
    hint: 'Specify range(1, 6) to iterate 5 times from 1 through 5.',
    validate: (code) => {
      if (code.includes('range(1, 6)')) return { passed: true };
      return { passed: false, errorReason: 'Specify range(1, 6) to iterate from 1 through 5.' };
    }
  }
};

export const MistakeReviewView: React.FC = () => {
  const { mistakes, resolveMistake, navigateTo } = useApp();
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null);
  const [repairCode, setRepairCode] = useState<string>('');
  const [repairSuccess, setRepairSuccess] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  const filteredMistakes = mistakes.filter(m => {
    if (filter === 'unresolved') return !m.resolved;
    if (filter === 'resolved') return m.resolved;
    return true;
  });

  const groupedMistakes = useMemo(() => {
    const groups: { [conceptName: string]: MistakeRecord[] } = {};
    filteredMistakes.forEach(m => {
      const key = m.conceptName || m.mistakeType.replace(/_/g, ' ') || 'General Python Syntax';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  }, [filteredMistakes]);

  const activeConfig = selectedMistake ? MISCONCEPTION_CONFIGS[selectedMistake.mistakeType] : undefined;
  const isDrillSupported = Boolean(activeConfig);

  const handleOpenRepair = (mistake: MistakeRecord) => {
    setSelectedMistake(mistake);
    setRepairSuccess(false);
    setVerifyError(null);

    const cfg = MISCONCEPTION_CONFIGS[mistake.mistakeType];
    if (cfg) {
      setRepairCode(cfg.starterCode(mistake));
    } else {
      setRepairCode(mistake.userCode || '# Verification drill unavailable for this record');
    }
  };

  const handleVerifyRepair = () => {
    sound.playClick();
    if (!selectedMistake) return;

    // Prevent double resolution if already resolved
    if (selectedMistake.resolved) {
      setRepairSuccess(true);
      return;
    }

    const cfg = MISCONCEPTION_CONFIGS[selectedMistake.mistakeType];
    if (!cfg) {
      sound.playError();
      setVerifyError('Automated verification drill is unavailable for this specific mistake record. Please review the explanation and past snippet above.');
      return;
    }

    const validation = cfg.validate(repairCode, selectedMistake);
    if (validation.passed) {
      sound.playSuccess();
      setVerifyError(null);
      setRepairSuccess(true);
      resolveMistake(selectedMistake.id);

      try {
        fireCelebrationConfetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    } else {
      sound.playError();
      setVerifyError(validation.errorReason || 'Verification failed. Your code still contains the misconception. Check the hint and try again.');
    }
  };

  const allResolved = mistakes.length > 0 && mistakes.every(m => m.resolved);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="warning" size="md"><Icon name="shield-check" size={14} style={{ marginRight: 4 }} /> Adaptive Recovery</Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Spaced Concept Reinforcement</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
          Mistake Bank
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.5, margin: 0 }}>
          Errors are stepping stones. Repair syntax pitfalls through targeted interactive drills to cement genuine mastery.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            sound.playClick();
            setFilter('unresolved');
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            backgroundColor: filter === 'unresolved' ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: filter === 'unresolved' ? '#FFFFFF' : 'var(--text-secondary)',
            border: `1.5px solid ${filter === 'unresolved' ? 'var(--brand-primary)' : 'var(--border-default)'}`,
            boxShadow: filter === 'unresolved' ? '0 3px 0 var(--brand-bevel)' : '0 2px 0 var(--border-default)',
            cursor: 'pointer',
            transition: 'all 120ms ease'
          }}
        >
          Needs Repair ({mistakes.filter(m => !m.resolved).length})
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilter('resolved');
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            backgroundColor: filter === 'resolved' ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: filter === 'resolved' ? '#FFFFFF' : 'var(--text-secondary)',
            border: `1.5px solid ${filter === 'resolved' ? 'var(--brand-primary)' : 'var(--border-default)'}`,
            boxShadow: filter === 'resolved' ? '0 3px 0 var(--brand-bevel)' : '0 2px 0 var(--border-default)',
            cursor: 'pointer',
            transition: 'all 120ms ease'
          }}
        >
          Repaired ({mistakes.filter(m => m.resolved).length})
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilter('all');
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            backgroundColor: filter === 'all' ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            border: `1.5px solid ${filter === 'all' ? 'var(--brand-primary)' : 'var(--border-default)'}`,
            boxShadow: filter === 'all' ? '0 3px 0 var(--brand-bevel)' : '0 2px 0 var(--border-default)',
            cursor: 'pointer',
            transition: 'all 120ms ease'
          }}
        >
          All Entries ({mistakes.length})
        </button>
      </div>

      {/* Satisfying Resolved State or Grouped Concept List */}
      {filteredMistakes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 28px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '24px',
            border: '2px solid var(--border-default)',
            boxShadow: '0 4px 0 var(--border-default)'
          }}
          className="animate-pop-in"
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--success-bg, #ECFDF5)',
              border: '2px solid var(--success-border, #A7F3D0)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--success-text, #059669)',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
            }}
          >
            <Icon name="award" size={42} stroke={2.5} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {allResolved ? 'All Concepts Mastered & Repaired!' : 'No Pending Mistakes Found'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            {allResolved 
              ? 'Outstanding work! Every previous code misconception in your bank has been diagnosed and reinforced. Your cognitive accuracy is operating at 100%.'
              : 'Your code execution history looks healthy. Keep completing lessons and challenges to build endurance.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigateTo('/app/practice')}
              icon={<Icon name="terminal" size={16} />}
            >
              Practice Arena
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigateTo('/app/learn')}
              icon={<Icon name="book" size={16} />}
            >
              Curriculum Path
            </Button>
            {allResolved && (
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  sound.playSuccess();
                  fireCelebrationConfetti({ particleCount: 100, spread: 60 });
                }}
                icon={<Icon name="sparkles" size={16} />}
              >
                Celebrate!
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Grouped By Concept */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.entries(groupedMistakes).map(([conceptGroup, items]) => {
            const groupUnresolvedCount = items.filter(i => !i.resolved).length;
            const groupRepairedCount = items.filter(i => i.resolved).length;

            return (
              <div key={conceptGroup} className="animate-fade-in">
                {/* Concept Group Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '14px',
                    paddingBottom: '8px',
                    borderBottom: '1.5px solid var(--border-default)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1.5px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-primary)'
                      }}
                    >
                      <Icon name="cpu" size={16} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {conceptGroup}
                      </h2>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {groupUnresolvedCount > 0 ? (
                      <Badge variant="error" size="sm">
                        <Icon name="alert-circle" size={12} style={{ marginRight: 4 }} />
                        {groupUnresolvedCount} {groupUnresolvedCount === 1 ? 'repair pending' : 'repairs pending'}
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        <Icon name="check" size={12} style={{ marginRight: 4 }} /> All Repaired
                      </Badge>
                    )}
                    {groupRepairedCount > 0 && groupUnresolvedCount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ({groupRepairedCount} solved)
                      </span>
                    )}
                  </div>
                </div>

                {/* Concept Mistake Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {items.map(item => {
                    const hasDrill = Boolean(MISCONCEPTION_CONFIGS[item.mistakeType]);

                    return (
                      <Card key={item.id} variant="default" padding="lg">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ maxWidth: '680px', flex: '1 1 300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                              <Badge variant={item.resolved ? 'success' : 'error'} size="sm">
                                {item.resolved ? (
                                  <><Icon name="check" size={12} style={{ marginRight: 4 }} /> Repaired</>
                                ) : (
                                  <><Icon name="alert-triangle" size={12} style={{ marginRight: 4 }} /> Encountered {item.frequency || 1}x</>
                                )}
                              </Badge>
                              {item.lessonTitle && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Lesson {item.lessonTitle}
                                </span>
                              )}
                            </div>

                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4, fontFamily: 'var(--font-display)' }}>
                              {item.explanation || 'Code verification failed.'}
                            </h3>

                            {/* Code snippet */}
                            {item.userCode && (
                              <div style={{ marginTop: '10px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                                  Attempt Snippet:
                                </div>
                                <pre
                                  style={{
                                    backgroundColor: '#1E1E1E',
                                    color: '#F87171',
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontFamily: 'var(--font-mono, monospace)',
                                    fontSize: '0.84rem',
                                    overflowX: 'auto',
                                    margin: 0
                                  }}
                                >
                                  {item.userCode}
                                </pre>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                            {!item.resolved ? (
                              hasDrill ? (
                                <Button
                                  variant="primary"
                                  size="md"
                                  onClick={() => handleOpenRepair(item)}
                                  icon={<Icon name="history" size={15} />}
                                >
                                  Start Repair Drill (+50 XP)
                                </Button>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleOpenRepair(item)}
                                  >
                                    View Drill Details
                                  </Button>
                                </div>
                              )
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-text)', fontSize: '0.85rem', fontWeight: 800, backgroundColor: 'var(--success-bg)', padding: '6px 12px', borderRadius: '8px' }}>
                                <Icon name="check" size={15} stroke={3} />
                                <span>Concept Reinforced</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Repair Modal Interactive Drill */}
      {selectedMistake && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid var(--border-default)',
              maxWidth: '640px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative'
            }}
            className="animate-pop-in"
          >
            <button
              onClick={() => setSelectedMistake(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Icon name="x" size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Badge variant="brand" size="sm"><Icon name="wrench" size={12} style={{ marginRight: 4 }} /> Repair Drill</Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedMistake.conceptName || selectedMistake.mistakeType}</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Targeted Repair: {selectedMistake.explanation || selectedMistake.mistakeType}
            </h2>

            {isDrillSupported ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Fix the code below so it uses the correct Python construct. {activeConfig?.hint}
              </p>
            ) : (
              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E', padding: '12px 16px', borderRadius: '8px', marginBottom: 20, fontSize: '0.875rem' }}>
                <strong>Automated drill unavailable:</strong> This mistake record does not have an automated verification drill attached. Review the explanation above and replay the associated lesson to strengthen this concept.
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={repairCode}
                onChange={(e) => setRepairCode(e.target.value)}
                readOnly={!isDrillSupported || repairSuccess}
                style={{
                  width: '100%',
                  height: '140px',
                  backgroundColor: '#1E1E1E',
                  color: '#9CDCFE',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #333333',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {verifyError && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Icon name="alert-triangle" size={16} />
                <span>{verifyError}</span>
              </div>
            )}

            {repairSuccess && (
              <div
                style={{
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success-text)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
                className="animate-fade-in"
              >
                <div style={{ backgroundColor: '#fff', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={16} stroke={3} style={{ color: 'var(--success-text)' }} />
                </div>
                <span>Mistake successfully repaired! <strong style={{ color: '#047857' }}>+50 Bonus XP</strong> awarded.</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" size="md" onClick={() => setSelectedMistake(null)}>
                {repairSuccess ? 'Close Drill' : 'Cancel'}
              </Button>
              {!repairSuccess && isDrillSupported && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleVerifyRepair}
                  icon={<Icon name="player-play" size={14} fill="#fff" />}
                >
                  Verify Fix
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
