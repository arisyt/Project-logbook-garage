import confetti from 'canvas-confetti';

/**
 * Fires an energetic, automotive-themed celebratory confetti animation
 * when a component is serviced or a maintenance package is executed.
 */
export function fireSuccessCelebration() {
  try {
    // 1. Center upward burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6', '#34d399'],
      disableForReducedMotion: true,
    });

    // 2. Alternating side bursts
    setTimeout(() => {
      confetti({
        particleCount: 35,
        angle: 60,
        spread: 50,
        origin: { x: 0.05, y: 0.8 },
        colors: ['#10b981', '#34d399', '#06b6d4'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 50,
        origin: { x: 0.95, y: 0.8 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
        disableForReducedMotion: true,
      });
    }, 120);
  } catch (err) {
    console.debug('Confetti skipped or not available in this environment:', err);
  }
}
