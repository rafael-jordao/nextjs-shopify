import { shopifyFetch } from './client';
import {
  GET_CUSTOMER,
  GET_ORDER,
  CUSTOMER_CREATE,
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_UPDATE,
} from './queries/customer';
import { ShopifyResponse } from '../../types/shopify';

// Customer interfaces
interface CustomerCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  acceptsMarketing?: boolean;
}

interface CustomerLoginInput {
  email: string;
  password: string;
}

interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

// Create new customer account
export async function createCustomer(
  input: CustomerCreateInput
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerCreate: {
        customer: any;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_CREATE, { input });

    if (data.customerCreate.customerUserErrors.length > 0) {
      console.log(data.customerCreate.customerUserErrors[0].message);
      return {
        success: false,
        message: data.customerCreate.customerUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Conta criada com sucesso',
      data: data.customerCreate.customer,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao criar conta. Tente novamente.',
    };
  }
}

// Login customer and get access token
export async function loginCustomer(
  input: CustomerLoginInput
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_ACCESS_TOKEN_CREATE, { input });

    if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerAccessTokenCreate.customerUserErrors[0].message,
      };
    }

    if (!data.customerAccessTokenCreate.customerAccessToken) {
      return {
        success: false,
        message: 'Email ou senha inválidos',
      };
    }

    return {
      success: true,
      message: 'Login realizado com sucesso',
      data: data.customerAccessTokenCreate.customerAccessToken,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao fazer login. Tente novamente.',
    };
  }
}

// Logout customer (delete access token)
export async function logoutCustomer(
  customerAccessToken: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerAccessTokenDelete: {
        deletedAccessToken: string;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_ACCESS_TOKEN_DELETE, { customerAccessToken });

    if (data.customerAccessTokenDelete.userErrors.length > 0) {
      return {
        success: false,
        message: data.customerAccessTokenDelete.userErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Logout realizado com sucesso',
      data: data.customerAccessTokenDelete.deletedAccessToken,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao fazer logout',
    };
  }
}

// Get customer data including orders
export async function getCustomer(
  customerAccessToken: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customer: any;
    }>(GET_CUSTOMER, { customerAccessToken });

    return {
      success: true,
      message: 'Dados do cliente carregados com sucesso',
      data: data.customer,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao carregar dados do cliente',
    };
  }
}

// Update customer information
export async function updateCustomer(
  customerAccessToken: string,
  customer: CustomerUpdateInput
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerUpdate: {
        customer: any;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_UPDATE, { customerAccessToken, customer });

    if (data.customerUpdate.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerUpdate.customerUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Dados atualizados com sucesso',
      data: data.customerUpdate.customer,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao atualizar dados. Tente novamente.',
    };
  }
}

// Get specific order details
export async function getOrder(id: string): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      order: any;
    }>(GET_ORDER, { id });

    return {
      success: true,
      message: 'Pedido carregado com sucesso',
      data: data.order,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao carregar pedido',
    };
  }
}
