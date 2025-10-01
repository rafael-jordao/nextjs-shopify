/**
 * API Route for customer profile updates
 * PUT /api/customer/update - Update customer profile data
 */

import { NextRequest } from 'next/server';
import {
  getCustomerToken,
  createUnauthorizedResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/server-cookies';
import { updateCustomer } from '@/lib/shopify/customer';
import { z } from 'zod';

// Validation schema for profile updates
const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório').optional(),
  lastName: z.string().min(1, 'Sobrenome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  acceptsMarketing: z.boolean().optional(),
});

// Convert ShopifyCustomer to User interface
function convertShopifyCustomerToUser(customer: any) {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || undefined,
    acceptsMarketing: customer.acceptsMarketing || false,
    addresses:
      customer.addresses?.edges?.map((edge: any) => ({
        id: edge.node.id,
        address1: edge.node.address1,
        address2: edge.node.address2,
        city: edge.node.city,
        province: edge.node.provinceCode,
        zip: edge.node.zip,
        country: edge.node.countryCodeV2,
        firstName: edge.node.firstName,
        lastName: edge.node.lastName,
        company: edge.node.company,
        phone: edge.node.phone,
      })) || [],
    orders: [],
  };
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('Token de acesso necessário');
    }

    const body = await request.json();

    // Validate input
    const validationResult = UpdateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.issues[0].message, 400);
    }

    const updateData = validationResult.data;

    // Update customer via Shopify API
    const updateResponse = await updateCustomer(token, updateData);

    if (!updateResponse.success) {
      return createErrorResponse(
        updateResponse.message || 'Erro ao atualizar perfil',
        400
      );
    }

    // Convert updated customer to User interface
    const user = convertShopifyCustomerToUser(updateResponse.data);

    return createSuccessResponse({
      user,
      message: 'Perfil atualizado com sucesso',
    });
  } catch (error) {
    console.error('Customer update error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
