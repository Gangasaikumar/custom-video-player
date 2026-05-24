/**
 * DevToolsGuard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * App-level component that shows a full-width warning banner when browser
 * DevTools are detected open.
 *
 * This is intentionally separate from <SecureVideoPlayer> so you can mount it
 * once at your app root and have it cover the entire page — not just the player.
 *
 * Detection method: compares window.outerWidth vs window.innerWidth.
 * A docked DevTools panel widens this gap beyond 160px.
 *
 * Usage (place once near the top of your app):
 *
 *   import { DevToolsGuard } from "./SecureVideoPlayer";
 *
 *   function App() {
 *     return (
 *       <>
 *         <DevToolsGuard />
 *         <YourRoutes />
 *       </>
 *     );
 *   }
 */

import { useDevToolsDetect } from "../hooks/useDevToolsDetection";
import "../styles/DevToolsGuard.css";

export function DevToolsGuard() {
  const isOpen = useDevToolsDetect();

  if (!isOpen) return null;

  return (
    <div className="devtools-guard-overlay" role="alert" aria-live="assertive">
      <span className="devtools-guard-icon">⚠️</span>
      DevTools detected. Please close the developer console to continue viewing.
    </div>
  );
}
