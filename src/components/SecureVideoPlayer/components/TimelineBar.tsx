/**
 * TimelineBar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Seekable progress timeline with buffered track and hover timestamp tooltip.
 * Extracted from the monolithic PlayerControls component.
 *
 * SOLID — Single Responsibility: only renders and handles timeline interaction.
 */

import { useState, useRef } from "react";

interface TimelineBarProps {
  currentTime: number;
  duration: number;
  buffered: number;        // 0–1 fraction
  onSeek: (time: number) => void;
}

function formatTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TimelineBar({
  currentTime,
  duration,
  buffered,
  onSeek,
}: TimelineBarProps) {
  const [isDragging, setIsDragging]   = useState(false);
  const [dragValue, setDragValue]     = useState(0);
  const [hoverTime, setHoverTime]     = useState<number | null>(null);
  const [hoverPos, setHoverPos]       = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const displayTime   = isDragging ? dragValue : currentTime;
  const seekProgress  = duration > 0 ? (displayTime / duration) * 100 : 0;
  const bufferedPct   = buffered * 100;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const pct  = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(pct * duration);
    setHoverPos(x);
  };

  return (
    <div
      ref={trackRef}
      className="timeline-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setHoverTime(null); setHoverPos(null); }}
    >
      {/* Hover tooltip */}
      {hoverTime !== null && hoverPos !== null && (
        <div className="timeline-tooltip" style={{ left: hoverPos }}>
          {formatTime(hoverTime)}
        </div>
      )}

      <div className="timeline-track-base" />
      <div className="timeline-buffered"  style={{ width: `${bufferedPct}%` }} />
      <div className="timeline-progress"  style={{ width: `${seekProgress}%` }} />
      <div className="timeline-playhead"  style={{ left:  `${seekProgress}%` }} />

      <input
        type="range"
        min={0}
        max={duration || 100}
        step={0.1}
        value={displayTime}
        onChange={(e) => {
          const v = Number(e.target.value);
          setDragValue(v);
          onSeek(v);
        }}
        onMouseDown={() => { setDragValue(currentTime); setIsDragging(true); }}
        onMouseUp={() => setIsDragging(false)}
        className="timeline-input"
      />
    </div>
  );
}
