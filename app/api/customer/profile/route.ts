/**
 * API Route for customer profile management
 * GET /api/customer/profile - Get customer profile data
 */

import { NextRequest } from 'next/server';
import {
  getCustomerToken,
  createUnauthorizedResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/server-cookies';
import { getCustomerProfile } from '@/lib/shopify/customer';

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

export async function GET() {
  try {
    const token = await getCustomerToken();

    if (!token) {
      return createUnauthorizedResponse('Token de acesso necessário');
    }

    // Get customer data from Shopify
    const customerResponse = await getCustomerProfile(token);

    if (!customerResponse.success || !customerResponse.data) {
      return createErrorResponse(
        customerResponse.message || 'Erro ao carregar perfil do cliente',
        400
      );
    }

    // Convert to User interface
    const user = convertShopifyCustomerToUser(customerResponse.data);

    return createSuccessResponse(user);
  } catch (error) {
    console.error('Customer profile error:', error);
    return createErrorResponse('Erro interno do servidor', 500);
  }
}
