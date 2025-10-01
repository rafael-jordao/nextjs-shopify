/**
 * API Route for session management
 * GET /api/auth/session - Check current session status
 */

import { NextRequest } from 'next/server';
import {
  getCustomerToken,
  createUnauthorizedResponse,
  createSuccessResponse,
} from '@/lib/server-cookies';
import { validateCustomerSession } from '@/lib/shopify/customer';
import { convertShopifyCustomerToUser } from '@/utils/helpers';

export async function GET() {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('No session found');
    }

    // Validate token with Shopify
    const customerResponse = await validateCustomerSession(token);

    if (!customerResponse.success || !customerResponse.data) {
      return createUnauthorizedResponse('Invalid session');
    }

    // Convert to User interface and return
    const user = convertShopifyCustomerToUser(customerResponse.data);

    return createSuccessResponse({ user, authenticated: true });
  } catch (error) {
    console.error('Session check error:', error);
    return createUnauthorizedResponse('Session validation failed');
  }
}
