import { useEffect, useState } from "react";

import { setAuthToken } from "@/services/api";
import {
  authApi,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  User,
} from "@/services/authApi";
import { deleteItem, getItem, setItem } from "@/utils/storage";

// Storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UseAuthState extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  changePassword: (
    username: string,
    newPassword: string,
    authSession: string,
  ) => Promise<boolean>;
  clearError: () => void;
  initialize: () => Promise<void>;
  isTutor: () => boolean;
}

// Singleton Auth Manager
class AuthManager {
  private static instance: AuthManager;
  private listeners: Set<(state: AuthState) => void> = new Set();
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  };
  private initialized = false;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): AuthState {
    return this.state;
  }

  isTutor(): boolean {
    return this.state.user?.role === "tutors";
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.setState({ loading: true });
      const [storedToken, storedUser] = await Promise.all([
        getItem(TOKEN_KEY),
        getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // Set the token in API client first
        setAuthToken(storedToken);

        // Verify token is still valid
        const verifyResponse = await authApi.verifyToken();
        if (verifyResponse.success) {
          this.setState({
            token: storedToken,
            user: parsedUser,
            isAuthenticated: true,
            error: null,
          });
        } else {
          await this.clearStoredAuth();
        }
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      await this.clearStoredAuth();
    } finally {
      this.setState({ loading: false });
      this.initialized = true;
    }
  }

  private async storeAuth(token: string, user: User) {
    try {
      await Promise.all([
        setItem(TOKEN_KEY, token),
        setItem(USER_KEY, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error("Error storing auth:", error);
    }
  }

  private async clearStoredAuth() {
    try {
      await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
      setAuthToken(null);
      this.setState({
        token: null,
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      console.error("Error clearing stored auth:", error);
    }
  }
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      this.setState({ loading: true, error: null });

      const loginData: LoginRequest = { username: email, password }; // Use 'username' as per API docs
      const response = await authApi.login(loginData);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Set the token in API client
        setAuthToken(token);

        this.setState({
          token,
          user,
          isAuthenticated: true,
          error: null,
        });

        await this.storeAuth(token, user!);
        return response.data;
      } else {
        this.setState({ error: response.message || "Login failed" });
        return response.data!;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      this.setState({ error: errorMessage });
      console.error("Login error:", error);
      return {
        authSession: undefined,
        newPasswordRequired: undefined,
        token: "",
        user: undefined,
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  async logout(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });

      // Call logout API to invalidate token on server
      await authApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state and storage
      await this.clearStoredAuth();
      this.setState({ loading: false });
    }
  }
  async resetPassword(email: string): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      const resetData: ResetPasswordRequest = { email };
      const response = await authApi.resetPassword(resetData);

      if (response.success) {
        return true;
      } else {
        this.setState({ error: response.message || "Password reset failed" });
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password reset failed";
      this.setState({ error: errorMessage });
      console.error("Reset password error:", error);
      return false;
    } finally {
      this.setState({ loading: false });
    }
  }

  async changePassword(
    username: string,
    newPassword: string,
    authSession: string,
  ): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      const changePasswordData: ChangePasswordRequest = {
        username,
        newPassword,
        authSession,
      };
      const response = await authApi.changePassword(changePasswordData);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Set the token in API client
        setAuthToken(token);

        this.setState({
          token,
          user,
          isAuthenticated: true,
          error: null,
        });

        await this.storeAuth(token, user!);
        return true;
      } else {
        this.setState({ error: response.message || "Password change failed" });
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password change failed";
      this.setState({ error: errorMessage });
      console.error("Change password error:", error);
      return false;
    } finally {
      this.setState({ loading: false });
    }
  }

  clearError() {
    this.setState({ error: null });
  }
}

// Get the singleton instance
const authManager = AuthManager.getInstance();

// React hook interface
export function useAuth(): UseAuthState {
  const [state, setState] = useState<AuthState>(() => authManager.getState());

  useEffect(() => {
    // Set initial state in case it changed before component mounted
    setState(authManager.getState());

    // Subscribe to state changes
    const unsubscribe = authManager.subscribe(setState);

    // Initialize auth manager on first use if not already initialized
    if (!authManager.isInitialized()) {
      authManager.initialize().catch(console.error);
    }

    return unsubscribe;
  }, []);
  return {
    ...state,
    login: authManager.login.bind(authManager),
    logout: authManager.logout.bind(authManager),
    resetPassword: authManager.resetPassword.bind(authManager),
    changePassword: authManager.changePassword.bind(authManager),
    clearError: authManager.clearError.bind(authManager),
    initialize: authManager.initialize.bind(authManager),
    isTutor: authManager.isTutor.bind(authManager),
  };
}

// Export singleton instance for direct access if needed
export { authManager };
