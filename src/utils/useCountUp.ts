import { useState, useEffect } from 'react';

/**
 * Custom hook to smoothly count up from 0 to a target number.
 * Uses cubic ease-out for a clean, professional, non-bouncy transition.
 * 
 * @param target The target number to count up to.
 * @param duration Duration in milliseconds (default 800ms).
 * @param decimals Decimal places to preserve (default 0).
 */
export function useCountUp(
  target: number,
  duration: number = 800,
  decimals: number = 0
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;
    const startVal = 0;
    const finalTarget = Number.isFinite(target) ? target : 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Cubic ease-out: smooth deceleration, no overshoot or bouncing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (finalTarget - startVal) * easeOut;

      setValue(decimals > 0 ? Number(current.toFixed(decimals)) : Math.round(current));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(decimals > 0 ? Number(finalTarget.toFixed(decimals)) : Math.round(finalTarget));
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, decimals]);

  return value;
}
