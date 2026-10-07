import React from 'react';
import { PlaygroundWorkspace } from './PlaygroundWorkspace';
import { ChallengeWorkspace } from './ChallengeWorkspace';
import { PracticeChallengeItem } from '../../services/practiceChallengeService';

interface PracticeWorkspaceViewProps {
  mode: 'playground' | 'challenge';
  challenge?: PracticeChallengeItem | null;
  onBack: () => void;
  onNextChallenge?: () => void;
}

export const PracticeWorkspaceView: React.FC<PracticeWorkspaceViewProps> = ({
  mode,
  challenge,
  onBack,
  onNextChallenge
}) => {
  if (mode === 'challenge' && challenge) {
    return (
      <ChallengeWorkspace
        challenge={challenge}
        onBack={onBack}
        onNextChallenge={onNextChallenge}
      />
    );
  }

  return <PlaygroundWorkspace onBack={onBack} />;
};
