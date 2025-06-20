import { ApiResponse, apiRequest } from "./api";

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Authentication API service
class AuthApi {
  async login(loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      // const response = await apiRequest<LoginResponse>("/auth/login", {
      //   method: "POST",
      //   body: JSON.stringify(loginData),
      // }); TODO use real API
      const response = {
        token: "mocked_token",
        user: {
          id: "2",
          email: loginData.email,
          name: "Mocked User",
          role: "user",
        },
        expiresIn: 3600,
      };
      console.log("Mocked login response:", response);
      return { data: response, success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  async resetPassword(
    _resetData: ResetPasswordRequest,
  ): Promise<ApiResponse<ResetPasswordResponse>> {
    try {
      // const response = await apiRequest<ResetPasswordResponse>(
      //   "/auth/reset-password",
      //   {
      //     method: "POST",
      //     body: JSON.stringify(resetData),
      //   },
      // ); // TODO use real API
      const response = { message: "Password reset link sent to email" };
      return { data: response, success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Password reset failed",
      };
    }
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      // const response = await apiRequest<{ message: string }>("/auth/logout", {
      //   method: "POST",
      // });
      const response = { message: "Logged out successfully" }; // TODO use real API
      return { data: response, success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : "Logout failed",
      };
    }
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    try {
      // const response = await apiRequest<User>("/auth/verify");
      const response = {
        id: "2",
        email: "mail@mail.com",
        name: "Mocked User",
        role: "student",
      };
      return { data: response, success: true };
    } catch (error) {
      console.error("Token verification error:", error);
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Token verification failed",
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiRequest<LoginResponse>("/auth/refresh", {
        method: "POST",
      });
      return { data: response, success: true };
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Token refresh failed",
      };
    }
  }
}

// Export singleton instance
export const authApi = new AuthApi();
