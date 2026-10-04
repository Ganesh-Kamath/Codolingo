import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Icon } from '../components/ui/Icon';

export const OnboardingView: React.FC = () => {
  const { navigateTo } = useApp();
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && !selectedCourse) return;
    if (step === 2 && !selectedGoal) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Finish onboarding
      navigateTo('/app');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Progress Bar */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '8px',
                flex: 1,
                backgroundColor: i <= step ? 'var(--brand-primary)' : 'var(--border-default)',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '600px', flex: 1 }}>
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--text-primary)' }}>
              What do you want to learn?
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Choose a path to start your journey. You can always change this later.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Card 
                variant="interactive" 
                padding="md"
                onClick={() => setSelectedCourse('python')}
                style={{ 
                  border: selectedCourse === 'python' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  backgroundColor: selectedCourse === 'python' ? 'var(--brand-light)' : '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#10B981'
                  }}>
                    <Icon name="terminal" size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px 0' }}>Python Developer</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Master backend, data, and scripts.</p>
                  </div>
                </div>
              </Card>

              <Card 
                variant="interactive" 
                padding="md"
                onClick={() => setSelectedCourse('web')}
                style={{ 
                  border: selectedCourse === 'web' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  backgroundColor: selectedCourse === 'web' ? 'var(--brand-light)' : '#FFFFFF',
                  opacity: 0.6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3B82F6'
                  }}>
                    <Icon name="world" size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px 0' }}>Full-Stack Web</h3>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#E5E7EB', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Coming Soon</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>HTML, CSS, React, and Node.js.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--text-primary)' }}>
              What is your daily goal?
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Setting a goal helps you build a strong habit.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'casual', label: 'Casual', desc: '5 mins / day', xp: '10 XP' },
                { id: 'regular', label: 'Regular', desc: '10 mins / day', xp: '20 XP' },
                { id: 'serious', label: 'Serious', desc: '15 mins / day', xp: '30 XP' },
                { id: 'intense', label: 'Intense', desc: '30 mins / day', xp: '50 XP' }
              ].map(goal => (
                <Card 
                  key={goal.id}
                  variant="interactive" 
                  padding="md"
                  onClick={() => setSelectedGoal(goal.id)}
                  style={{ 
                    border: selectedGoal === goal.id ? '2px solid var(--brand-primary)' : '2px solid transparent',
                    backgroundColor: selectedGoal === goal.id ? 'var(--brand-light)' : '#FFFFFF',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{goal.label}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{goal.desc}</p>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {goal.xp}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              backgroundColor: 'var(--brand-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px auto',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}>
              <Icon name="rocket" size={48} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              You're all set!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.125rem', maxWidth: '400px', margin: '0 auto 32px auto', lineHeight: 1.5 }}>
              Your curriculum is ready. It's time to write your first line of real code.
            </p>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '600px', marginTop: 'auto', paddingTop: '24px' }}>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth
          disabled={(step === 1 && !selectedCourse) || (step === 2 && !selectedGoal)}
          onClick={handleNext}
        >
          {step === 3 ? 'Start Learning' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
