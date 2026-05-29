const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// AUTH
export const authApi = {
  register: (body: { username: string; password: string; fullname?: string }) =>
    request("/users", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { username: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string }>("/authentications", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: (refreshToken: string) =>
    request("/authentications", {
      method: "DELETE",
      body: JSON.stringify({ refreshToken }),
    }),

  refreshToken: (refreshToken: string) =>
    request<{ accessToken: string }>("/authentications", {
      method: "PUT",
      body: JSON.stringify({ refreshToken }),
    }),
};

// USERS
export const usersApi = {
  getMe: (id: string) => request<User>(`/users/${id}`),
};

// JOURNALS
export const journalsApi = {
  getAll: () =>
    request<{ journals: Journal[] }>("/journals"),

  getById: (id: string) =>
    request<{ journal: Journal }>(`/journals/${id}`),

  create: (body: { title: string; content: string }) =>
    request<{ journalId: string }>("/journals", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: { title: string; content: string }) =>
    request<{ journal: Journal }>(`/journals/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request(`/journals/${id}`, { method: "DELETE" }),

  getWeeklyStress: () =>
    request<{ stressLevels: StressLevel[] }>("/journals/stress-levels"),

  getWeeklyEmotion: () =>
    request<{ emotionSummary: EmotionSummary[] }>("/journals/emotions"),
};

// Types
export interface User {
  id: string;
  username: string;
  name?: string;
}

export interface Journal {
  id: string;
  title: string;
  content: string;
  owner: string;
  stress_score?: number;
  emotion?: string;
  suggestion?: string;
  created_at: string;
  updated_at?: string;
}

export interface StressLevel {
  date: string;
  day: string;
  averageScore: number | null;
}

export interface EmotionSummary {
  emotion: string;
  count: number;
}
