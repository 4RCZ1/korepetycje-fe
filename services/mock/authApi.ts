import { ApiResponse } from "@/services/api";

import { LoginRequest, LoginResponse, User } from "../authApi";

// Mock auth API for testing purposes
export const authApiMock = {
  async login(loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log('[authApiMock.login]', JSON.stringify(loginData, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Accept any credentials in mock mode
    const user: User = {
      email: loginData.username,
      role: "tutors", // Default to tutor role for testing
    };

    const response = {
      data: {
        token: "mock-token-" + Date.now(),
        user,
      },
      success: true,
    };
    console.log('[authApiMock.login] Response:', JSON.stringify(response, null, 2));
    return response;
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: { message: "Logged out successfully" }, success: true };
  },

  async verifyToken(): Promise<ApiResponse<User>> {
    console.log('[authApiMock.verifyToken]', JSON.stringify({}, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 200));
    const response = {
      data: { email: "test@example.com", role: "tutors" },
      success: true,
    };
    console.log('[authApiMock.verifyToken] Response:', JSON.stringify(response, null, 2));
    return response;
  },

  async resetPassword(): Promise<ApiResponse<{ message: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: { message: "Password reset email sent" },
      success: true,
    };
  },

  async changePassword(_changePasswordData: {
    authSession: string;
    username: string;
    newPassword: string;
  }): Promise<ApiResponse<LoginResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        token: "mock-token-" + Date.now(),
        user: { email: _changePasswordData.username, role: "tutors" },
      },
      success: true,
    };
  },
};
