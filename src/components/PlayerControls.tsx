import React, { useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RectangleHorizontal,
  PictureInPicture,
} from "lucide-react";
import "../styles/PlayerControls.css";

interface ControlTooltipProps {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
  visible?: boolean;
}

function ControlTooltip({
  label,
  shortcut,
  children,
  visible = true,
}: ControlTooltipProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="control-tooltip-wrapper" /* Replaced: style={{ position: "relative", display: "flex", alignItems: "center" }} */
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && visible && (
        <div className="control-tooltip-popup">
          <span>{label}</span>
          {shortcut && (
            <span className="control-tooltip-shortcut">{shortcut}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface PlayerControlsProps {
  playing: boolean;
  currentTime: number;
  duration: number;
  buffered: number; // 0 to 1
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  isTheater: boolean;
  quality: string;
  qualities: string[];
  visible: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleTheater: () => void;
  onSetQuality: (quality: string) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  loading: boolean;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
  isPiP: boolean;
  onTogglePiP: () => void;
}

export function PlayerControls({
  playing,
  currentTime,
  duration,
  buffered,
  volume,
  muted,
  isFullscreen,
  quality,
  qualities,
  visible,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onToggleTheater,
  onSetQuality,
  playbackRate,
  setPlaybackRate,
  loading,
  autoPlayNext = false,
  onToggleAutoPlayNext,
  isPiP,
  onTogglePiP,
}: PlayerControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onPlayPause();
          break;
        case "KeyK":
          onPlayPause();
          break;
        case "KeyM":
          onToggleMute();
          break;
        case "KeyF":
          onToggleFullscreen();
          break;
        case "KeyT":
          onToggleTheater();
          break;
        case "KeyP":
          onTogglePiP();
          break;
        case "ArrowLeft":
          onSeek(Math.max(0, currentTime - 5));
          break;
        case "ArrowRight":
          onSeek(Math.min(duration, currentTime + 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          onVolumeChange(Math.min(100, volume + 10));
          break;
        case "ArrowDown":
          e.preventDefault();
          onVolumeChange(Math.max(0, volume - 10));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    onPlayPause,
    onToggleMute,
    onToggleFullscreen,
    onToggleTheater,
    onSeek,
    onVolumeChange,
    currentTime,
    duration,
    volume,
    onTogglePiP,
  ]);

  // Tooltip state
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setSliderValue(newValue);
    onSeek(newValue);
  };

  const handleSeekMouseDown = () => {
    setSliderValue(currentTime);
    setIsDragging(true);
  };
  const handleSeekMouseUp = () => setIsDragging(false);

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(percentage * duration);
    setHoverPos(x);
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
    setHoverPos(null);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getQualityLabel = (q: string) => {
    switch (q) {
      case "hd2160":
        return "4K";
      case "hd1440":
        return "1440p";
      case "hd1080":
        return "1080p";
      case "hd720":
        return "720p";
      case "large":
        return "480p";
      case "medium":
        return "360p";
      case "small":
        return "240p";
      case "tiny":
        return "144p";
      case "auto":
        return "Auto";
      default:
        return q;
    }
  };

  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  const currentValue = isDragging ? sliderValue : currentTime;
  const seekProgress = duration > 0 ? (currentValue / duration) * 100 : 0;
  const bufferedPercent = buffered * 100;

  if (isPiP) {
    return (
      <div className="player-controls-pip" style={{ opacity: visible ? 1 : 0 }}>
        <button onClick={onPlayPause} className="pip-button pip-play-pause">
          {playing ? (
            <Pause size={28} fill="white" />
          ) : (
            <Play size={28} fill="white" />
          )}
        </button>

        <button
          onClick={onTogglePiP}
          className="pip-button pip-toggle"
          title="Exit Picture in Picture"
        >
          <PictureInPicture size={28} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="player-controls-container"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Timeline Container */}
      <div
        ref={timelineRef}
        className="timeline-container"
        onMouseMove={handleTimelineMouseMove}
        onMouseLeave={handleTimelineMouseLeave}
      >
        {/* Tooltip */}
        {hoverTime !== null && hoverPos !== null && (
          <div className="timeline-tooltip" style={{ left: hoverPos }}>
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Track Base */}
        <div className="timeline-track-base" />

        {/* Buffered Bar */}
        <div
          className="timeline-buffered"
          style={{ width: `${bufferedPercent}%` }}
        />

        {/* Progress Bar */}
        <div
          className="timeline-progress"
          style={{ width: `${seekProgress}%` }}
        />

        {/* Playhead */}
        <div
          className="timeline-playhead"
          style={{ left: `${seekProgress}%` }}
        />

        {/* Click/Drag Area */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentValue}
          onChange={handleSeekChange}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}
          className="timeline-input"
        />
      </div>

      {/* Controls Row */}
      {/* Controls Row */}
      <div className="controls-row">
        {/* LEFT GROUP */}
        <div className="controls-group">
          {/* Play/Pause Pill */}
          <div className="control-pill control-pill-compact">
            <ControlTooltip label={playing ? "Pause" : "Play"} shortcut="Space">
              <button
                onClick={onPlayPause}
                className="play-button"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <Pause size={18} fill="white" />
                ) : (
                  <Play size={18} fill="white" />
                )}
                {loading && (
                  <div className="loading-spinner-container">
                    <div className="loading-spinner" />
                  </div>
                )}
              </button>
            </ControlTooltip>
          </div>

          {/* Volume Pill with Hover Expand */}
          <div
            className={`control-pill volume-container ${
              isVolumeHovered ? "expanded" : ""
            }`}
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <ControlTooltip
              label={muted || volume === 0 ? "Unmute" : "Mute"}
              shortcut="M"
            >
              <button
                onClick={onToggleMute}
                className="play-button"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
            </ControlTooltip>
            <div
              className="volume-slider-wrapper"
              style={{ width: isVolumeHovered ? "60px" : "0px" }}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="volume-slider"
                style={{
                  background: `linear-gradient(to right, #fff ${
                    muted ? 0 : volume
                  }%, rgba(255,255,255,0.3) ${muted ? 0 : volume}%)`,
                }}
              />
            </div>
          </div>

          {/* Time Pill */}
          <div className="control-pill time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* RIGHT GROUP */}
        <div className="controls-group">
          <div className="control-pill control-pill-standard">
            {/* Auto Play Next Toggle */}
            {onToggleAutoPlayNext && (
              <div className="auto-play-toggle-container">
                <ControlTooltip label="Auto-play Next">
                  <button
                    onClick={onToggleAutoPlayNext}
                    className={`auto-play-toggle-btn ${
                      autoPlayNext ? "active" : ""
                    }`}
                  >
                    <div className="auto-play-toggle-thumb" />
                  </button>
                </ControlTooltip>
              </div>
            )}

            {/* Quality Settings */}
            <div className="relative-container">
              <ControlTooltip label="Settings">
                <button
                  className="settings-btn"
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                >
                  <div className="relative-container">
                    <Settings size={18} />
                    <div className="quality-badge">HD</div>
                  </div>
                </button>
              </ControlTooltip>

              {showQualityMenu && (
                <div className="settings-menu">
                  <div className="settings-divider" />

                  <div className="settings-label">Quality</div>
                  {qualities.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        onSetQuality(q);
                        setShowQualityMenu(false);
                      }}
                      className={`settings-option ${
                        quality === q ? "active" : "inactive"
                      }`}
                    >
                      {getQualityLabel(q)}
                    </button>
                  ))}
                  <div className="settings-divider" />
                  <div className="settings-label">Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowQualityMenu(false);
                      }}
                      className={`settings-option ${
                        playbackRate === rate ? "active" : "inactive"
                      }`}
                    >
                      {rate === 1 ? "Normal" : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="control-pill control-pill-minimal">
            <ControlTooltip label="Theater Mode" shortcut="T">
              <button
                onClick={onToggleTheater}
                className="play-button"
                aria-label="Theater Mode"
              >
                <RectangleHorizontal size={18} />
              </button>
            </ControlTooltip>

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
