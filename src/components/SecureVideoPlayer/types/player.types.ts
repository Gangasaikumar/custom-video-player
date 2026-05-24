/**
 * player.types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All TypeScript interfaces for the SecureVideoPlayer system.
 *
 * SOLID — Interface Segregation:
 *   - VideoPlayerState   — read-only state values
 *   - VideoPlayerControls — action callbacks
 *   - VideoPlayerAPI     — full hook return type (state + controls + refs)
 *   - SecureVideoPlayerProps — public component props
 *
 * Consumers that only need state can import VideoPlayerState.
 * Consumers that only need actions can import VideoPlayerControls.
 * Neither is forced to take the other.
 */

import type { PlayerConfig } from "../config/playerConfig";

// ── State (read-only) ─────────────────────────────────────────────────────────

export interface VideoPlayerState {
  ready:        boolean;
  playing:      boolean;
  currentTime:  number;
  duration:     number;
  buffered:     number;   // 0–1 fraction
  volume:       number;   // 0–100
  muted:        boolean;
  isFullscreen: boolean;
  quality:      string;
  qualities:    string[];
  playbackRate: number;
  loading:      boolean;
  isPiP:        boolean;
}

// ── Controls (actions) ────────────────────────────────────────────────────────

export interface VideoPlayerControls {
  /** Only available on YouTube player */
  play?: () => void;
  /** Only available on YouTube player */
  pause?: () => void;
  togglePlay:       () => void;
  seek:             (time: number) => void;
  setVolume:        (volume: number) => void;
  toggleMute:       () => void;
  toggleFullscreen: () => void;
  setQuality:       (quality: string) => void;
  setPlaybackRate:  (rate: number) => void;
  togglePiP:        () => void;
}

// ── Full hook return type (state + controls + DOM refs) ───────────────────────

export interface VideoPlayerAPI extends VideoPlayerState, VideoPlayerControls {
  /** Container div ref (used for fullscreen requests) */
  ref:      React.RefObject<HTMLDivElement | null>;
  /** Video element ref (div for YouTube, <video> for HTML5) */
  videoRef: React.RefObject<HTMLDivElement | HTMLVideoElement | null>;
}

// ── Public component props ────────────────────────────────────────────────────

export interface SecureVideoPlayerProps {
  /** YouTube video ID, YouTube URL, or direct MP4 URL */
  src: string;

  /**
   * Text used in watermark overlays.
   * Typically the logged-in user's email so content is traceable.
   */
  userEmail: string;

  /** Controlled theater mode (optional — player manages internally if omitted) */
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;

  /** Force player to fill its container width (disables default max-width) */
  fullWidth?: boolean;

  /** Start playback immediately on mount */
  autoPlay?: boolean;

  /** Called when the current video ends */
  onEnded?: () => void;

  /** Show/enable the auto-play next toggle */
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;

  /**
   * Optional behaviour overrides.
   * Lets consumers customise shortcuts, step sizes, playback rates, and
   * storage backend without forking the component.
   *
   * @example
   * <SecureVideoPlayer
   *   src="dQw4w9WgXcQ"
   *   userEmail="user@example.com"
   *   config={{
   *     seekStepS: 10,
   *     playbackRates: [1, 1.5, 2],
   *     keyboardShortcuts: { pip: [] },   // disable PiP shortcut
   *   }}
   * />
   */
  config?: PlayerConfig;
}
