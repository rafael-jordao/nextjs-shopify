/**
 * API Route for customer registration
 * POST /api/auth/register - Register new customer
 */

import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/server-cookies';
import { createCustomer } from '@/lib/shopify/customer';
import { z } from 'zod';

// Validation schema
const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  phone: z.string().optional(),
  acceptsMarketing: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = RegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.issues[0].message, 400);
    }

    const userData = validationResult.data;

    // Create customer using Shopify API
    const registerResponse = await createCustomer({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || '',
      acceptsMarketing: userData.acceptsMarketing,
    });

    if (!registerResponse.success) {
      return createErrorResponse(registerResponse.message, 400);
    }

    return createSuccessResponse({
      message:
        'Conta criada com sucesso! Verifique seu email para ativar a conta.',
      customer: registerResponse.data,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
