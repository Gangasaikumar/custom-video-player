/**
 * useFullscreen.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fullscreen + mobile orientation lock logic.
 * Previously copy-pasted identically inside useYouTubePlayer and useHtml5Player.
 *
 * SOLID:
 *   - Single Responsibility: only handles fullscreen state & transitions
 *   - DRY: single implementation shared by both player types
 *
 * Design pattern: Shared Hook
 */

import { useState, useEffect, useCallback } from "react";

interface UseFullscreenProps {
  /** The container element to request fullscreen on */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Attempt to lock to landscape on mobile enter (default: true) */
  lockOrientationOnEnter?: boolean;
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
}

export function useFullscreen({
  containerRef,
  lockOrientationOnEnter = true,
}: UseFullscreenProps): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        if (lockOrientationOnEnter && screen.orientation && "lock" in screen.orientation) {
          // orientation.lock is not in all TS lib versions — safe cast
          await (screen.orientation as { lock: (o: string) => Promise<void> })
            .lock("landscape")
            .catch(() => { /* orientation lock not supported on this device */ });
        }
      } else {
        await document.exitFullscreen();
        if (screen.orientation && "unlock" in screen.orientation) {
          screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.error("[useFullscreen] Error:", err);
    }
  }, [containerRef, lockOrientationOnEnter]);

  return { isFullscreen, toggleFullscreen };
}
