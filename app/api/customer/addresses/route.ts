/**
 * API Route for customer addresses
 * GET /api/customer/addresses - Get customer addresses
 * POST /api/customer/addresses - Create new address
 */

import { NextRequest } from 'next/server';
import {
  getCustomerToken,
  createUnauthorizedResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/server-cookies';
import { getCustomer, createCustomerAddress } from '@/lib/shopify/customer';
import { z } from 'zod';

// Validation schema for address creation
const CreateAddressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address1: z.string().min(1, 'Endereço é obrigatório'),
  address2: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  province: z.string().min(1, 'Estado é obrigatório'),
  country: z.string().min(1, 'País é obrigatório'),
  zip: z.string().min(1, 'CEP é obrigatório'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export async function GET() {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('Token de acesso necessário');
    }

    // Get customer data including addresses
    const customerResponse = await getCustomer(token);

    if (!customerResponse.success || !customerResponse.data) {
      return createErrorResponse(
        customerResponse.message || 'Erro ao carregar endereços',
        400
      );
    }

    // Extract and format addresses
    const addresses =
      customerResponse.data.addresses?.edges?.map((edge: any) => ({
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
      })) || [];

    return createSuccessResponse({
      addresses,
      message: 'Endereços carregados com sucesso',
    });
  } catch (error) {
    console.error('Customer addresses error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('Token de acesso necessário');
    }

    const body = await request.json();

    // Validate input
    const validationResult = CreateAddressSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.issues[0].message, 400);
    }

    const addressData = validationResult.data;

    // Create address via Shopify API
    const createResponse = await createCustomerAddress(token, addressData);

    if (!createResponse.success) {
      return createErrorResponse(
        createResponse.message || 'Erro ao criar endereço',
        400
      );
    }

    return createSuccessResponse({
      address: createResponse.data,
      message: 'Endereço criado com sucesso',
    });
  } catch (error) {
    console.error('Create address error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
