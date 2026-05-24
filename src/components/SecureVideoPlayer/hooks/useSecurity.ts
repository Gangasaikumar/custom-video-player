/**
 * useSecurity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Consolidated security side-effects hook.
 *
 * Responsibilities (single mount — no duplication):
 *   1. Block right-click context menu
 *   2. Block DevTools keyboard shortcuts:
 *      - F12
 *      - Ctrl+Shift+I / J / C  (Inspect, Console, Element Picker)
 *      - Ctrl+U                (View Source)
 *      - Ctrl+S                (Save Page)
 *      - Ctrl+P                (Print — can expose source)
 *
 * All listeners are properly cleaned up on unmount — no memory leaks.
 *
 * Usage:
 *   useSecurity()  // call once at app root or inside SecureVideoPlayer
 */

import { useEffect } from "react";

export function useSecurity() {
  useEffect(() => {
    // ── 1. Block right-click ───────────────────────────────────────────────
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // ── 2. Block DevTools keyboard shortcuts ──────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I / J / C  (Inspect, Console, Element Picker)
      if (
        e.ctrlKey &&
        e.shiftKey &&
        ["i", "I", "j", "J", "c", "C"].includes(e.key)
      ) {
        e.preventDefault();
        return;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        return;
      }

      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return;
      }

      // Ctrl+P (Print)
      if (e.ctrlKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown, true); // capture phase

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);
}
