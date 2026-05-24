/**
 * SecureVideoPlayer — Public API barrel export
 * ─────────────────────────────────────────────────────────────────────────────
 * Import ONLY from this file in your app code.
 * Internal modules are implementation details and may change.
 *
 * Usage (drop-in copy to any React project):
 *
 *   import { SecureVideoPlayer } from "./SecureVideoPlayer";
 *   import type { SecureVideoPlayerProps, PlayerConfig } from "./SecureVideoPlayer";
 *
 *   <SecureVideoPlayer
 *     src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *     userEmail="user@example.com"
 *     config={{ seekStepS: 10, playbackRates: [1, 1.5, 2] }}
 *   />
 *
 * Advanced (custom storage — e.g. for testing or SSR):
 *
 *   import { MemoryStorageAdapter } from "./SecureVideoPlayer";
 *   // Then inject via the hooks (useYouTubePlayer / useHtml5Player directly)
 */

// ── Main component ────────────────────────────────────────────────────────────
export { SecureVideoPlayer } from "./SecureVideoPlayer";

// ── Security components & hooks ───────────────────────────────────────────────
export { DevToolsGuard }        from "./components/DevToolsGuard";
export { PlayerErrorBoundary }  from "./components/PlayerErrorBoundary";
export { useDevToolsDetect }    from "./hooks/useDevToolsDetection";
export { useSecurity }          from "./hooks/useSecurity";

// ── Public types ──────────────────────────────────────────────────────────────
export type {
  SecureVideoPlayerProps,
  VideoPlayerState,
  VideoPlayerControls,
  VideoPlayerAPI,
} from "./types/player.types";

// ── Config types & utilities ──────────────────────────────────────────────────
export type {
  PlayerConfig,
  KeyboardShortcutMap,
} from "./config/playerConfig";

export {
  PLAYER_DEFAULTS,
  PLAYER_TIMING,
  PIP_CONSTRAINTS,
  DEFAULT_PLAYBACK_RATES,
  QUALITY_LABELS,
  getQualityLabel,
  resolveConfig,
  resolveShortcuts,
  DEFAULT_KEYBOARD_SHORTCUTS,
} from "./config/playerConfig";

// ── Storage adapters (for custom backends / testing) ─────────────────────────
export type { IPlayerStorage }    from "./utils/playerStorage";
export {
  LocalStorageAdapter,
  WebStorageAdapter,
  MemoryStorageAdapter,
  NoopStorageAdapter,
  defaultPlayerStorage,
} from "./utils/playerStorage";

// ── Composable hooks (advanced usage — build your own player UI) ──────────────
export { useYouTubePlayer }        from "./hooks/useYouTubePlayer";
export { useHtml5Player }          from "./hooks/useHtml5Player";
export { useFullscreen }           from "./hooks/useFullscreen";
export { useKeyboardShortcuts }    from "./hooks/useKeyboardShortcuts";
export { usePlayerMilestones }     from "./hooks/usePlayerMilestones";
export { usePlayerCountdown }      from "./hooks/usePlayerCountdown";
export { useControlsVisibility }   from "./hooks/useControlsVisibility";
export { usePiPResize }            from "./hooks/usePiPResize";
export {
  readPersistedSettings,
  useSettingsPersistence,
  usePositionPersistence,
  readResumePosition,
} from "./hooks/usePlayerPersistence";
