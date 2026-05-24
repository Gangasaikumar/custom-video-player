/**
 * useKeyboardShortcuts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Configurable keyboard shortcut handler extracted from PlayerControls.
 *
 * Previously 54 hardcoded lines inside PlayerControls — not reusable, not
 * configurable, and mixed UI concerns with input handling.
 *
 * SOLID:
 *   - Single Responsibility: only handles keyboard → action mapping
 *   - Open/Closed: extend shortcuts via KeyboardShortcutMap without changing
 *     this hook
 *   - Interface Segregation: consumers get focused PlayerActions interface
 *
 * Design pattern: Command pattern (maps keys → action callbacks)
 */

import { useEffect } from "react";
import type { KeyboardShortcutMap } from "../config/playerConfig";
import { DEFAULT_KEYBOARD_SHORTCUTS } from "../config/playerConfig";

export interface PlayerActions {
  onPlayPause:       () => void;
  onMute:            () => void;
  onFullscreen:      () => void;
  onTheater:         () => void;
  onPiP:             () => void;
  onSeekBackward:    () => void;
  onSeekForward:     () => void;
  onVolumeUp:        () => void;
  onVolumeDown:      () => void;
}

interface UseKeyboardShortcutsProps {
  actions: PlayerActions;
  shortcuts?: Partial<KeyboardShortcutMap>;
  /** If false, shortcuts are disabled (e.g. when an input is focused) */
  enabled?: boolean;
}

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function useKeyboardShortcuts({
  actions,
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsProps): void {
  useEffect(() => {
    if (!enabled) return;

    const map: KeyboardShortcutMap = { ...DEFAULT_KEYBOARD_SHORTCUTS, ...shortcuts };

    const handler = (e: KeyboardEvent) => {
      // Don't intercept when user is typing
      if (INPUT_TAGS.has((e.target as HTMLElement).tagName)) return;

      const code = e.code;

      if (map.playPause.includes(code)) {
        e.preventDefault();
        actions.onPlayPause();
      } else if (map.mute.includes(code)) {
        actions.onMute();
      } else if (map.fullscreen.includes(code)) {
        actions.onFullscreen();
      } else if (map.theater.includes(code)) {
        actions.onTheater();
      } else if (map.pip.includes(code)) {
        actions.onPiP();
      } else if (map.seekBackward.includes(code)) {
        actions.onSeekBackward();
      } else if (map.seekForward.includes(code)) {
        actions.onSeekForward();
      } else if (map.volumeUp.includes(code)) {
        e.preventDefault();
        actions.onVolumeUp();
      } else if (map.volumeDown.includes(code)) {
        e.preventDefault();
        actions.onVolumeDown();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions, shortcuts, enabled]);
}
