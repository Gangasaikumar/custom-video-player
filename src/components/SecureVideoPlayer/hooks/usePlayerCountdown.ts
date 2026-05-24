import { useState, useEffect, useRef } from "react";

interface CountdownProps {
  currentTime: number;
  duration: number;
  autoPlayNext?: boolean;
  onCountdownComplete?: () => void;
  countdownStart?: number;
}

export function usePlayerCountdown({
  currentTime,
  duration,
  autoPlayNext = false,
  onCountdownComplete,
  countdownStart = 5,
}: CountdownProps) {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(countdownStart);
  const countdownInterval = useRef<number | null>(null);

  useEffect(() => {
    const isAtEnd = duration > 0 && currentTime >= duration - 0.5;

    if (isAtEnd && autoPlayNext && !showCountdown) {
      Promise.resolve().then(() => {
        setShowCountdown(true);
        setCountdown(countdownStart);
      });

      countdownInterval.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownInterval.current)
              clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Reset if we move away from the end
    if (!isAtEnd && showCountdown) {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      Promise.resolve().then(() => {
        setShowCountdown(false);
      });
    }

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [currentTime, duration, autoPlayNext, showCountdown, countdownStart]);

  useEffect(() => {
    if (showCountdown && countdown === 0) {
      Promise.resolve().then(() => {
        setShowCountdown(false);
      });
      if (onCountdownComplete) {
        onCountdownComplete();
      }
    }
  }, [showCountdown, countdown, onCountdownComplete]);

  const cancelCountdown = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setShowCountdown(false);
  };

  return {
    showCountdown,
    countdown,
    cancelCountdown,
  };
}
