import { useEffect, useRef, useState, useCallback } from "react";
import "../types/youtube-api.d.ts";
import { loadYouTubeAPI } from "../utils/useYouTubeAPI";
import type { VideoPlayerAPI } from "../types/player.types";

interface UseYouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  onEnded?: () => void;
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
}: UseYouTubePlayerProps): VideoPlayerAPI {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ExtendedYTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("player-volume");
    return saved ? parseInt(saved, 10) : 100;
  });
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem("player-muted");
    return saved === "true";
  });
  const [playbackRate, setPlaybackRateState] = useState(() => {
    const saved = localStorage.getItem("player-speed");
    return saved ? parseFloat(saved) : 1;
  });
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const isSeeking = useRef(false);
  const [quality, setQuality] = useState<string>("auto");
  const [qualities, setQualities] = useState<string[]>([]);

  // Create a ref for the video element placeholder
  const videoRef = useRef<HTMLDivElement>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("player-volume", volume.toString());
    localStorage.setItem("player-muted", muted.toString());
    localStorage.setItem("player-speed", playbackRate.toString());
  }, [volume, muted, playbackRate]);

  // Position persistence
  useEffect(() => {
    if (ready && videoId) {
      const savedPos = localStorage.getItem(`player-pos-${videoId}`);
      if (savedPos) {
        const pos = parseFloat(savedPos);
        if (pos < duration - 2) {
          playerRef.current?.seekTo(pos, true);
        }
      }
    }
  }, [ready, videoId, duration]);

  useEffect(() => {
    if (ready && playing && !isSeeking.current) {
      const interval = setInterval(() => {
        localStorage.setItem(`player-pos-${videoId}`, currentTime.toString());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [ready, playing, videoId, currentTime]);

  // Initialize Player
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
            const availableLevels = p.getAvailableQualityLevels();
            if (Array.isArray(availableLevels)) {
              setQualities(availableLevels);
            }
            setQuality(p.getPlaybackQuality());
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setPlaying(event.data === window.YT.PlayerState.PLAYING);
            setLoading(event.data === window.YT.PlayerState.BUFFERING);

            if (event.data === window.YT.PlayerState.PLAYING) {
              setDuration(event.target.getDuration());
              setQualities(event.target.getAvailableQualityLevels());
            }
            if (
              event.data === window.YT.PlayerState.ENDED &&
              onEndedRef.current
            ) {
              onEndedRef.current();
            }
          },
          onPlaybackQualityChange: (event: YT.OnPlaybackQualityChangeEvent) => {
            setQuality(event.data);
          },
          onPlaybackRateChange: (event: YT.OnPlaybackRateChangeEvent) => {
            setPlaybackRateState(event.data);
          },
        },
      }) as ExtendedYTPlayer;
    };

    initPlayer();

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch {
          /* ignore */
        }
      }
      setReady(false);
      setLoading(true);
    };
  }, [videoId, autoplay, onEndedRef]);

  // Sync settings once ready
  useEffect(() => {
    if (ready && playerRef.current) {
      const player = playerRef.current;
      player.setVolume(volume);
      if (muted) {
        player.mute();
      } else {
        player.unMute();
      }
      player.setPlaybackRate(playbackRate);
    }
  }, [ready, volume, muted, playbackRate]);

  // Poll current time
  useEffect(() => {
    if (!ready || !playerRef.current) return;

    const id = setInterval(() => {
      try {
        if (
          !isSeeking.current &&
          playerRef.current &&
          typeof playerRef.current.getCurrentTime === "function"
        ) {
          const time = playerRef.current.getCurrentTime();
          if (!isNaN(time)) {
            setCurrentTime(time);
          }

          if (typeof playerRef.current.getVideoLoadedFraction === "function") {
            setBuffered(playerRef.current.getVideoLoadedFraction());
          }
        }
      } catch {
        // ignore
      }
    }, 500);

    return () => clearInterval(id);
  }, [ready]);

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      pause();
    } else {
      play();
    }
  }, [playing, play, pause]);

  const seek = useCallback((time: number) => {
    isSeeking.current = true;
    setCurrentTime(time);
    playerRef.current?.seekTo(time, true);

    setTimeout(() => {
      isSeeking.current = false;
    }, 1000);
  }, []);

  const setPlayerVolume = useCallback((vol: number) => {
    playerRef.current?.setVolume(vol);
    setVolume(vol);
    if (vol > 0) {
      playerRef.current?.unMute();
      setMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (muted) {
      playerRef.current?.unMute();
      setMuted(false);
    } else {
      playerRef.current?.mute();
      setMuted(true);
    }
  }, [muted]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        if (screen.orientation && "lock" in screen.orientation) {
          // @ts-expect-error - lock type might be unknown in some TS versions
          await screen.orientation.lock("landscape").catch(() => {});
        }
      } else {
        await document.exitFullscreen();
        if (screen.orientation && "unlock" in screen.orientation) {
          screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const handleSetQuality = useCallback((q: string) => {
    playerRef.current?.setPlaybackQuality(q as YT.SuggestedVideoQuality);
    setQuality(q);
  }, []);

  const handleSetPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRateState(rate);
  }, []);

  const togglePiP = useCallback(() => {
    setIsPiP((prev) => !prev);
  }, []);

  return {
    ref: containerRef,
    videoRef,
    ready,
    playing,
    currentTime,
    duration,
    buffered,
    volume,
    muted,
    isFullscreen,
    quality,
    qualities,
    playbackRate,
    loading,
    isPiP,
    play,
    pause,
    togglePlay,
    seek,
    setVolume: setPlayerVolume,
    toggleMute,
    toggleFullscreen,
    setQuality: handleSetQuality,
    setPlaybackRate: handleSetPlaybackRate,
    togglePiP,
  };
}
