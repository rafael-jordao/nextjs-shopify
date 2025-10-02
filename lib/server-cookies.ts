/**
 * Server-side cookie utilities for secure session management
 * These functions work with Next.js server components and API routes
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const CUSTOMER_SESSION_COOKIE = 'customer_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionCookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
}

/**
 * Get customer access token from secure HttpOnly cookie
 */
export async function getCustomerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(CUSTOMER_SESSION_COOKIE);
    return tokenCookie?.value || null;
  } catch (error) {
    console.error('Error getting customer token:', error);
    return null;
  }
}

/**
 * Set customer access token in secure HttpOnly cookie
 */
export function setCustomerTokenCookie(
  response: NextResponse,
  token: string,
  options: SessionCookieOptions = {}
): NextResponse {
  const {
    maxAge = COOKIE_MAX_AGE,
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
    path = '/',
  } = options;

  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    maxAge,
    httpOnly,
    secure,
    sameSite,
    path,
  });

  return response;
}

/**
 * Clear customer session cookie
 */
export function clearCustomerTokenCookie(response: NextResponse): NextResponse {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}

/**
 * Validate if customer token exists and is not empty
 */
export async function hasValidCustomerToken(): Promise<boolean> {
  const token = await getCustomerToken();
  return Boolean(token && token.trim().length > 0);
}

/**
 * Create a standardized unauthorized response
 */
export function createUnauthorizedResponse(
  message = 'Unauthorized'
): NextResponse {
  return NextResponse.json(
    { error: message, authenticated: false },
    { status: 401 }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status = 400
): NextResponse {
  return NextResponse.json({ error: message, success: false }, { status });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}
