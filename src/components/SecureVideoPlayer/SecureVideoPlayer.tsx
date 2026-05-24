import React, { useState, useCallback } from "react";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";
import { useHtml5Player } from "./hooks/useHtml5Player";
import { usePlayerMilestones } from "./hooks/usePlayerMilestones";
import { usePlayerCountdown } from "./hooks/usePlayerCountdown";
import { useControlsVisibility } from "./hooks/useControlsVisibility";
import { usePiPResize } from "./hooks/usePiPResize";
import { useSecurity } from "./hooks/useSecurity";
import { MovingWatermark } from "./components/MovingWatermark";
import { TiledWatermark } from "./components/TiledWatermark";
import { IframeShield } from "./components/IframeShield";
import { PlayerControls } from "./components/PlayerControls";
import { PlayerLoadingOverlay } from "./components/PlayerLoadingOverlay";
import { PlayerCountdownOverlay } from "./components/PlayerCountdownOverlay";
import { PlayerErrorBoundary } from "./components/PlayerErrorBoundary";
import type {
  VideoPlayerAPI,
  SecureVideoPlayerProps,
} from "./types/player.types";

const getYouTubeId = (url: string) => {
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
};

/**
 * Public entry point.
 * useSecurity() is called HERE — outside the Error Boundary — so right-click
 * and DevTools key blocking remain active even if the inner player crashes.
 */
export function SecureVideoPlayer(props: SecureVideoPlayerProps) {
  // Must stay outside PlayerErrorBoundary so cleanup never fires on a player crash
  useSecurity();

  return (
    <PlayerErrorBoundary>
      <SecureVideoPlayerInner {...props} />
    </PlayerErrorBoundary>
  );
}

function SecureVideoPlayerInner(props: SecureVideoPlayerProps) {
  const youtubeId = getYouTubeId(props.src);

  return youtubeId ? (
    <YoutubeSpecificPlayer videoId={youtubeId} {...props} />
  ) : (
    <Html5SpecificPlayer {...props} />
  );
}

import "./styles/SecureVideoPlayer.css";

function VideoContainer({
  playerState,
  children,
  userEmail,
  isTheaterMode,
  onToggleTheater,
  fullWidth,
  autoPlayNext,
  onToggleAutoPlayNext,
  containerRef,
}: {
  playerState: Omit<VideoPlayerAPI, "ref" | "videoRef">;
  children: React.ReactNode;
  userEmail: string;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  fullWidth?: boolean;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [internalTheater, setInternalTheater] = useState(false);
  const isTheater =
    isTheaterMode !== undefined ? isTheaterMode : internalTheater;

  // Extracted Hooks
  usePlayerMilestones({
    currentTime: playerState.currentTime,
    duration: playerState.duration,
  });

  const { showCountdown, countdown, cancelCountdown } = usePlayerCountdown({
    currentTime: playerState.currentTime,
    duration: playerState.duration,
    autoPlayNext,
  });

  const {
    showControls,
    setShowControls,
    handleMouseMove,
    handleMouseLeave,
    toggleControls,
  } = useControlsVisibility({
    playing: playerState.playing,
    timeoutMs: 3000,
  });

  const { pipWidth, isResizing, startResizing } = usePiPResize({
    isPiP: playerState.isPiP,
  });

  // Force show controls when entering/exiting fullscreen
  React.useEffect(() => {
    setShowControls(true);
  }, [playerState.isFullscreen, setShowControls]);

  const handleToggleTheater = useCallback(() => {
    if (onToggleTheater) {
      onToggleTheater();
    } else {
      setInternalTheater((prev) => !prev);
    }
  }, [onToggleTheater]);

  const wrapperClasses = `secure-player-wrapper ${
    playerState.isPiP
      ? "is-pip"
      : isTheater
        ? "is-theater"
        : fullWidth
          ? "is-theater" // reusing is-theater for 100% width
          : "is-default"
  } ${isResizing ? "is-resizing" : ""} ${playerState.isFullscreen ? "is-fullscreen" : ""}`;

  const innerClasses = `video-inner-container ${
    playerState.isPiP ? "is-pip" : isTheater ? "is-theater" : "is-default"
  } ${playerState.isFullscreen ? "is-fullscreen" : ""}`;

  return (
    <div
      ref={containerRef}
      className={wrapperClasses}
      style={{
        width: playerState.isPiP ? `${pipWidth}px` : undefined,
      }}
    >
      {playerState.isPiP && (
        <div onMouseDown={startResizing} className="pip-resize-handle" />
      )}
      <div
        className={innerClasses}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}

        {/* Interaction Overlay to capture mobile taps reliably */}
        <div
          className="interaction-overlay"
          onPointerUp={(e) => {
            // PointerUp is more reliable for tap on some mobile browsers
            e.stopPropagation();
            toggleControls();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
        {playerState.loading && <PlayerLoadingOverlay />}

        {showCountdown && (
          <PlayerCountdownOverlay
            countdown={countdown}
            onCancel={cancelCountdown}
            onConfirm={() => {
              cancelCountdown();
              // In a real app, you might trigger the actual next video action here
            }}
          />
        )}

        <IframeShield />
        <MovingWatermark text={userEmail} />
        <TiledWatermark text={userEmail} />

        {playerState.ready && (
          <PlayerControls
            {...playerState}
            isTheater={isTheater}
            visible={showControls || !playerState.playing}
            autoPlayNext={autoPlayNext}
            onToggleAutoPlayNext={onToggleAutoPlayNext}
            onPlayPause={playerState.togglePlay}
            onSeek={playerState.seek}
            onTogglePiP={playerState.togglePiP}
            onToggleTheater={handleToggleTheater}
            onVolumeChange={playerState.setVolume}
            onToggleMute={playerState.toggleMute}
            onToggleFullscreen={playerState.toggleFullscreen}
            onSetQuality={playerState.setQuality}
          />
        )}
      </div>
    </div>
  );
}

function YoutubeSpecificPlayer({
  videoId,
  userEmail,
  isTheaterMode,
  onToggleTheater,
  fullWidth,
  autoPlay,
  onEnded,
  autoPlayNext,
  onToggleAutoPlayNext,
}: SecureVideoPlayerProps & { videoId: string }) {
  const playerAPI = useYouTubePlayer({
    videoId,
    autoplay: autoPlay,
    onEnded,
  });

  const { ref: containerRef, videoRef, ...restAPI } = playerAPI;

  return (
    <VideoContainer
      playerState={restAPI}
      userEmail={userEmail}
      isTheaterMode={isTheaterMode}
      onToggleTheater={onToggleTheater}
      fullWidth={fullWidth}
      autoPlayNext={autoPlayNext}
      onToggleAutoPlayNext={onToggleAutoPlayNext}
      containerRef={containerRef}
    >
      <div
        ref={videoRef as React.RefObject<HTMLDivElement>}
        className="video-element"
        style={{ pointerEvents: "none" }}
      />
    </VideoContainer>
  );
}

function Html5SpecificPlayer({
  src,
  userEmail,
  isTheaterMode,
  onToggleTheater,
  fullWidth,
  autoPlay,
  onEnded,
  autoPlayNext,
  onToggleAutoPlayNext,
}: SecureVideoPlayerProps) {
  const playerAPI = useHtml5Player({ src, autoplay: autoPlay, onEnded });

  const { ref: containerRef, videoRef, ...restAPI } = playerAPI;

  return (
    <VideoContainer
      playerState={restAPI}
      userEmail={userEmail}
      isTheaterMode={isTheaterMode}
      onToggleTheater={onToggleTheater}
      fullWidth={fullWidth}
      autoPlayNext={autoPlayNext}
      onToggleAutoPlayNext={onToggleAutoPlayNext}
      containerRef={containerRef}
    >
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        src={src}
        className="video-element-html5"
        playsInline
        controls={false}
        disablePictureInPicture
        style={{ pointerEvents: "none" }}
      />
    </VideoContainer>
  );
}

// Main Export
