import { useEffect, useRef, useCallback } from "react";

interface MilestoneProps {
  currentTime: number;
  duration: number;
  milestones?: number[];
  onMilestoneReached?: (milestone: number) => void;
}

export function usePlayerMilestones({
  currentTime,
  duration,
  milestones = [25, 50, 75, 100],
  onMilestoneReached,
}: MilestoneProps) {
  const milestonesReached = useRef<Set<number>>(new Set());

  useEffect(() => {
    const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

    milestones.forEach((m) => {
      if (percent >= m && !milestonesReached.current.has(m)) {
        milestonesReached.current.add(m);
        if (onMilestoneReached) {
          onMilestoneReached(m);
        }
      }
    });

    // Reset milestones when video starts over (or switches)
    if (currentTime < 1 && milestonesReached.current.size > 0) {
      milestonesReached.current.clear();
    }
  }, [currentTime, duration, milestones, onMilestoneReached]);

  return {
    resetMilestones: useCallback(() => milestonesReached.current.clear(), []),
  };
}
