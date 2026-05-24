/**
 * PlayerErrorBoundary.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React class Error Boundary wrapping the player.
 *
 * Catches errors thrown by:
 *   - YouTube IFrame API init failures
 *   - HTML5 <video> hook errors
 *   - Any child component crash
 *
 * Shows a clean fallback UI instead of a blank screen.
 * Consumers can supply a custom fallback via the `fallback` prop.
 *
 * Usage (automatic — SecureVideoPlayer wraps itself):
 *   <SecureVideoPlayer src="..." userEmail="..." />
 *
 * Usage (manual with custom fallback):
 *   <PlayerErrorBoundary fallback={<p>Video unavailable</p>}>
 *     <SecureVideoPlayer src="..." userEmail="..." />
 *   </PlayerErrorBoundary>
 */

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Custom fallback UI. If omitted, a built-in styled card is shown. */
  fallback?: ReactNode;
  /** Called when an error is caught — useful for logging to Sentry etc. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PlayerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SecureVideoPlayer] Caught error:", error, info);
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <span style={styles.icon}>⚠️</span>
          <h3 style={styles.title}>Video unavailable</h3>
          <p style={styles.message}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button style={styles.button} onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}

// ── Inline styles (no external CSS dependency — works anywhere) ───────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    aspectRatio: "16 / 9",
    background: "#0f0f0f",
    borderRadius: "8px",
    overflow: "hidden",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "32px 40px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    maxWidth: "360px",
    textAlign: "center",
  },
  icon: {
    fontSize: "36px",
    lineHeight: 1,
  },
  title: {
    margin: 0,
    color: "#fff",
    fontSize: "18px",
    fontWeight: 600,
  },
  message: {
    margin: 0,
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  button: {
    marginTop: "4px",
    padding: "8px 24px",
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.03em",
  },
};
