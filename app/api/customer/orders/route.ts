/**
 * API Route for customer orders
 * GET /api/customer/orders - Get customer order history
 */

import { NextRequest } from 'next/server';
import {
  getCustomerToken,
  createUnauthorizedResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/server-cookies';
import { getCustomerOrders } from '@/lib/shopify/customer';

export async function GET() {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('Token de acesso necessário');
    }

    // Get customer orders from Shopify
    const ordersResponse = await getCustomerOrders(token);

    if (!ordersResponse.success) {
      return createErrorResponse(
        ordersResponse.message || 'Erro ao carregar pedidos',
        400
      );
    }

    return createSuccessResponse({
      orders: ordersResponse.data || [],
      message: 'Pedidos carregados com sucesso',
    });
  } catch (error) {
    console.error('Customer orders error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
