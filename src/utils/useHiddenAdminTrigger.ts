import { useRef, useCallback } from 'react';

/**
 * Hook to require consecutive clicks within a specified timeframe
 * to trigger hidden administrator navigation without visible hints.
 */
export function useHiddenAdminTrigger(
  onTrigger: () => void,
  requiredClicks: number = 3,
  resetDelayMs: number = 1800
) {
  const countRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    countRef.current += 1;

    if (countRef.current >= requiredClicks) {
      countRef.current = 0;
      onTrigger();
      return;
    }

    timerRef.current = setTimeout(() => {
      countRef.current = 0;
    }, resetDelayMs);
  }, [onTrigger, requiredClicks, resetDelayMs]);

  return handleClick;
}
