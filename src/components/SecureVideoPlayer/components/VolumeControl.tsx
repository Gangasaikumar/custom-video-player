/**
 * VolumeControl.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Mute toggle + hover-expand volume slider pill.
 * Extracted from the monolithic PlayerControls component.
 *
 * SOLID — Single Responsibility: only renders volume UI.
 */

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ControlTooltip } from "./ControlTooltip";

interface VolumeControlProps {
  volume: number;          // 0–100
  muted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const [hovered, setHovered] = useState(false);
  const displayVol = muted ? 0 : volume;

  return (
    <div
      className={`control-pill volume-container ${hovered ? "expanded" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ControlTooltip label={muted || volume === 0 ? "Unmute" : "Mute"} shortcut="M">
        <button
          onClick={onToggleMute}
          className="play-button"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </ControlTooltip>

      <div
        className="volume-slider-wrapper"
        style={{ width: hovered ? "60px" : "0px" }}
      >
        <input
          type="range"
          min={0}
          max={100}
          value={displayVol}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="volume-slider"
          style={{
            background: `linear-gradient(to right, #fff ${displayVol}%, rgba(255,255,255,0.3) ${displayVol}%)`,
          }}
        />
      </div>
    </div>
  );
}
