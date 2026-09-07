import React, { useState, useEffect } from 'react';

interface AnimatedProgressBarProps {
  value: number; // Percentage 0 to 100
  colorClassName?: string;
  trackClassName?: string;
  heightClassName?: string;
  color?: string;
  height?: string;
  className?: string;
}

/**
 * Animated progress bar that fills smoothly from 0 to its target value on mount/change.
 * Features an ease-out transition (duration 600-700ms) with no bounce.
 */
export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  colorClassName,
  trackClassName = 'bg-slate-200 dark:bg-slate-800',
  heightClassName,
  color,
  height,
  className = '',
}) => {
  const effectiveColor = colorClassName || color || 'bg-emerald-500';
  const effectiveHeight = heightClassName || height || 'h-1.5';
  const [currentWidth, setCurrentWidth] = useState<number>(0);

  useEffect(() => {
    // Start at 0 on mount and animate to target value in next frame
    const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
    const frame = requestAnimationFrame(() => {
      setCurrentWidth(clamped);
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div
      className={`w-full rounded-full overflow-hidden ${trackClassName} ${heightClassName} ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`${colorClassName} ${heightClassName} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${currentWidth}%` }}
      />
    </div>
  );
};
