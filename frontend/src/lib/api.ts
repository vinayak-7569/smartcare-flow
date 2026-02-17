// frontend/src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Build full API URL
 * Example:
 *   apiUrl("/doctors")
 *   -> http://localhost:8000/api/doctors/
 *
 * ✅ Fix: Always add trailing slash to avoid 307 redirects
 */
export const apiUrl = (path: string): string => {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is missing. Set it in frontend/.env.local and restart Vite."
    );
  }

  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // ✅ Always force trailing slash (except if it already has one)
  if (!normalizedPath.endsWith("/")) {
    normalizedPath = `${normalizedPath}/`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Standard API fetch wrapper
 * - Always JSON
 * - Throws on non-2xx
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is missing. Set it in frontend/.env.local and restart Vite."
    );
  }

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error ${response.status}: ${errorText || response.statusText}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
