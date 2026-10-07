import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PracticeWorkspaceHeader } from './PracticeWorkspaceHeader';
import { DEFAULT_LANGUAGE, LanguageDefinition } from '../../types/languages';
import { practiceStorageService } from '../../services/practiceStorageService';
import { codeExecutionService } from '../../services/codeExecutionService';
import { sound } from '../../utils/audio';
import { Icon } from '../../components/ui/Icon';

interface PlaygroundWorkspaceProps {
  onBack: () => void;
}

export const PlaygroundWorkspace: React.FC<PlaygroundWorkspaceProps> = ({ onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageDefinition>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState<string>(() => {
    return practiceStorageService.getPlaygroundCode(DEFAULT_LANGUAGE.id, DEFAULT_LANGUAGE.starterTemplate);
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [terminalHeight, setTerminalHeight] = useState<number>(240);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState<boolean>(false);
  
  // Resizing state
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(240);
  const editorRef = useRef<any>(null);

  // Debounced Autosave (600ms)
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      practiceStorageService.savePlaygroundCode(selectedLanguage.id, code);
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [code, selectedLanguage.id]);

  // Handle drag resizing of terminal height
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.max(120, Math.min(window.innerHeight - 200, startHeightRef.current + deltaY));
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = terminalHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    if (isRunning) return;
    sound.playClick();
    setIsRunning(true);
    setHasError(false);
    if (isTerminalCollapsed) setIsTerminalCollapsed(false);

    try {
      const res = await codeExecutionService.executeRaw(code);
      setExecutionTime(res.executionTimeMs);
      if (res.error) {
        setHasError(true);
        setOutput(res.stdout ? `${res.stdout}\n\n[Runtime Error]\n${res.error}` : `Runtime Error:\n${res.error}`);
        sound.playError();
      } else {
        setOutput(res.stdout || '(Program completed successfully with no output)');
        sound.playSuccess();
      }
    } catch (err: any) {
      setHasError(true);
      setOutput(`Execution failed: ${err?.message || 'Unknown runtime error'}`);
      sound.playError();
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to run code
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset playground code to default starter template? Current edits will be replaced.')) {
      sound.playClick();
      setCode(selectedLanguage.starterTemplate);
      setOutput('');
      setExecutionTime(null);
      setHasError(false);
      practiceStorageService.resetPlaygroundCode(selectedLanguage.id, selectedLanguage.starterTemplate);
    }
  };

  const handleClearOutput = () => {
    sound.playClick();
    setOutput('');
    setExecutionTime(null);
    setHasError(false);
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: '#0D1117',
        color: '#C9D1D9',
        overflow: 'hidden'
      }}
    >
      {/* Workspace Header */}
      <PracticeWorkspaceHeader
        title="Playground"
        subtitle="Python 3.11 WASM IDE"
        backLabel="Practice"
        onBack={onBack}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        saveStatus={saveStatus}
        rightExtra={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#21262D',
                border: '1px solid #30363D',
                borderRadius: '8px',
                color: '#C9D1D9',
                padding: '6px 13px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 120ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#30363D';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#21262D';
                e.currentTarget.style.color = '#C9D1D9';
              }}
              title="Reset code to default template"
            >
              <Icon name="refresh" size={14} />
              <span>Reset</span>
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isRunning ? '#238636' : '#2EA043',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
                padding: '6px 18px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 12px rgba(46, 160, 67, 0.35)',
                opacity: isRunning ? 0.8 : 1,
                transition: 'all 120ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isRunning) e.currentTarget.style.backgroundColor = '#3FB950';
              }}
              onMouseLeave={(e) => {
                if (!isRunning) e.currentTarget.style.backgroundColor = '#2EA043';
              }}
              title="Execute Python Script (Ctrl + Enter)"
            >
              {isRunning ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: '2px solid #FFFFFF',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Icon name="player-play" size={15} />
                  <span>Run</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
                    (Ctrl+Enter)
                  </span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Main IDE Layout: Vertical Stack with Dominant Editor & Bottom Resizable Terminal */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          backgroundColor: '#0D1117'
        }}
      >
        {/* Editor Area (Dominant Workspace Element) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '200px',
            position: 'relative'
          }}
        >
          {/* Editor File Tab Bar */}
          <div
            style={{
              height: '36px',
              backgroundColor: '#161B22',
              borderBottom: '1px solid #21262D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0D1117',
                  borderTop: '2px solid #58A6FF',
                  borderRight: '1px solid #21262D',
                  borderLeft: '1px solid #21262D',
                  padding: '6px 14px',
                  fontSize: '0.8125rem',
                  color: '#F0F6FC',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 600
                }}
              >
                <Icon name="brand-python" size={14} style={{ color: '#58A6FF' }} />
                <span>{selectedLanguage.defaultFileName}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B949E', fontFamily: 'var(--font-mono, monospace)' }}>
                UTF-8 • 4 Spaces
              </span>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Editor
              height="100%"
              language={selectedLanguage.monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                padding: { top: 14, bottom: 14 },
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3
              }}
            />
          </div>
        </div>

        {/* Resizable Terminal Panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: isTerminalCollapsed ? '36px' : `${terminalHeight}px`,
            backgroundColor: '#090D13',
            borderTop: '1px solid #21262D',
            transition: isDraggingRef.current ? 'none' : 'height 120ms ease'
          }}
        >
          {/* Resize Handle Strip */}
          {!isTerminalCollapsed && (
            <div
              onMouseDown={handleResizeStart}
              style={{
                height: '4px',
                cursor: 'row-resize',
                backgroundColor: 'transparent',
                position: 'relative',
                zIndex: 10
              }}
              title="Drag to resize terminal"
            />
          )}

          {/* Terminal Header Bar */}
          <div
            style={{
              height: '36px',
              backgroundColor: '#161B22',
              borderBottom: isTerminalCollapsed ? 'none' : '1px solid #21262D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="terminal" size={15} style={{ color: hasError ? '#F85149' : '#58A6FF' }} />
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#C9D1D9',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.04em'
                }}
              >
                TERMINAL OUTPUT
              </span>

              {executionTime !== null && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#8B949E',
                    backgroundColor: '#21262D',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                >
                  {executionTime}ms
                </span>
              )}

              {hasError && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#FF7B72',
                    backgroundColor: '#351F28',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 700
                  }}
                >
                  Error
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {output && !isTerminalCollapsed && (
                <button
                  onClick={handleClearOutput}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#8B949E',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '3px 6px',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F0F6FC';
                    e.currentTarget.style.backgroundColor = '#21262D';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#8B949E';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Clear terminal console"
                >
                  <Icon name="trash" size={13} />
                  <span>Clear</span>
                </button>
              )}

              <button
                onClick={() => setIsTerminalCollapsed(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#8B949E',
                  cursor: 'pointer',
                  padding: '3px'
                }}
                title={isTerminalCollapsed ? 'Expand terminal' : 'Collapse terminal'}
              >
                <Icon name={isTerminalCollapsed ? 'chevron-up' : 'chevron-down'} size={15} />
              </button>
            </div>
          </div>

          {/* Terminal Console Output Stream */}
          {!isTerminalCollapsed && (
            <div
              style={{
                flex: 1,
                padding: '14px 16px',
                overflowY: 'auto',
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: hasError ? '#FF7B72' : '#7EE787',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: '#090D13'
              }}
            >
              {output ? (
                output
              ) : (
                <div style={{ color: '#484F58', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                  {`# Press 'Run' (or Ctrl+Enter) to execute your code.\n# Standard output and error tracebacks will appear here.`}
                </div>
              )}
            </div>
          )}

          {/* Terminal Status Footer */}
          {!isTerminalCollapsed && (
            <div
              style={{
                height: '26px',
                backgroundColor: '#0D1117',
                borderTop: '1px solid #21262D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                fontSize: '0.72rem',
                color: '#8B949E',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isRunning ? '#D29922' : hasError ? '#F85149' : '#2EA043'
                  }}
                />
                <span>{isRunning ? 'Executing script...' : hasError ? 'Exited with error' : 'Ready'}</span>
              </div>
              <span>Pyodide Sandbox</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
