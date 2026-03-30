const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

function forceLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });

  // If 401 and we have a refresh token, try to refresh once
  if (res.status === 401 && typeof window !== "undefined" && localStorage.getItem("refresh_token")) {
    // Avoid multiple parallel refresh attempts
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await (refreshPromise ?? Promise.resolve(false));
    if (refreshed) {
      // Retry the original request with the new token
      return fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          ...authHeaders(),
          ...options.headers,
        },
      });
    }

    // Refresh failed — force logout
    forceLogout();
  }

  return res;
}
