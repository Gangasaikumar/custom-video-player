/**
 * ControlTooltip.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable tooltip wrapper for player control buttons.
 * Extracted so every sub-component can import it independently.
 *
 * SOLID — Single Responsibility + DRY.
 */

import { useState } from "react";

interface ControlTooltipProps {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
  visible?: boolean;
}

export function ControlTooltip({
  label,
  shortcut,
  children,
  visible = true,
}: ControlTooltipProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="control-tooltip-wrapper"
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
