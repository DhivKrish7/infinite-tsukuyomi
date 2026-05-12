import { env } from "@/config/env";

type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiClient<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  if (response.status === 401) {
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include"
    });

    if (refreshResponse.ok) {
      response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include"
      });
    }
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
