/**
 * API Route for customer logout
 * POST /api/auth/logout - Logout customer and clear session
 */

import { NextRequest } from 'next/server';
import {
  getCustomerToken,
  clearCustomerTokenCookie,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/server-cookies';
import { logoutCustomer } from '@/lib/shopify/customer';

export async function POST(request: NextRequest) {
  try {
    const token = await getCustomerToken();

    // Create response for successful logout
    const response = createSuccessResponse({
      message: 'Logout realizado com sucesso',
      authenticated: false,
    });

    // Clear the secure cookie
    clearCustomerTokenCookie(response);

    // If there's a valid token, invalidate it with Shopify
    if (token && token !== 'registered-user-token') {
      try {
        const logoutResponse = await logoutCustomer(token);
        if (!logoutResponse.success) {
          console.warn(
            'Shopify logout API call failed:',
            logoutResponse.message
          );
        }
      } catch (error) {
        console.warn('Error calling Shopify logout API:', error);
        // Don't fail the logout process if Shopify API call fails
      }
    }

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, we should clear the cookie
    const response = createErrorResponse('Erro ao fazer logout', 500);
    clearCustomerTokenCookie(response);

    return response;
  }
}
