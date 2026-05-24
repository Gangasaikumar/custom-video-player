import { useEffect } from "react";
import { useDevToolsDetect } from "./SecureVideoPlayer/hooks/useDevToolsDetection";
import "../styles/DevToolsGuard.css";

export function DevToolsGuard() {
  const isOpen = useDevToolsDetect();

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts (Inspect, Console, View Source)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element selector)
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === "I" ||
          e.key === "J" ||
          e.key === "C" ||
          e.key === "i" ||
          e.key === "j" ||
          e.key === "c")
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="devtools-guard-overlay">
      ⚠️ DevTools detected. Please closet he console to continue viewing.
    </div>
  );
}
