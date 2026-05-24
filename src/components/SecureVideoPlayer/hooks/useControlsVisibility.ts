import { useState, useEffect, useCallback } from "react";

interface VisibilityProps {
  playing: boolean;
  timeoutMs?: number;
}

export function useControlsVisibility({
  playing,
  timeoutMs = 3000,
}: VisibilityProps) {
  const [showControls, setShowControls] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(0);

  useEffect(() => {
    let timeout: number;
    if (showControls && playing) {
      timeout = window.setTimeout(() => {
        setShowControls(false);
      }, timeoutMs);
    }
    return () => clearTimeout(timeout);
  }, [showControls, playing, timeoutMs, lastInteraction]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    setLastInteraction(Date.now());
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (playing) {
      setShowControls(false);
    }
  }, [playing]);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
    setLastInteraction(Date.now());
  }, []);

  return {
    showControls,
    setShowControls,
    handleMouseMove,
    handleMouseLeave,
    toggleControls,
  };
}
