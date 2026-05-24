/**
 * SettingsMenu.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Quality selector + playback speed dropdown.
 * Extracted from the monolithic PlayerControls component.
 *
 * SOLID:
 *   - Single Responsibility: only renders and manages the settings dropdown
 *   - Open/Closed: quality labels and playback rates come in as props —
 *     add new qualities/speeds without touching this component
 */

import { useState } from "react";
import { Settings } from "lucide-react";
import { ControlTooltip } from "./ControlTooltip";
import { getQualityLabel, DEFAULT_PLAYBACK_RATES } from "../config/playerConfig";

interface SettingsMenuProps {
  quality: string;
  qualities: string[];
  playbackRate: number;
  playbackRates?: number[];
  onSetQuality: (q: string) => void;
  onSetPlaybackRate: (rate: number) => void;
}

export function SettingsMenu({
  quality,
  qualities,
  playbackRate,
  playbackRates = [...DEFAULT_PLAYBACK_RATES],
  onSetQuality,
  onSetPlaybackRate,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative-container">
      <ControlTooltip label="Settings">
        <button
          className="settings-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Settings"
        >
          <div className="relative-container">
            <Settings size={18} />
            <div className="quality-badge">HD</div>
          </div>
        </button>
      </ControlTooltip>

      {open && (
        <div className="settings-menu">
          {/* Quality */}
          {qualities.length > 0 && (
            <>
              <div className="settings-divider" />
              <div className="settings-label">Quality</div>
              {qualities.map((q) => (
                <button
                  key={q}
                  onClick={() => { onSetQuality(q); setOpen(false); }}
                  className={`settings-option ${quality === q ? "active" : "inactive"}`}
                >
                  {getQualityLabel(q)}
                </button>
              ))}
            </>
          )}

          {/* Speed */}
          <div className="settings-divider" />
          <div className="settings-label">Speed</div>
          {playbackRates.map((rate) => (
            <button
              key={rate}
              onClick={() => { onSetPlaybackRate(rate); setOpen(false); }}
              className={`settings-option ${playbackRate === rate ? "active" : "inactive"}`}
            >
              {rate === 1 ? "Normal" : `${rate}×`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
