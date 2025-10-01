/**
 * API Route for customer login
 * POST /api/auth/login - Login customer and set secure session
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  setCustomerTokenCookie,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/server-cookies';
import { loginCustomer, getCustomer } from '@/lib/shopify/customer';
import { z } from 'zod';
import { convertShopifyCustomerToUser } from '@/utils/helpers';

// Validation schema
const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.issues[0].message, 400);
    }

    const { email, password } = validationResult.data;

    // Attempt login with Shopify
    const loginResponse = await loginCustomer({ email, password });

    if (!loginResponse.success) {
      return createErrorResponse(loginResponse.message, 401);
    }

    // Get customer data using the access token
    const customerResponse = await getCustomer(loginResponse.data.accessToken);

    if (!customerResponse.success || !customerResponse.data) {
      return createErrorResponse(
        customerResponse.message || 'Erro ao carregar dados do usuário',
        500
      );
    }

    // Convert to User interface
    const user = convertShopifyCustomerToUser(customerResponse.data);

    // Create response and set secure cookie
    const response = createSuccessResponse({
      user,
      message: 'Login realizado com sucesso',
    });

    // Set secure HttpOnly cookie with the access token
    setCustomerTokenCookie(response, loginResponse.data.accessToken);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
