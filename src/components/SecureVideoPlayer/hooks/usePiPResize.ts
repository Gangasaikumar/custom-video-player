import { useState, useEffect, useRef } from "react";

interface PiPResizeProps {
  isPiP: boolean;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function usePiPResize({
  isPiP,
  initialWidth = 320,
  minWidth = 320,
  maxWidth = 800,
}: PiPResizeProps) {
  const [pipWidth, setPipWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, window.innerWidth - e.clientX - 24)
      );
      setPipWidth(newWidth);
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    if (isPiP) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPiP, minWidth, maxWidth]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = "nwse-resize";
  };

  return {
    pipWidth,
    isResizing,
    startResizing,
  };
}
