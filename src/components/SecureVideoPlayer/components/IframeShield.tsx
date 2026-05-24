import "../styles/IframeShield.css";

export function IframeShield() {
  return (
    <div onContextMenu={(e) => e.preventDefault()} className="iframe-shield" />
  );
}
