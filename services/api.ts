// Configuration
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_BACKEND_BASE_URL + "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Types for API responses
export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Custom error class for API errors
export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

// Generic API request function with comprehensive error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  queryParams?: Record<string, string>,
): Promise<T> {
  console.log(`Making API request to: ${endpoint}`, options, queryParams);
  let url = `${API_CONFIG.baseURL}${endpoint}`;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }
    url = `${url}?${searchParams.toString()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiClientError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData.code,
      );
    }

    const data = await response.json();

    // Validate API response structure
    if (data.success === false) {
      throw new ApiClientError(
        data.message || "API returned error",
        response.status,
        data.code,
      );
    }

    return data;
  } catch (_error) {
    clearTimeout(timeoutId);

    if (_error instanceof ApiClientError) {
      throw _error;
    }
    const error = _error as Error;

    if (error.name === "AbortError") {
      throw new ApiClientError("Request timeout", 408, "TIMEOUT");
    }

    if (error.name === "TypeError" && error.message.includes("network")) {
      throw new ApiClientError(
        "Network error - check your connection",
        0,
        "NETWORK_ERROR",
      );
    }

    throw new ApiClientError(
      error.message || "Unknown error occurred",
      0,
      "UNKNOWN_ERROR",
    );
  }
}
