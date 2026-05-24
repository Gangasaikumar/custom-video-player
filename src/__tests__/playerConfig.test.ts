/**
 * playerConfig.test.ts
 * Tests for pure config utilities — no DOM, no React, no mocks needed.
 */
import {
  getQualityLabel,
  resolveConfig,
  resolveShortcuts,
  PLAYER_DEFAULTS,
  PLAYER_TIMING,
  DEFAULT_PLAYBACK_RATES,
  DEFAULT_KEYBOARD_SHORTCUTS,
  PLAYER_STORAGE_KEYS,
} from "../components/SecureVideoPlayer/config/playerConfig";

// ── getQualityLabel ───────────────────────────────────────────────────────────

describe("getQualityLabel", () => {
  it("returns human label for known YouTube quality key", () => {
    expect(getQualityLabel("hd1080")).toBe("1080p");
    expect(getQualityLabel("hd720")).toBe("720p");
    expect(getQualityLabel("auto")).toBe("Auto");
    expect(getQualityLabel("tiny")).toBe("144p");
  });

  it("falls back to the raw key for unknown quality strings", () => {
    expect(getQualityLabel("superhd")).toBe("superhd");
    expect(getQualityLabel("")).toBe("");
  });
});

// ── PLAYER_STORAGE_KEYS ───────────────────────────────────────────────────────

describe("PLAYER_STORAGE_KEYS", () => {
  it("generates position key with media id", () => {
    expect(PLAYER_STORAGE_KEYS.POSITION("abc123")).toBe("player-pos-abc123");
    expect(PLAYER_STORAGE_KEYS.POSITION("")).toBe("player-pos-");
  });

  it("has stable volume/muted/speed keys", () => {
    expect(PLAYER_STORAGE_KEYS.VOLUME).toBe("player-volume");
    expect(PLAYER_STORAGE_KEYS.MUTED).toBe("player-muted");
    expect(PLAYER_STORAGE_KEYS.SPEED).toBe("player-speed");
  });
});

// ── resolveShortcuts ──────────────────────────────────────────────────────────

describe("resolveShortcuts", () => {
  it("returns defaults when called with no arguments", () => {
    const shortcuts = resolveShortcuts();
    expect(shortcuts).toEqual(DEFAULT_KEYBOARD_SHORTCUTS);
  });

  it("returns defaults when called with undefined", () => {
    expect(resolveShortcuts(undefined)).toEqual(DEFAULT_KEYBOARD_SHORTCUTS);
  });

  it("merges overrides — only the specified key is replaced", () => {
    const result = resolveShortcuts({ pip: ["KeyI"] });
    expect(result.pip).toEqual(["KeyI"]);
    // all other keys remain unchanged
    expect(result.playPause).toEqual(DEFAULT_KEYBOARD_SHORTCUTS.playPause);
    expect(result.fullscreen).toEqual(DEFAULT_KEYBOARD_SHORTCUTS.fullscreen);
  });

  it("supports disabling a shortcut by passing empty array", () => {
    const result = resolveShortcuts({ pip: [] });
    expect(result.pip).toEqual([]);
    expect(result.mute).toEqual(DEFAULT_KEYBOARD_SHORTCUTS.mute);
  });

  it("supports overriding multiple keys at once", () => {
    const result = resolveShortcuts({ theater: ["KeyY"], mute: ["KeyN"] });
    expect(result.theater).toEqual(["KeyY"]);
    expect(result.mute).toEqual(["KeyN"]);
    expect(result.seekForward).toEqual(DEFAULT_KEYBOARD_SHORTCUTS.seekForward);
  });
});

// ── resolveConfig ─────────────────────────────────────────────────────────────

describe("resolveConfig", () => {
  it("returns all defaults when called with no arguments", () => {
    const cfg = resolveConfig();
    expect(cfg.seekStepS).toBe(PLAYER_DEFAULTS.SEEK_STEP_S);
    expect(cfg.volumeStep).toBe(PLAYER_DEFAULTS.VOLUME_STEP);
    expect(cfg.controlsHideMs).toBe(PLAYER_TIMING.CONTROLS_HIDE_MS);
    expect(cfg.positionSaveMs).toBe(PLAYER_TIMING.POSITION_SAVE_MS);
    expect(cfg.persistSettings).toBe(true);
    expect(cfg.playbackRates).toEqual([...DEFAULT_PLAYBACK_RATES]);
  });

  it("overrides only specified fields — rest remain default", () => {
    const cfg = resolveConfig({ seekStepS: 10 });
    expect(cfg.seekStepS).toBe(10);
    expect(cfg.volumeStep).toBe(PLAYER_DEFAULTS.VOLUME_STEP);
    expect(cfg.controlsHideMs).toBe(PLAYER_TIMING.CONTROLS_HIDE_MS);
  });

  it("supports overriding playbackRates", () => {
    const cfg = resolveConfig({ playbackRates: [1, 1.5, 2] });
    expect(cfg.playbackRates).toEqual([1, 1.5, 2]);
  });

  it("overrides keyboardShortcuts via resolveShortcuts internally", () => {
    const cfg = resolveConfig({ keyboardShortcuts: { pip: [] } });
    expect(cfg.keyboardShortcuts.pip).toEqual([]);
    expect(cfg.keyboardShortcuts.playPause).toEqual(
      DEFAULT_KEYBOARD_SHORTCUTS.playPause,
    );
  });

  it("overrides persistSettings to false", () => {
    const cfg = resolveConfig({ persistSettings: false });
    expect(cfg.persistSettings).toBe(false);
  });

  it("does not mutate DEFAULT_PLAYBACK_RATES when returning playbackRates", () => {
    const cfg = resolveConfig();
    cfg.playbackRates.push(4); // mutate the returned array
    expect(DEFAULT_PLAYBACK_RATES).not.toContain(4);
  });
});
