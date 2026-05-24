export interface User {
  id: string;
  email: string;
  name: string;
}

const STORAGE_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    // Mock login logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "test@example.com" && password === "password123") {
          const user: User = {
            id: "1",
            email: "test@example.com",
            name: "Test User",
          };
          localStorage.setItem(STORAGE_KEY, "mock-jwt-token");
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 500);
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
  },

  getUser: (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
};
