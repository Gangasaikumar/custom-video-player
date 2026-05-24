import "../styles/PlayerOverlays.css";

interface CountdownOverlayProps {
  countdown: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PlayerCountdownOverlay({
  countdown,
  onCancel,
  onConfirm,
}: CountdownOverlayProps) {
  return (
    <div className="countdown-overlay">
      <div className="countdown-text">Next video starting in</div>
      <div className="countdown-number">{countdown}</div>
      <div className="countdown-actions">
        <button
          onClick={onCancel}
          className="countdown-btn countdown-btn-cancel"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="countdown-btn countdown-btn-confirm"
        >
          Play Now
        </button>
      </div>
    </div>
  );
}
