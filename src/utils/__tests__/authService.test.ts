import { AuthService } from "../authService";

describe("AuthService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("login", () => {
    it("successfully logs in with correct credentials", async () => {
      const email = "test@example.com";
      const password = "password123";

      const user = await AuthService.login(email, password);

      expect(user.email).toBe(email);
      expect(localStorage.getItem("auth_token")).toBe("mock-jwt-token");
      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it("fails to login with incorrect credentials", async () => {
      await expect(
        AuthService.login("wrong@email.com", "wrongpass"),
      ).rejects.toThrow("Invalid email or password");

      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears storage and isauthenticated becomes false", async () => {
      // Setup logged in state
      localStorage.setItem("auth_token", "test-token");
      expect(AuthService.isAuthenticated()).toBe(true);

      AuthService.logout();

      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  describe("getUser", () => {
    it("returns user from localStorage if present", () => {
      const user = { id: "1", email: "test@example.com", name: "Test" };
      localStorage.setItem("auth_user", JSON.stringify(user));

      const retrievedUser = AuthService.getUser();
      expect(retrievedUser).toEqual(user);
    });

    it("returns null if no user is in storage", () => {
      expect(AuthService.getUser()).toBeNull();
    });
  });
});
