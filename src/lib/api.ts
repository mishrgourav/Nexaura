/**
 * Shared API client & URL utility for backend requests.
 * Uses import.meta.env.VITE_API_BASE_URL as the base URL.
 */

export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''
).replace(/\/+$/, '');

/**
 * Resolves a backend API endpoint by prefixing it with VITE_API_BASE_URL.
 * If the endpoint is already an absolute URL (http:// or https://), it is returned as-is.
 */
export function apiUrl(endpoint: string): string {
  if (!endpoint) return API_BASE_URL;
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint}` : cleanEndpoint;
}
