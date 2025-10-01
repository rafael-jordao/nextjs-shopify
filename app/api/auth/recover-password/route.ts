/**
 * API Route for password recovery
 * POST /api/auth/recover-password - Send password recovery email
 */

import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/server-cookies';
import { recoverCustomerPassword } from '@/lib/shopify/customer';
import { z } from 'zod';

// Validation schema
const RecoverPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = RecoverPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.issues[0].message, 400);
    }

    const { email } = validationResult.data;

    // Send recovery email via Shopify API
    const recoverResponse = await recoverCustomerPassword(email);

    if (!recoverResponse.success) {
      return createErrorResponse(
        recoverResponse.message || 'Erro ao enviar email de recuperação',
        400
      );
    }

    return createSuccessResponse({
      message: 'Email de recuperação enviado com sucesso',
    });
  } catch (error) {
    console.error('Password recovery error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
