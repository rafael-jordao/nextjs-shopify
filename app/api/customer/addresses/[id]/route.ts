/**
 * API Route for specific customer address operations
 * PUT /api/customer/addresses/[id] - Update address
 * DELETE /api/customer/addresses/[id] - Delete address
 */

import { NextRequest } from 'next/server';
import {
  getCustomerToken,
  createUnauthorizedResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/server-cookies';
import {
  updateCustomerAddress,
  deleteCustomerAddress,
} from '@/lib/shopify/customer';
import { z } from 'zod';

// Validation schema for address updates
const UpdateAddressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('Token de acesso necessário');
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = UpdateAddressSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.issues[0].message, 400);
    }

    const addressData = validationResult.data;

    // Update address via Shopify API
    const updateResponse = await updateCustomerAddress(token, id, addressData);

    if (!updateResponse.success) {
      return createErrorResponse(
        updateResponse.message || 'Erro ao atualizar endereço',
        400
      );
    }

    return createSuccessResponse({
      address: updateResponse.data,
      message: 'Endereço atualizado com sucesso',
    });
  } catch (error) {
    console.error('Update address error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('Token de acesso necessário');
    }

    const { id } = await params;

    // Delete address via Shopify API
    const deleteResponse = await deleteCustomerAddress(token, id);

    if (!deleteResponse.success) {
      return createErrorResponse(
        deleteResponse.message || 'Erro ao excluir endereço',
        400
      );
    }

    return createSuccessResponse({
      deletedId: deleteResponse.data,
      message: 'Endereço excluído com sucesso',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
