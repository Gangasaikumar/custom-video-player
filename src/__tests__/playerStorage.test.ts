/**
 * playerStorage.test.ts
 * Tests for all four IPlayerStorage adapters.
 */
import {
  LocalStorageAdapter,
  MemoryStorageAdapter,
  NoopStorageAdapter,
  WebStorageAdapter,
} from "../components/SecureVideoPlayer/utils/playerStorage";

// ── MemoryStorageAdapter ──────────────────────────────────────────────────────

describe("MemoryStorageAdapter", () => {
  let store: MemoryStorageAdapter;

  beforeEach(() => { store = new MemoryStorageAdapter(); });

  it("returns null for unknown keys", () => {
    expect(store.get("missing")).toBeNull();
  });

  it("stores and retrieves a value", () => {
    store.set("key", "hello");
    expect(store.get("key")).toBe("hello");
  });

  it("overwrites an existing value", () => {
    store.set("k", "v1");
    store.set("k", "v2");
    expect(store.get("k")).toBe("v2");
  });

  it("removes a key", () => {
    store.set("k", "v");
    store.remove("k");
    expect(store.get("k")).toBeNull();
  });

  it("remove on missing key does not throw", () => {
    expect(() => store.remove("nonexistent")).not.toThrow();
  });

  it("each instance has its own isolated store", () => {
    const a = new MemoryStorageAdapter();
    const b = new MemoryStorageAdapter();
    a.set("x", "1");
    expect(b.get("x")).toBeNull();
  });
});

// ── NoopStorageAdapter ────────────────────────────────────────────────────────

describe("NoopStorageAdapter", () => {
  const store = new NoopStorageAdapter();

  it("always returns null for get", () => {
    store.set("anything", "value");
    expect(store.get("anything")).toBeNull();
  });

  it("set and remove do not throw", () => {
    expect(() => store.set("k", "v")).not.toThrow();
    expect(() => store.remove("k")).not.toThrow();
  });
});

// ── WebStorageAdapter (sessionStorage) ───────────────────────────────────────

describe("WebStorageAdapter (sessionStorage)", () => {
  let store: WebStorageAdapter;

  beforeEach(() => {
    sessionStorage.clear();
    store = new WebStorageAdapter(sessionStorage);
  });

  it("returns null for missing key", () => {
    expect(store.get("missing")).toBeNull();
  });

  it("stores and retrieves a value", () => {
    store.set("key", "world");
    expect(store.get("key")).toBe("world");
  });

  it("removes a key", () => {
    store.set("k", "v");
    store.remove("k");
    expect(store.get("k")).toBeNull();
  });

  it("persists in the underlying sessionStorage", () => {
    store.set("k", "v");
    expect(sessionStorage.getItem("k")).toBe("v");
  });
});

// ── LocalStorageAdapter ───────────────────────────────────────────────────────

describe("LocalStorageAdapter", () => {
  let store: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    store = new LocalStorageAdapter();
  });

  it("returns null for missing key", () => {
    expect(store.get("missing")).toBeNull();
  });

  it("stores and retrieves a value", () => {
    store.set("vol", "80");
    expect(store.get("vol")).toBe("80");
  });

  it("removes a key", () => {
    store.set("k", "v");
    store.remove("k");
    expect(store.get("k")).toBeNull();
  });

  it("persists in the underlying localStorage", () => {
    store.set("k", "v");
    expect(localStorage.getItem("k")).toBe("v");
  });
});
