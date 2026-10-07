/**
 * Persistence service for Practice Workspace (Playground & Challenges).
 * Prevents scattered localStorage calls across components.
 */

const PLAYGROUND_PREFIX = 'codolingo_practice_playground_';
const CHALLENGE_PREFIX = 'codolingo_practice_challenge_';
const CHALLENGE_COMPLETED_PREFIX = 'codolingo_practice_challenge_completed_';

export const practiceStorageService = {
  // --- Playground Storage ---
  getPlaygroundCode(languageId: string, defaultCode: string): string {
    try {
      const saved = localStorage.getItem(`${PLAYGROUND_PREFIX}${languageId}`);
      return saved !== null ? saved : defaultCode;
    } catch (e) {
      console.warn('Failed to read playground code from localStorage', e);
      return defaultCode;
    }
  },

  savePlaygroundCode(languageId: string, code: string): void {
    try {
      localStorage.setItem(`${PLAYGROUND_PREFIX}${languageId}`, code);
    } catch (e) {
      console.warn('Failed to save playground code to localStorage', e);
    }
  },

  resetPlaygroundCode(languageId: string, defaultCode: string): void {
    try {
      localStorage.setItem(`${PLAYGROUND_PREFIX}${languageId}`, defaultCode);
    } catch (e) {
      console.warn('Failed to reset playground code in localStorage', e);
    }
  },

  // --- Challenge Storage ---
  getChallengeCode(challengeId: string, defaultCode: string): string {
    try {
      const saved = localStorage.getItem(`${CHALLENGE_PREFIX}${challengeId}`);
      return saved !== null ? saved : defaultCode;
    } catch (e) {
      console.warn('Failed to read challenge code from localStorage', e);
      return defaultCode;
    }
  },

  saveChallengeCode(challengeId: string, code: string): void {
    try {
      localStorage.setItem(`${CHALLENGE_PREFIX}${challengeId}`, code);
    } catch (e) {
      console.warn('Failed to save challenge code to localStorage', e);
    }
  },

  resetChallengeCode(challengeId: string, defaultCode: string): void {
    try {
      localStorage.setItem(`${CHALLENGE_PREFIX}${challengeId}`, defaultCode);
    } catch (e) {
      console.warn('Failed to reset challenge code in localStorage', e);
    }
  },

  isChallengeCompleted(challengeId: string): boolean {
    try {
      return localStorage.getItem(`${CHALLENGE_COMPLETED_PREFIX}${challengeId}`) === 'true';
    } catch {
      return false;
    }
  },

  setChallengeCompleted(challengeId: string, completed: boolean): void {
    try {
      localStorage.setItem(`${CHALLENGE_COMPLETED_PREFIX}${challengeId}`, String(completed));
    } catch (e) {
      console.warn('Failed to save challenge completion state', e);
    }
  },

  getCompletedChallengeIds(): string[] {
    try {
      const completed: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CHALLENGE_COMPLETED_PREFIX)) {
          if (localStorage.getItem(key) === 'true') {
            completed.push(key.replace(CHALLENGE_COMPLETED_PREFIX, ''));
          }
        }
      }
      return completed;
    } catch {
      return [];
    }
  }
};
