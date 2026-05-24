import "../styles/MovingWatermark.css";
import { useWatermarkPosition } from "../hooks/useWatermarkPosition";

export function MovingWatermark({ text }: { text: string }) {
  const pos = useWatermarkPosition();

  return (
    <div className="moving-watermark" style={pos}>
      {text}
    </div>
  );
}
