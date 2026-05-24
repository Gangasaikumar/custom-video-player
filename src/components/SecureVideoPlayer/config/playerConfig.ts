/**
 * playerConfig.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every magic number, key, and default value used
 * across the SecureVideoPlayer system.
 *
 * Design pattern: Configuration Object (eliminates scattered magic numbers)
 * SOLID:          Open/Closed — extend defaults via PlayerConfig without
 *                 modifying any hook or component.
 */

// ── Storage keys ──────────────────────────────────────────────────────────────

export const PLAYER_STORAGE_KEYS = {
  VOLUME:   "player-volume",
  MUTED:    "player-muted",
  SPEED:    "player-speed",
  POSITION: (id: string) => `player-pos-${id}`,
} as const;

// ── Timing defaults (ms) ──────────────────────────────────────────────────────

export const PLAYER_TIMING = {
  /** How long controls stay visible after last interaction */
  CONTROLS_HIDE_MS: 3_000,
  /** How often playback position is saved to storage */
  POSITION_SAVE_MS: 2_000,
  /** YouTube IFrame API current-time polling interval */
  YT_POLL_MS: 500,
  /** Debounce after a seek before position polling resumes */
  SEEK_DEBOUNCE_MS: 1_000,
  /** How often the moving watermark changes position */
  WATERMARK_MOVE_MS: 20_000,
  /** Default auto-next countdown length in seconds */
  COUNTDOWN_START_S: 5,
} as const;

// ── Playback defaults ─────────────────────────────────────────────────────────

export const PLAYER_DEFAULTS = {
  VOLUME: 100,
  PLAYBACK_RATE: 1,
  /** Seconds before end where seeking/resumption is blocked */
  POSITION_END_THRESHOLD_S: 2,
  /** Arrow-key seek jump size in seconds */
  SEEK_STEP_S: 5,
  /** Arrow-key volume step (0-100 scale) */
  VOLUME_STEP: 10,
} as const;

// ── PiP window constraints (px) ───────────────────────────────────────────────

export const PIP_CONSTRAINTS = {
  INITIAL_WIDTH: 320,
  MIN_WIDTH:     320,
  MAX_WIDTH:     800,
  EDGE_PADDING:  24,
} as const;

// ── Playback rate options ─────────────────────────────────────────────────────

export const DEFAULT_PLAYBACK_RATES: ReadonlyArray<number> = [
  0.5, 0.75, 1, 1.25, 1.5, 2,
];

// ── Quality label map (YouTube IFrame API quality names → human labels) ───────

export const QUALITY_LABELS: Record<string, string> = {
  hd2160: "4K",
  hd1440: "1440p",
  hd1080: "1080p",
  hd720:  "720p",
  large:  "480p",
  medium: "360p",
  small:  "240p",
  tiny:   "144p",
  auto:   "Auto",
};

export function getQualityLabel(quality: string): string {
  return QUALITY_LABELS[quality] ?? quality;
}

// ── Configurable overrides (passed via SecureVideoPlayerProps) ────────────────

/**
 * All values are optional — anything omitted falls back to the constants above.
 * Pass this via the `config` prop on <SecureVideoPlayer /> to customise
 * behaviour without touching internal source code.
 */
export interface PlayerConfig {
  /** Controls auto-hide timeout in ms (default: 3000) */
  controlsHideMs?: number;
  /** Position save interval in ms (default: 2000) */
  positionSaveMs?: number;
  /** Arrow-key seek jump in seconds (default: 5) */
  seekStepS?: number;
  /** Arrow-key volume step 0-100 (default: 10) */
  volumeStep?: number;
  /** Watermark position change interval in ms (default: 20000) */
  watermarkMoveMs?: number;
  /** Playback rate options shown in Settings menu */
  playbackRates?: number[];
  /** Whether to persist volume/speed/position between sessions */
  persistSettings?: boolean;
  /** Custom keyboard shortcut overrides */
  keyboardShortcuts?: Partial<KeyboardShortcutMap>;
}

export interface KeyboardShortcutMap {
  playPause:         string[];
  mute:              string[];
  fullscreen:        string[];
  theater:           string[];
  pip:               string[];
  seekBackward:      string[];
  seekForward:       string[];
  volumeUp:          string[];
  volumeDown:        string[];
}

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcutMap = {
  playPause:    ["Space", "KeyK"],
  mute:         ["KeyM"],
  fullscreen:   ["KeyF"],
  theater:      ["KeyT"],
  pip:          ["KeyP"],
  seekBackward: ["ArrowLeft"],
  seekForward:  ["ArrowRight"],
  volumeUp:     ["ArrowUp"],
  volumeDown:   ["ArrowDown"],
};

/** Merge a partial shortcut override with the defaults */
export function resolveShortcuts(
  overrides?: Partial<KeyboardShortcutMap>,
): KeyboardShortcutMap {
  return { ...DEFAULT_KEYBOARD_SHORTCUTS, ...overrides };
}

/** Merge a partial PlayerConfig with all defaults */
export function resolveConfig(overrides?: PlayerConfig): Required<Omit<PlayerConfig, "keyboardShortcuts">> & { keyboardShortcuts: KeyboardShortcutMap } {
  return {
    controlsHideMs:    overrides?.controlsHideMs    ?? PLAYER_TIMING.CONTROLS_HIDE_MS,
    positionSaveMs:    overrides?.positionSaveMs    ?? PLAYER_TIMING.POSITION_SAVE_MS,
    seekStepS:         overrides?.seekStepS         ?? PLAYER_DEFAULTS.SEEK_STEP_S,
    volumeStep:        overrides?.volumeStep        ?? PLAYER_DEFAULTS.VOLUME_STEP,
    watermarkMoveMs:   overrides?.watermarkMoveMs   ?? PLAYER_TIMING.WATERMARK_MOVE_MS,
    playbackRates:     overrides?.playbackRates     ?? [...DEFAULT_PLAYBACK_RATES],
    persistSettings:   overrides?.persistSettings   ?? true,
    keyboardShortcuts: resolveShortcuts(overrides?.keyboardShortcuts),
  };
}
