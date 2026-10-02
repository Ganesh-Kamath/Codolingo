import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

export const PracticeView: React.FC = () => {
  const { navigateTo } = useApp();
  const [sandboxCode, setSandboxCode] = useState<string>(
    '# Free Python Sandbox\n# Test algorithms, snippets, and functions freely\n\ndef greet_learner(name):\n    return f"Welcome back, {name}!"\n\nmessage = greet_learner("Ganesh")\nprint(message)\n'
  );
  const [sandboxOutput, setSandboxOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunSandbox = () => {
    setIsRunning(true);
    sound.playClick();
    setTimeout(() => {
      sound.playSuccess();
      setSandboxOutput('Welcome back, Ganesh!\n>>> Process finished successfully (exit code 0)');
      setIsRunning(false);
    }, 250);
  };

  const drills = [
    {
      id: 'drill_1',
      title: 'Variable Swap Drill',
      concept: 'Variables & Memory',
      difficulty: 'Easy',
      desc: 'Swap two variables a and b without using a temporary variable.',
      xp: 40
    },
    {
      id: 'drill_2',
      title: 'Equality vs Identity',
      concept: 'Comparison Operators',
      difficulty: 'Medium',
      desc: 'Demonstrate the difference between == and is in Python lists.',
      xp: 60
    },
    {
      id: 'drill_3',
      title: 'List Comprehension Speedrun',
      concept: 'Loops & Data Structures',
      difficulty: 'Intermediate',
      desc: 'Filter even numbers from a list using a clean one-line list comprehension.',
      xp: 80
    }
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="brand" size="md"><Icon name="barbell" size={14} style={{ marginRight: 4 }} /> Skill Sharpener</Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Training</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Practice Arena
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.5, margin: 0 }}>
          Reinforce your mental models with rapid-fire coding drills or experiment freely in the scratchpad.
        </p>
      </div>

      {/* Grid: Drills + Live Sandbox */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Rapid-fire Drills Column */}
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Daily Workout Drills
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {drills.map(drill => (
              <Card key={drill.id} variant="default" padding="lg" className="hover-elevate" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <Badge variant="neutral" size="sm">{drill.difficulty}</Badge>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', padding: '4px 8px', borderRadius: '8px' }}>
                    <Icon name="sparkles" size={14} fill="#FDE68A" />
                    +{drill.xp} XP
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {drill.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {drill.desc}
                </p>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigateTo('/app/lesson/py_lesson_3')}
                  icon={<Icon name="player-play" size={14} />}
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  Start Drill
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Interactive Sandbox Column */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="terminal" size={20} style={{ color: 'var(--brand-primary)' }} />
              Interactive Scratchpad
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunSandbox}
              isLoading={isRunning}
              icon={<Icon name="player-play" size={14} fill="#fff" />}
            >
              Run Code
            </Button>
          </div>

          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ height: '240px' }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                value={sandboxCode}
                onChange={(val) => setSandboxCode(val || '')}
                theme="light"
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>

            {/* Sandbox Console */}
            <div
              style={{
                height: '140px',
                backgroundColor: '#181818',
                color: '#4ADE80',
                padding: '12px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                borderTop: '1px solid #333',
                overflowY: 'auto'
              }}
            >
              <div style={{ color: '#888', fontSize: '0.72rem', marginBottom: '6px' }}>TERMINAL CONSOLE:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {sandboxOutput || '# Output will stream here when executed...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
