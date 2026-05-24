import { useState, useRef, useEffect, useCallback } from "react";
import type { VideoPlayerAPI } from "../types/player.types";

interface UseHtml5PlayerProps {
  src: string;
  autoplay?: boolean;
  onEnded?: () => void;
}

export function useHtml5Player({
  src,
  autoplay = false,
  onEnded,
}: UseHtml5PlayerProps): VideoPlayerAPI {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState("auto");
  const [qualities, setQualities] = useState<string[]>([]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("player-volume", volume.toString());
    localStorage.setItem("player-muted", muted.toString());
    localStorage.setItem("player-speed", playbackRate.toString());
  }, [volume, muted, playbackRate]);

  // Position persistence
  useEffect(() => {
    if (ready && src && videoRef.current) {
      const savedPos = localStorage.getItem(`player-pos-${src}`);
      if (savedPos) {
        const pos = parseFloat(savedPos);
        if (pos < duration - 2) {
          videoRef.current.currentTime = pos;
        }
      }
    }
  }, [ready, src, duration]);

  useEffect(() => {
    if (ready && playing) {
      const interval = setInterval(() => {
        localStorage.setItem(`player-pos-${src}`, currentTime.toString());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [ready, playing, src, currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setReady(true);
      setLoading(false);
      setQualities(["auto"]);

      if (autoplay) {
        video.play().catch((e) => console.warn("Autoplay blocked:", e));
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(
          video.buffered.end(video.buffered.length - 1) / video.duration,
        );
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => {
      setVolume(video.volume * 100);
      setMuted(video.muted);
    };
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onRateChange = () => setPlaybackRateState(video.playbackRate);

    const onError = () => {
      console.error("Video error:", video.error);
      setLoading(false);
      setReady(false);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("ratechange", onRateChange);
    video.addEventListener("error", onError);

    if (video.readyState >= 1) {
      onLoadedMetadata();
    }

    const handleEnded = () => {
      if (onEndedRef.current) onEndedRef.current();
    };
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("ratechange", onRateChange);
      video.removeEventListener("error", onError);
      video.removeEventListener("ended", handleEnded);
      setLoading(true);
      setReady(false);
    };
  }, [src, autoplay]);

  // Sync settings once ready
  useEffect(() => {
    const video = videoRef.current;
    if (ready && video) {
      video.volume = volume / 100;
      video.muted = muted;
      video.playbackRate = playbackRate;
    }
  }, [ready, volume, muted, playbackRate]);

  // Fullscreen logic
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
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
      if (vol > 0) {
        videoRef.current.muted = false;
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        // Attempt to lock orientation to landscape on mobile for "YouTube-like" experience
        if (screen.orientation && "lock" in screen.orientation) {
          // @ts-expect-error - lock type might be unknown in some TS versions
          await screen.orientation.lock("landscape").catch(() => {
            /* Ignore lock errors */
          });
        }
      } else {
        await document.exitFullscreen();
        // Unlock orientation on exit
        if (screen.orientation && "unlock" in screen.orientation) {
          screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen Error:", err);
    }
  }, []);

  const setQualityFn = useCallback((q: string) => {
    setQuality(q);
  }, []);

  const setPlaybackRateFn = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
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
    togglePlay,
    seek,
    setVolume: setPlayerVolume,
    toggleMute,
    toggleFullscreen,
    setQuality: setQualityFn,
    setPlaybackRate: setPlaybackRateFn,
    togglePiP,
  };
}
