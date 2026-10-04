import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MistakeRecord } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

export const MistakeReviewView: React.FC = () => {
  const { mistakes, resolveMistake, navigateTo } = useApp();
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null);
  const [repairCode, setRepairCode] = useState<string>('');
  const [repairSuccess, setRepairSuccess] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  const filteredMistakes = mistakes.filter(m => {
    if (filter === 'unresolved') return !m.resolved;
    if (filter === 'resolved') return m.resolved;
    return true;
  });

  const handleOpenRepair = (mistake: MistakeRecord) => {
    setSelectedMistake(mistake);
    setRepairSuccess(false);
    // Provide starter repair code
    if (mistake.mistakeType === 'assignment_in_condition') {
      setRepairCode('# Fix the comparison below:\nsaved_role = "admin"\nuser_role = "admin"\n\n# Change = to == :\nprint(saved_role == user_role)');
    } else if (mistake.mistakeType === 'case_sensitivity') {
      setRepairCode('# Fix the capitalization below:\nprint("Hello, World!")');
    } else {
      setRepairCode(mistake.userCode);
    }
  };

  const handleVerifyRepair = () => {
    sound.playClick();
    if (!selectedMistake) return;

    // Validation for repair drill
    let passed = false;
    if (selectedMistake.mistakeType === 'assignment_in_condition') {
      passed = repairCode.includes('==') && !repairCode.includes('saved_role = user_role');
    } else if (selectedMistake.mistakeType === 'case_sensitivity') {
      passed = repairCode.includes('print(') && !repairCode.includes('Print(');
    } else {
      passed = true;
    }

    if (passed) {
      sound.playSuccess();
      setRepairSuccess(true);
      resolveMistake(selectedMistake.id);

      try {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    } else {
      sound.playError();
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="warning" size="md"><Icon name="shield-check" size={14} style={{ marginRight: 4 }} /> Adaptive Learning</Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mistake Recovery Engine</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Mistake Bank & Concept Repair
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.5, margin: 0 }}>
          Mistakes are part of progression. Repair weak concepts through short targeted drills so they never trip you up again.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('unresolved')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            backgroundColor: filter === 'unresolved' ? '#FEF2F2' : 'var(--bg-surface)',
            color: filter === 'unresolved' ? '#991B1B' : 'var(--text-secondary)',
            border: `1.5px solid ${filter === 'unresolved' ? '#EF4444' : 'var(--border-default)'}`,
            boxShadow: filter === 'unresolved' ? '0 3px 0 #DC2626' : '0 2px 0 var(--border-default)',
            cursor: 'pointer'
          }}
        >
          Needs Repair ({mistakes.filter(m => !m.resolved).length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            backgroundColor: filter === 'resolved' ? '#ECFDF5' : 'var(--bg-surface)',
            color: filter === 'resolved' ? '#065F46' : 'var(--text-secondary)',
            border: `1.5px solid ${filter === 'resolved' ? '#10B981' : 'var(--border-default)'}`,
            boxShadow: filter === 'resolved' ? '0 3px 0 #047857' : '0 2px 0 var(--border-default)',
            cursor: 'pointer'
          }}
        >
          Repaired ({mistakes.filter(m => m.resolved).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            backgroundColor: filter === 'all' ? '#1E1B17' : 'var(--bg-surface)',
            color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            border: `1.5px solid ${filter === 'all' ? '#1E1B17' : 'var(--border-default)'}`,
            boxShadow: filter === 'all' ? '0 3px 0 #000' : '0 2px 0 var(--border-default)',
            cursor: 'pointer'
          }}
        >
          All Entries
        </button>
      </div>

      {/* Mistakes List */}
      {filteredMistakes.length === 0 ? (
        <Card variant="subtle" padding="lg" style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: '#F0FDF4', border: '2px dashed #BBF7D0' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="check" size={36} stroke={3} style={{ color: '#16A34A' }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            No pending mistakes in this view
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Your code execution history looks healthy. Keep completing new lessons!
          </p>
          <Button variant="primary" size="md" onClick={() => navigateTo('/app/learn')}>
            Explore Lessons
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMistakes.map(item => (
            <Card key={item.id} variant="default" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ maxWidth: '680px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Badge variant={item.resolved ? 'success' : 'error'} size="sm">
                      {item.resolved ? <><Icon name="check" size={12} style={{marginRight: 4}} /> Repaired</> : <><Icon name="alert-triangle" size={12} style={{marginRight: 4}} /> Failed {item.frequency}x</>}
                    </Badge>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {item.conceptName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {item.lessonTitle}</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {item.explanation}
                  </h3>

                  {/* Code snippet showing the user's mistake */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Your previous attempt snippet:
                    </div>
                    <pre
                      style={{
                        backgroundColor: '#1E1E1E',
                        color: '#F87171',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.84rem',
                        overflowX: 'auto',
                        margin: 0
                      }}
                    >
                      {item.userCode}
                    </pre>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  {!item.resolved ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleOpenRepair(item)}
                      icon={<Icon name="history" size={15} />}
                    >
                      Start Repair Drill (+50 XP)
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-text)', fontSize: '0.9rem', fontWeight: 700, backgroundColor: 'var(--success-bg)', padding: '8px 12px', borderRadius: '8px' }}>
                      <Icon name="check" size={16} stroke={3} />
                      <span>Concept Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
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
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
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
                color: 'var(--text-muted)'
              }}
            >
              <Icon name="x" size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Badge variant="brand" size="sm"><Icon name="wrench" size={12} style={{ marginRight: 4 }} /> Repair Drill</Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedMistake.conceptName}</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Targeted Repair: {selectedMistake.explanation}
            </h2>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Fix the code below so it uses the correct Python construct.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={repairCode}
                onChange={(e) => setRepairCode(e.target.value)}
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
              {!repairSuccess && (
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
