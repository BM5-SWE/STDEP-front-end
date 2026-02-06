const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface UserResponse {
  id: string
  email: string
  username: string
}

// Token management
export const tokenManager = {
  setTokens: (tokens: TokenPair) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", tokens.access_token)
      localStorage.setItem("refresh_token", tokens.refresh_token)
    }
  },

  getAccessToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token")
    }
    return null
  },

  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refresh_token")
    }
    return null
  },

  clearTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  },

  hasTokens: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("access_token")
    }
    return false
  },
}

// Login
export async function login(credentials: LoginRequest): Promise<TokenPair> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Login failed")
  }

  const data = await response.json()
  tokenManager.setTokens(data)
  return data
}

// Register
export async function register(data: RegisterRequest): Promise<TokenPair> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Registration failed")
  }

  const result = await response.json()
  tokenManager.setTokens(result)
  return result
}

// Get user info
export async function getUserInfo(
  userId: string,
  accessToken: string
): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
    throw new Error("Failed to fetch user info")
  }

  return response.json()
}
