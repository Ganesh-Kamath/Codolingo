import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { SUPPORTED_LANGUAGES, LanguageDefinition } from '../../types/languages';

interface PracticeWorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  selectedLanguage: LanguageDefinition;
  onSelectLanguage?: (lang: LanguageDefinition) => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  rightExtra?: React.ReactNode;
}

export const PracticeWorkspaceHeader: React.FC<PracticeWorkspaceHeaderProps> = ({
  title,
  subtitle,
  backLabel = 'Practice',
  onBack,
  selectedLanguage,
  onSelectLanguage,
  saveStatus,
  rightExtra
}) => {
  return (
    <header
      style={{
        height: '56px',
        backgroundColor: '#121316',
        borderBottom: '1px solid #23272E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        userSelect: 'none',
        zIndex: 20
      }}
    >
      {/* Left Back Button & Workspace Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {onBack && (
          <>
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'transparent',
                border: '1px solid #2D333B',
                borderRadius: '8px',
                color: '#ADBAC7',
                padding: '6px 12px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-sans, system-ui)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 120ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1C2128';
                e.currentTarget.style.borderColor = '#444C56';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#2D333B';
                e.currentTarget.style.color = '#ADBAC7';
              }}
              title="Return to Practice Navigation"
            >
              <Icon name="arrow-left" size={15} />
              <span>{backLabel}</span>
            </button>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#23272E' }} />
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span
            style={{
              color: '#F0F6FC',
              fontSize: '0.9375rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display, inherit)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{
                color: '#768390',
                fontSize: '0.75rem',
                backgroundColor: '#1C2128',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #2D333B',
                whiteSpace: 'nowrap'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Save state, Language selector, Custom Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Autosave subtle indicator */}
        {saveStatus && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              color: saveStatus === 'saving' ? '#E3B341' : '#57AB5F',
              fontFamily: 'var(--font-mono, monospace)'
            }}
          >
            {saveStatus === 'saving' ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#E3B341',
                    animation: 'pulse 1.5s infinite'
                  }}
                />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="check" size={13} stroke={2.5} />
                <span>Saved</span>
              </>
            )}
          </div>
        )}

        {/* Language Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1C2128',
            border: '1px solid #2D333B',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.8125rem',
            color: '#C9D1D9',
            fontFamily: 'var(--font-mono, monospace)'
          }}
        >
          <Icon name="brand-python" size={14} style={{ color: '#58A6FF' }} />
          <span style={{ fontWeight: 600 }}>{selectedLanguage.label}</span>
        </div>

        {rightExtra && (
          <>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#23272E' }} />
            {rightExtra}
          </>
        )}
      </div>
    </header>
  );
};
