/**
 * useHtml5Player.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * HTML5 <video> player hook.
 *
 * Refactored to:
 *   - Use IPlayerStorage (no direct localStorage calls)
 *   - Use usePlayerPersistence for shared volume/position logic
 *   - Use useFullscreen for shared fullscreen + orientation lock
 *   - Remove all magic numbers (replaced with config constants)
 *
 * SOLID:
 *   - Single Responsibility: HTML5-specific event wiring + state sync only
 *   - Dependency Inversion: depends on IPlayerStorage interface
 *   - Open/Closed: pass a different storage adapter without touching this file
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type { VideoPlayerAPI } from "../types/player.types";
import type { IPlayerStorage } from "../utils/playerStorage";
import { defaultPlayerStorage } from "../utils/playerStorage";
import { PLAYER_TIMING } from "../config/playerConfig";
import {
  readPersistedSettings,
  useSettingsPersistence,
  usePositionPersistence,
  readResumePosition,
} from "./usePlayerPersistence";
import { useFullscreen } from "./useFullscreen";

interface UseHtml5PlayerProps {
  src: string;
  autoplay?: boolean;
  onEnded?: () => void;
  /** Inject a custom storage adapter (default: localStorage) */
  storage?: IPlayerStorage;
  /** Position save interval override in ms */
  positionSaveMs?: number;
}

export function useHtml5Player({
  src,
  autoplay = false,
  onEnded,
  storage = defaultPlayerStorage,
  positionSaveMs = PLAYER_TIMING.POSITION_SAVE_MS,
}: UseHtml5PlayerProps): VideoPlayerAPI {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const onEndedRef   = useRef(onEnded);

  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  // ── Read persisted initial values ──────────────────────────────────────────
  const persisted = readPersistedSettings(storage);

  const [ready,        setReady]           = useState(false);
  const [playing,      setPlaying]         = useState(false);
  const [currentTime,  setCurrentTime]     = useState(0);
  const [duration,     setDuration]        = useState(0);
  const [buffered,     setBuffered]        = useState(0);
  const [volume,       setVolume]          = useState(persisted.volume);
  const [muted,        setMuted]           = useState(persisted.muted);
  const [playbackRate, setPlaybackRateState] = useState(persisted.playbackRate);
  const [loading,      setLoading]         = useState(true);
  const [isPiP,        setIsPiP]           = useState(false);
  const [quality,      setQuality]         = useState("auto");
  const [qualities,    setQualities]       = useState<string[]>([]);

  // ── Fullscreen (shared hook, no duplication) ───────────────────────────────
  const { isFullscreen, toggleFullscreen } = useFullscreen({ containerRef });

  // ── Persist settings on change ─────────────────────────────────────────────
  useSettingsPersistence({ volume, muted, playbackRate }, storage);

  // ── Auto-save position while playing ──────────────────────────────────────
  usePositionPersistence({
    mediaId: src,
    currentTime,
    duration,
    ready,
    playing,
    saveIntervalMs: positionSaveMs,
    storage,
  });

  // ── Attach native video events ─────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setReady(true);
      setLoading(false);
      // HTML5 <video> has no programmatic quality switching — leave qualities
      // empty so the Settings menu shows Speed only (no misleading Quality section)
      if (autoplay) video.play().catch((e) => console.warn("[Html5Player] Autoplay blocked:", e));

      // Resume saved position
      const pos = readResumePosition(src, video.duration, storage);
      if (pos !== null) video.currentTime = pos;
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1) / video.duration);
      }
    };

    const onPlay        = () => setPlaying(true);
    const onPause       = () => setPlaying(false);
    const onVolumeChange = () => { setVolume(video.volume * 100); setMuted(video.muted); };
    const onWaiting     = () => setLoading(true);
    const onPlaying     = () => setLoading(false);
    const onRateChange  = () => setPlaybackRateState(video.playbackRate);
    const onError       = () => { console.error("[Html5Player] Video error:", video.error); setLoading(false); setReady(false); };
    const onEnded       = () => onEndedRef.current?.();

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate",     onTimeUpdate);
    video.addEventListener("play",           onPlay);
    video.addEventListener("pause",          onPause);
    video.addEventListener("volumechange",   onVolumeChange);
    video.addEventListener("waiting",        onWaiting);
    video.addEventListener("playing",        onPlaying);
    video.addEventListener("ratechange",     onRateChange);
    video.addEventListener("error",          onError);
    video.addEventListener("ended",          onEnded);

    if (video.readyState >= 1) onLoadedMetadata();

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate",     onTimeUpdate);
      video.removeEventListener("play",           onPlay);
      video.removeEventListener("pause",          onPause);
      video.removeEventListener("volumechange",   onVolumeChange);
      video.removeEventListener("waiting",        onWaiting);
      video.removeEventListener("playing",        onPlaying);
      video.removeEventListener("ratechange",     onRateChange);
      video.removeEventListener("error",          onError);
      video.removeEventListener("ended",          onEnded);
      setLoading(true);
      setReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoplay]);

  // ── Sync settings once ready ───────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!ready || !video) return;
    video.volume       = volume / 100;
    video.muted        = muted;
    video.playbackRate = playbackRate;
  }, [ready, volume, muted, playbackRate]);

  // ── Controls ───────────────────────────────────────────────────────────────

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }, []);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setPlayerVolume = useCallback((vol: number) => {
    if (videoRef.current) {
      videoRef.current.volume = vol / 100;
      if (vol > 0) videoRef.current.muted = false;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  }, []);

  const setQualityFn = useCallback((q: string) => { setQuality(q); }, []);

  const setPlaybackRateFn = useCallback((rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, []);

  const togglePiP = useCallback(() => setIsPiP((p) => !p), []);

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    ref: containerRef,
    videoRef,
    ready, playing, currentTime, duration, buffered,
    volume, muted, isFullscreen, quality, qualities,
    playbackRate, loading, isPiP,
    togglePlay, seek,
    setVolume: setPlayerVolume,
    toggleMute, toggleFullscreen,
    setQuality: setQualityFn,
    setPlaybackRate: setPlaybackRateFn,
    togglePiP,
  };
}
