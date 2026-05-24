/**
 * authService.test.ts
 * Tests for AuthService — login, logout, isAuthenticated, getUser.
 *
 * Uses fake timers so AuthService.login's internal setTimeout resolves
 * synchronously — no leaked handles between tests.
 */
import { AuthService } from "../utils/authService";

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

// Helper: start a login and advance fake timers so the promise resolves
async function loginAs(email: string, password: string) {
  const p = AuthService.login(email, password);
  jest.runAllTimers();
  return p;
}

// ── login ─────────────────────────────────────────────────────────────────────

describe("AuthService.login", () => {
  it("resolves with user object on valid credentials", async () => {
    const user = await loginAs("test@example.com", "password123");
    expect(user).toMatchObject({
      email: "test@example.com",
      name: expect.any(String),
      id: expect.any(String),
    });
  });

  it("stores token and user in localStorage on success", async () => {
    await loginAs("test@example.com", "password123");
    expect(localStorage.getItem("auth_token")).not.toBeNull();
    expect(localStorage.getItem("auth_user")).not.toBeNull();
  });

  it("rejects on wrong password", async () => {
    await expect(loginAs("test@example.com", "wrongpass")).rejects.toThrow();
  });

  it("rejects on unknown email", async () => {
    await expect(loginAs("unknown@example.com", "password123")).rejects.toThrow();
  });

  it("rejects on empty credentials", async () => {
    await expect(loginAs("", "")).rejects.toThrow();
  });
});

// ── isAuthenticated ───────────────────────────────────────────────────────────

describe("AuthService.isAuthenticated", () => {
  it("returns false when no token is stored", () => {
    expect(AuthService.isAuthenticated()).toBe(false);
  });

  it("returns true after successful login", async () => {
    await loginAs("test@example.com", "password123");
    expect(AuthService.isAuthenticated()).toBe(true);
  });
});

// ── getUser ───────────────────────────────────────────────────────────────────

describe("AuthService.getUser", () => {
  it("returns null when not logged in", () => {
    expect(AuthService.getUser()).toBeNull();
  });

  it("returns the logged-in user after login", async () => {
    await loginAs("test@example.com", "password123");
    const user = AuthService.getUser();
    expect(user).not.toBeNull();
    expect(user?.email).toBe("test@example.com");
  });
});

// ── logout ────────────────────────────────────────────────────────────────────

describe("AuthService.logout", () => {
  it("clears authentication state", async () => {
    await loginAs("test@example.com", "password123");
    expect(AuthService.isAuthenticated()).toBe(true);

    AuthService.logout();

    expect(AuthService.isAuthenticated()).toBe(false);
    expect(AuthService.getUser()).toBeNull();
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
  });

  it("calling logout when not logged in does not throw", () => {
    expect(() => AuthService.logout()).not.toThrow();
  });
});
