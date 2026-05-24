import "../styles/TiledWatermark.css";

export function TiledWatermark({ text }: { text: string }) {
  return (
    <div className="watermark-container">
      <span className="watermark-text-hidden">{text}</span>
    </div>
  );
}
