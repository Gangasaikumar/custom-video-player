/**
 * PlayerControls.tsx  — Orchestrator (thin coordinator)
 * ─────────────────────────────────────────────────────────────────────────────
 * Assembles TimelineBar, VolumeControl, SettingsMenu, and ControlTooltip into
 * the complete control bar. Contains NO business logic itself.
 *
 * SOLID:
 *   - Single Responsibility: layout + wiring only
 *   - Open/Closed: extend via sub-components, not by modifying this file
 *   - Liskov Substitution: each sub-component is independently replaceable
 *   - Interface Segregation: PlayerControlsProps carries only what this
 *     orchestrator needs to forward — no god-object
 *   - Dependency Inversion: depends on sub-component abstractions, not their
 *     internal implementations
 *
 * Design patterns:
 *   - Composite: assembles leaf components into the full bar
 *   - Facade: exposes one surface to SecureVideoPlayer
 */

import { useCallback, useMemo } from "react";
import {
  Play, Pause,
  Maximize, Minimize,
  RectangleHorizontal,
  PictureInPicture,
} from "lucide-react";

import { TimelineBar }   from "./TimelineBar";
import { VolumeControl } from "./VolumeControl";
import { SettingsMenu }  from "./SettingsMenu";
import { ControlTooltip } from "./ControlTooltip";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import type { PlayerConfig } from "../config/playerConfig";
import { PLAYER_DEFAULTS } from "../config/playerConfig";

import "../styles/PlayerControls.css";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PlayerControlsProps {
  // State
  playing: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  isTheater: boolean;
  quality: string;
  qualities: string[];
  playbackRate: number;
  loading: boolean;
  isPiP: boolean;
  visible: boolean;
  autoPlayNext?: boolean;
  // Actions
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleTheater: () => void;
  onSetQuality: (quality: string) => void;
  setPlaybackRate: (rate: number) => void;
  onTogglePiP: () => void;
  onToggleAutoPlayNext?: () => void;
  /** Optional player-level config overrides (shortcuts, step sizes, rates) */
  config?: PlayerConfig;
}

// ── Time formatter (pure utility) ─────────────────────────────────────────────

function formatTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── PiP mini-controls (shown instead of full bar when in PiP mode) ────────────

function PiPControls({
  playing, visible, onPlayPause, onTogglePiP,
}: Pick<PlayerControlsProps, "playing" | "visible" | "onPlayPause" | "onTogglePiP">) {
  return (
    <div className="player-controls-pip" style={{ opacity: visible ? 1 : 0 }}>
      <button onClick={onPlayPause} className="pip-button pip-play-pause">
        {playing ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
      </button>
      <button onClick={onTogglePiP} className="pip-button pip-toggle" title="Exit PiP">
        <PictureInPicture size={28} />
      </button>
    </div>
  );
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

export function PlayerControls(props: PlayerControlsProps) {
  const {
    playing, currentTime, duration, buffered,
    volume, muted, isFullscreen, isTheater,
    quality, qualities, playbackRate, loading,
    isPiP, visible, autoPlayNext,
    onPlayPause, onSeek, onVolumeChange, onToggleMute,
    onToggleFullscreen, onToggleTheater, onSetQuality,
    setPlaybackRate, onTogglePiP, onToggleAutoPlayNext,
    config,
  } = props;

  const seekStep   = config?.seekStepS  ?? PLAYER_DEFAULTS.SEEK_STEP_S;
  const volumeStep = config?.volumeStep ?? PLAYER_DEFAULTS.VOLUME_STEP;

  // Stable action callbacks forwarded to the keyboard hook
  const actions = useMemo(() => ({
    onPlayPause,
    onMute:         onToggleMute,
    onFullscreen:   onToggleFullscreen,
    onTheater:      onToggleTheater,
    onPiP:          onTogglePiP,
    onSeekBackward: () => onSeek(Math.max(0, currentTime - seekStep)),
    onSeekForward:  () => onSeek(Math.min(duration, currentTime + seekStep)),
    onVolumeUp:     () => onVolumeChange(Math.min(100, volume + volumeStep)),
    onVolumeDown:   () => onVolumeChange(Math.max(0, volume - volumeStep)),
  }), [
    onPlayPause, onToggleMute, onToggleFullscreen, onToggleTheater, onTogglePiP,
    onSeek, currentTime, seekStep, duration, onVolumeChange, volume, volumeStep,
  ]);

  useKeyboardShortcuts({
    actions,
    shortcuts: config?.keyboardShortcuts,
  });

  const handleSetPlaybackRate = useCallback(
    (rate: number) => setPlaybackRate(rate),
    [setPlaybackRate],
  );

  // ── PiP mode: minimal controls only ────────────────────────────────────────
  if (isPiP) {
    return (
      <PiPControls
        playing={playing}
        visible={visible}
        onPlayPause={onPlayPause}
        onTogglePiP={onTogglePiP}
      />
    );
  }

  // ── Full control bar ────────────────────────────────────────────────────────
  return (
    <div
      className="player-controls-container"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      {/* Timeline */}
      <TimelineBar
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        onSeek={onSeek}
      />

      {/* Controls row */}
      <div className="controls-row">

        {/* ── Left group ───────────────────────────────────────────────────── */}
        <div className="controls-group">
          {/* Play / Pause */}
          <div className="control-pill control-pill-compact">
            <ControlTooltip label={playing ? "Pause" : "Play"} shortcut="Space">
              <button
                onClick={onPlayPause}
                className="play-button"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing
                  ? <Pause size={18} fill="white" />
                  : <Play  size={18} fill="white" />
                }
                {loading && (
                  <div className="loading-spinner-container">
                    <div className="loading-spinner" />
                  </div>
                )}
              </button>
            </ControlTooltip>
          </div>

          {/* Volume */}
          <VolumeControl
            volume={volume}
            muted={muted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />

          {/* Time display */}
          <div className="control-pill time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* ── Right group ──────────────────────────────────────────────────── */}
        <div className="controls-group">
          <div className="control-pill control-pill-standard">
            {/* Auto-play next toggle */}
            {onToggleAutoPlayNext && (
              <div className="auto-play-toggle-container">
                <ControlTooltip label="Auto-play Next">
                  <button
                    onClick={onToggleAutoPlayNext}
                    className={`auto-play-toggle-btn ${autoPlayNext ? "active" : ""}`}
                  >
                    <div className="auto-play-toggle-thumb" />
                  </button>
                </ControlTooltip>
              </div>
            )}

            {/* Settings (quality + speed) */}
            <SettingsMenu
              quality={quality}
              qualities={qualities}
              playbackRate={playbackRate}
              playbackRates={config?.playbackRates}
              onSetQuality={onSetQuality}
              onSetPlaybackRate={handleSetPlaybackRate}
            />
          </div>

          <div className="control-pill control-pill-minimal">
            {/* Theater mode */}
            <ControlTooltip label={isTheater ? "Exit Theater" : "Theater Mode"} shortcut="T">
              <button
                onClick={onToggleTheater}
                className="play-button"
                aria-label="Theater Mode"
              >
                <RectangleHorizontal size={18} />
              </button>
            </ControlTooltip>

            {/* PiP */}
            <ControlTooltip label="Picture in Picture" shortcut="P">
              <button
                onClick={onTogglePiP}
                className="play-button"
                aria-label="Picture in Picture"
              >
                <PictureInPicture size={18} />
                {isPiP && <div className="pip-overlay-glow" />}
              </button>
            </ControlTooltip>

            {/* Fullscreen */}
            <ControlTooltip
              label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              shortcut="F"
            >
              <button
                onClick={onToggleFullscreen}
                className="play-button"
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </ControlTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
