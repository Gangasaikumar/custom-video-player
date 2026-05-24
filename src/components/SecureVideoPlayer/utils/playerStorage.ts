/**
 * playerStorage.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Storage abstraction for the player — decouples hooks from localStorage.
 *
 * Design patterns: Strategy + Adapter
 * SOLID:
 *   - Dependency Inversion: hooks depend on IPlayerStorage, not localStorage
 *   - Open/Closed: swap localStorage → IndexedDB/sessionStorage/server without
 *     touching any hook
 *   - Interface Segregation: one focused read/write interface
 *
 * Usage:
 *   // Default (localStorage):
 *   const storage = defaultPlayerStorage;
 *
 *   // In tests — pass a MemoryStorageAdapter:
 *   const storage = new MemoryStorageAdapter();
 *
 *   // In a project that needs sessionStorage:
 *   const storage = new WebStorageAdapter(sessionStorage);
 */

// ── Interface ─────────────────────────────────────────────────────────────────

export interface IPlayerStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

// ── localStorage adapter (default) ───────────────────────────────────────────

export class LocalStorageAdapter implements IPlayerStorage {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Quota exceeded or storage unavailable — fail silently */
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

// ── Generic WebStorage adapter (sessionStorage, etc.) ────────────────────────

export class WebStorageAdapter implements IPlayerStorage {
  constructor(private readonly storage: Storage) {}

  get(key: string): string | null {
    try { return this.storage.getItem(key); } catch { return null; }
  }
  set(key: string, value: string): void {
    try { this.storage.setItem(key, value); } catch { /* ignore */ }
  }
  remove(key: string): void {
    try { this.storage.removeItem(key); } catch { /* ignore */ }
  }
}

// ── In-memory adapter (tests / SSR) ──────────────────────────────────────────

export class MemoryStorageAdapter implements IPlayerStorage {
  private readonly store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  set(key: string, value: string): void {
    this.store.set(key, value);
  }
  remove(key: string): void {
    this.store.delete(key);
  }
}

// ── No-op adapter (disables persistence entirely) ────────────────────────────

export class NoopStorageAdapter implements IPlayerStorage {
  get(_key: string): null { return null; }
  set(_key: string, _value: string): void { /* intentionally empty */ }
  remove(_key: string): void { /* intentionally empty */ }
}

// ── Singleton default (used by hooks when no custom storage is injected) ──────

export const defaultPlayerStorage: IPlayerStorage = new LocalStorageAdapter();
