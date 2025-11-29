import { ApiResponse, apiRequest } from "./api";

// Types based on API documentation
export interface LoginRequest {
  username: string; // API uses 'username' for email
  password: string;
}

export interface LoginDto {
  newPasswordRequired: boolean;
  accessToken?: string;
  userGroup?: string; // "students" or "tutors"
  authSession?: string;
}

export interface ChangePasswordRequest {
  authSession: string;
  username: string;
  newPassword: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
  newPasswordRequired?: boolean;
  authSession?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface User {
  email: string;
  role: string; // "students" or "tutors"
}

// Authentication API service
class AuthApi {
  async login(loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiRequest<LoginDto>("/auth/log-in", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      // Handle successful login with access token
      if (response.accessToken && response.userGroup) {
        const user: User = {
          email: loginData.username,
          role: response.userGroup,
        };

        return {
          data: {
            token: response.accessToken,
            user,
          },
          success: true,
        };
      }

      // Handle password change required
      if (response.newPasswordRequired && response.authSession) {
        return {
          data: {
            token: "",
            user: {
              email: loginData.username,
              role: "",
            },
            newPasswordRequired: true,
            authSession: response.authSession,
          },
          success: false,
          message: "Password change required",
        };
      }

      return {
        data: null,
        success: false,
        message: "Login failed - invalid credentials",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  async changePassword(
    changePasswordData: ChangePasswordRequest,
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiRequest<LoginDto>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(changePasswordData),
      });

      if (response.accessToken && response.userGroup) {
        const user: User = {
          email: changePasswordData.username,
          role: response.userGroup,
        };

        return {
          data: {
            token: response.accessToken,
            user,
          },
          success: true,
        };
      }

      return {
        data: null,
        success: false,
        message: "Password change failed",
      };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Password change failed",
      };
    }
  }

  async resetPassword(
    resetData: ResetPasswordRequest,
  ): Promise<ApiResponse<ResetPasswordResponse>> {
    try {
      // Note: API documentation doesn't show a reset password endpoint
      // This is a placeholder implementation
      const response = await apiRequest<ResetPasswordResponse>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(resetData),
        },
      );
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
      // Note: API documentation doesn't show a logout endpoint
      // This is a placeholder implementation
      const response = { message: "Logged out successfully" };
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
      // Note: API documentation doesn't show a token verification endpoint
      // This is a placeholder implementation that would need to be replaced
      const response = {
        email: "user@example.com",
        role: "tutors",
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
}

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

// For mock mode, import and use mock API
const mockAuthApi = USE_MOCK_API ? require("./mock/authApi").authApiMock : null;

// Export singleton instance (use mock in mock mode)
export const authApi = USE_MOCK_API ? mockAuthApi : new AuthApi();
