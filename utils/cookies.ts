/**
 * Utility functions for cookie management
 */

/**
 * Get a cookie value by name (client-side only)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

/**
 * Get the authentication token from cookie
 */
export function getAuthToken(): string | null {
  return getCookie('shopify-auth-token');
}

/**
 * Set a cookie with secure defaults
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    secure?: boolean;
    sameSite?: string;
    maxAge?: number;
  } = {}
) {
  if (typeof document === 'undefined') return;

  const { path = '/', secure = true, sameSite = 'strict', maxAge } = options;

  let cookieString = `${name}=${value}; path=${path}`;

  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;
  if (maxAge) cookieString += `; max-age=${maxAge}`;

  document.cookie = cookieString;
}

/**
 * Remove a cookie
 */
export function removeCookie(name: string, path: string = '/') {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
}
