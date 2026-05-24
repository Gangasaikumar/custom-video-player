/**
 * usePlayerPersistence.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared persistence hook used by BOTH useYouTubePlayer and useHtml5Player.
 *
 * Previously this logic was copy-pasted identically in both hooks with
 * raw localStorage calls and magic-number intervals.
 *
 * SOLID:
 *   - Single Responsibility: only handles read/write of player settings
 *   - Dependency Inversion: receives IPlayerStorage, doesn't touch localStorage
 *   - Open/Closed: swap storage backend without touching hooks
 *
 * Design pattern: Shared Hook (extracts cross-cutting concern)
 */

import { useEffect } from "react";
import { PLAYER_STORAGE_KEYS, PLAYER_DEFAULTS } from "../config/playerConfig";
import type { IPlayerStorage } from "../utils/playerStorage";
import { defaultPlayerStorage } from "../utils/playerStorage";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PersistenceSettings {
  volume: number;
  muted: boolean;
  playbackRate: number;
}

interface PositionPersistenceProps {
  mediaId: string;        // videoId (YouTube) or src (HTML5)
  currentTime: number;
  duration: number;
  ready: boolean;
  playing: boolean;
  saveIntervalMs?: number;
  storage?: IPlayerStorage;
}

// ── Read initial persisted settings ──────────────────────────────────────────

export function readPersistedSettings(
  storage: IPlayerStorage = defaultPlayerStorage,
): PersistenceSettings {
  const rawVolume = storage.get(PLAYER_STORAGE_KEYS.VOLUME);
  const rawMuted  = storage.get(PLAYER_STORAGE_KEYS.MUTED);
  const rawSpeed  = storage.get(PLAYER_STORAGE_KEYS.SPEED);

  return {
    volume:       rawVolume ? parseInt(rawVolume, 10)   : PLAYER_DEFAULTS.VOLUME,
    muted:        rawMuted === "true",
    playbackRate: rawSpeed  ? parseFloat(rawSpeed)       : PLAYER_DEFAULTS.PLAYBACK_RATE,
  };
}

// ── Write settings on change ──────────────────────────────────────────────────

export function useSettingsPersistence(
  settings: PersistenceSettings,
  storage: IPlayerStorage = defaultPlayerStorage,
  enabled = true,
): void {
  const { volume, muted, playbackRate } = settings;

  useEffect(() => {
    if (!enabled) return;
    storage.set(PLAYER_STORAGE_KEYS.VOLUME, volume.toString());
    storage.set(PLAYER_STORAGE_KEYS.MUTED,  muted.toString());
    storage.set(PLAYER_STORAGE_KEYS.SPEED,  playbackRate.toString());
  }, [volume, muted, playbackRate, storage, enabled]);
}

// ── Read resume position ──────────────────────────────────────────────────────

export function readResumePosition(
  mediaId: string,
  duration: number,
  storage: IPlayerStorage = defaultPlayerStorage,
): number | null {
  const raw = storage.get(PLAYER_STORAGE_KEYS.POSITION(mediaId));
  if (!raw) return null;
  const pos = parseFloat(raw);
  if (isNaN(pos)) return null;
  // Don't resume if within the last N seconds — let it restart
  if (pos >= duration - PLAYER_DEFAULTS.POSITION_END_THRESHOLD_S) return null;
  return pos;
}

// ── Auto-save playback position while playing ─────────────────────────────────

export function usePositionPersistence({
  mediaId,
  currentTime,
  duration,
  ready,
  playing,
  saveIntervalMs,
  storage = defaultPlayerStorage,
}: PositionPersistenceProps): void {
  useEffect(() => {
    if (!ready || !playing || !mediaId) return;

    const interval = setInterval(() => {
      storage.set(PLAYER_STORAGE_KEYS.POSITION(mediaId), currentTime.toString());
    }, saveIntervalMs);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, playing, mediaId, currentTime, saveIntervalMs]);
}
