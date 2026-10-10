import canvasConfetti from 'canvas-confetti';

export function fireCelebrationConfetti(options?: canvasConfetti.Options) {
  if (typeof window !== 'undefined') {
    // Check system preference
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Check manual preference
    const manualReduced = localStorage.getItem('codolingo_reduced_motion') === 'true';

    if (prefersReducedMotion || manualReduced) {
      return;
    }
  }

  try {
    canvasConfetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#4338CA', '#10B981', '#F59E0B', '#6366F1'],
      ...options
    });
  } catch (e) {
    console.warn('Confetti execution skipped', e);
  }
}
