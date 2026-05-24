/**
 * useYouTubePlayer.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * YouTube IFrame API player hook.
 *
 * Refactored to:
 *   - Use IPlayerStorage (no direct localStorage calls)
 *   - Use usePlayerPersistence for shared volume/position logic
 *   - Use useFullscreen for shared fullscreen + orientation lock
 *   - Remove all magic numbers (replaced with config constants)
 *
 * SOLID:
 *   - Single Responsibility: YT-specific init + state sync only
 *   - Dependency Inversion: depends on IPlayerStorage interface
 *   - Open/Closed: pass a different storage adapter without touching this file
 */

import { useEffect, useRef, useState, useCallback } from "react";
import "../types/youtube-api.d.ts";
import { loadYouTubeAPI }      from "../utils/useYouTubeAPI";
import type { VideoPlayerAPI } from "../types/player.types";
import type { IPlayerStorage } from "../utils/playerStorage";
import { defaultPlayerStorage } from "../utils/playerStorage";
import {
  PLAYER_DEFAULTS,
  PLAYER_TIMING,
} from "../config/playerConfig";
import {
  readPersistedSettings,
  useSettingsPersistence,
  usePositionPersistence,
  readResumePosition,
} from "./usePlayerPersistence";
import { useFullscreen } from "./useFullscreen";

interface UseYouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  onEnded?: () => void;
  /** Inject a custom storage adapter (default: localStorage) */
  storage?: IPlayerStorage;
  /** Position save interval override in ms */
  positionSaveMs?: number;
}

interface ExtendedYTPlayer extends YT.Player {
  getVideoData(): { title: string; video_id: string; author: string };
}

interface ExtendedPlayerVars extends YT.PlayerVars {
  widget_referrer?: string;
}

export function useYouTubePlayer({
  videoId,
  autoplay = false,
  onEnded,
  storage = defaultPlayerStorage,
  positionSaveMs = PLAYER_TIMING.POSITION_SAVE_MS,
}: UseYouTubePlayerProps): VideoPlayerAPI {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef    = useRef<ExtendedYTPlayer | null>(null);
  const videoRef     = useRef<HTMLDivElement>(null);
  const onEndedRef   = useRef(onEnded);
  const isSeeking    = useRef(false);

  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  // ── Read persisted initial values ──────────────────────────────────────────
  const persisted = readPersistedSettings(storage);

  const [ready,          setReady]          = useState(false);
  const [playing,        setPlaying]        = useState(false);
  const [currentTime,    setCurrentTime]    = useState(0);
  const [duration,       setDuration]       = useState(0);
  const [buffered,       setBuffered]       = useState(0);
  const [volume,         setVolume]         = useState(persisted.volume);
  const [muted,          setMuted]          = useState(persisted.muted);
  const [playbackRate,   setPlaybackRateState] = useState(persisted.playbackRate);
  const [loading,        setLoading]        = useState(true);
  const [isPiP,          setIsPiP]          = useState(false);
  const [quality,        setQuality]        = useState<string>("auto");
  const [qualities,      setQualities]      = useState<string[]>([]);

  // ── Fullscreen (shared hook, no duplication) ───────────────────────────────
  const { isFullscreen, toggleFullscreen } = useFullscreen({ containerRef });

  // ── Persist settings on change ─────────────────────────────────────────────
  useSettingsPersistence({ volume, muted, playbackRate }, storage);

  // ── Resume position ────────────────────────────────────────────────────────
  useEffect(() => {
    if (ready && videoId && duration > 0) {
      const pos = readResumePosition(videoId, duration, storage);
      if (pos !== null) playerRef.current?.seekTo(pos, true);
    }
  }, [ready, videoId, duration, storage]);

  // ── Auto-save position while playing ──────────────────────────────────────
  usePositionPersistence({
    mediaId: videoId,
    currentTime,
    duration,
    ready,
    playing,
    saveIntervalMs: positionSaveMs,
    storage,
  });

  // ── Initialize YouTube player ──────────────────────────────────────────────
  useEffect(() => {
    let player: ExtendedYTPlayer | undefined;

    const initPlayer = async () => {
      if (!videoRef.current) return;
      setLoading(true);
      await loadYouTubeAPI();
      if (!videoRef.current) return;

      videoRef.current.innerHTML = '<div id="yt-player-instance"></div>';

      player = new window.YT.Player("yt-player-instance", {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          modestbranding: 1,
          rel: 0,
          controls: 0,
          fs: 0,
          autoplay: autoplay ? 1 : 0,
          enablejsapi: 1,
          widget_referrer: window.location.origin,
        } as ExtendedPlayerVars,
        events: {
          onReady: (event: YT.PlayerEvent) => {
            const p = event.target as ExtendedYTPlayer;
            playerRef.current = p;
            setReady(true);
            setLoading(false);
            setDuration(p.getDuration());
            const levels = p.getAvailableQualityLevels();
            if (Array.isArray(levels)) setQualities(levels);
            setQuality(p.getPlaybackQuality());
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setPlaying(event.data === window.YT.PlayerState.PLAYING);
            setLoading(event.data === window.YT.PlayerState.BUFFERING);
            if (event.data === window.YT.PlayerState.PLAYING) {
              setDuration(event.target.getDuration());
              setQualities(event.target.getAvailableQualityLevels());
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
          onPlaybackQualityChange: (e: YT.OnPlaybackQualityChangeEvent) => {
            setQuality(e.data);
          },
          onPlaybackRateChange: (e: YT.OnPlaybackRateChangeEvent) => {
            setPlaybackRateState(e.data);
          },
        },
      }) as ExtendedYTPlayer;
    };

    initPlayer();

    return () => {
      try { player?.destroy(); } catch { /* ignore */ }
      setReady(false);
      setLoading(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, autoplay]);

  // ── Sync settings once player is ready ────────────────────────────────────
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    playerRef.current.setVolume(volume);
    if (muted) playerRef.current.mute(); else playerRef.current.unMute();
    playerRef.current.setPlaybackRate(playbackRate);
  }, [ready, volume, muted, playbackRate]);

  // ── Poll current time + buffer ─────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    const id = setInterval(() => {
      try {
        const p = playerRef.current;
        if (!p || isSeeking.current) return;
        if (typeof p.getCurrentTime === "function") {
          const t = p.getCurrentTime();
          if (!isNaN(t)) setCurrentTime(t);
        }
        if (typeof p.getVideoLoadedFraction === "function") {
          setBuffered(p.getVideoLoadedFraction());
        }
      } catch { /* ignore */ }
    }, PLAYER_TIMING.YT_POLL_MS);
    return () => clearInterval(id);
  }, [ready]);

  // ── Controls ───────────────────────────────────────────────────────────────

  const play = useCallback(() => { playerRef.current?.playVideo(); }, []);
  const pause = useCallback(() => { playerRef.current?.pauseVideo(); }, []);

  const togglePlay = useCallback(() => {
    playing ? pause() : play();
  }, [playing, play, pause]);

  const seek = useCallback((time: number) => {
    isSeeking.current = true;
    setCurrentTime(time);
    playerRef.current?.seekTo(time, true);
    setTimeout(() => { isSeeking.current = false; }, PLAYER_TIMING.SEEK_DEBOUNCE_MS);
  }, []);

  const setPlayerVolume = useCallback((vol: number) => {
    playerRef.current?.setVolume(vol);
    setVolume(vol);
    if (vol > 0) { playerRef.current?.unMute(); setMuted(false); }
  }, []);

  const toggleMute = useCallback(() => {
    if (muted) { playerRef.current?.unMute(); setMuted(false); }
    else        { playerRef.current?.mute();   setMuted(true);  }
  }, [muted]);

  const handleSetQuality = useCallback((q: string) => {
    playerRef.current?.setPlaybackQuality(q as YT.SuggestedVideoQuality);
    setQuality(q);
  }, []);

  const handleSetPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRateState(rate);
  }, []);

  const togglePiP = useCallback(() => setIsPiP((p) => !p), []);

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    ref: containerRef,
    videoRef,
    ready, playing, currentTime, duration, buffered,
    volume, muted, isFullscreen, quality, qualities,
    playbackRate, loading, isPiP,
    play, pause, togglePlay, seek,
    setVolume: setPlayerVolume,
    toggleMute, toggleFullscreen,
    setQuality: handleSetQuality,
    setPlaybackRate: handleSetPlaybackRate,
    togglePiP,
  };
}
