import { apiFetch } from "@/lib/api";

/**
 * Generic API request helper
 * Used internally by service files
 */
export function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}
