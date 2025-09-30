import { shopifyFetch } from './client';
import {
  GET_CUSTOMER,
  GET_ORDER,
  CUSTOMER_CREATE,
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_UPDATE,
  CUSTOMER_RECOVER,
  CUSTOMER_ACTIVATE_BY_URL,
  CUSTOMER_RESET_BY_URL,
  CUSTOMER_ADDRESS_CREATE,
  CUSTOMER_ADDRESS_UPDATE,
  CUSTOMER_ADDRESS_DELETE,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE,
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

interface CustomerAddressInput {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  company?: string;
}

// Create new customer account (without password - requires activation)
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
      message: 'Account created successfully!',
      data: data.customerCreate.customer,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error creating account. Please try again.',
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

// Get customer orders only
export async function getCustomerOrders(
  customerAccessToken: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customer: {
        orders: {
          edges: Array<{
            node: any;
          }>;
        };
      };
    }>(GET_CUSTOMER, { customerAccessToken });

    if (!data.customer) {
      return {
        success: false,
        message: 'Customer not found',
      };
    }

    return {
      success: true,
      message: 'Orders loaded successfully',
      data: data.customer.orders.edges.map((edge) => edge.node),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error loading orders',
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
      message: 'Order loaded successfully',
      data: data.order,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error loading order',
    };
  }
}

// Recover customer password
export async function recoverCustomerPassword(
  email: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerRecover: {
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_RECOVER, { email });

    if (data.customerRecover.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerRecover.customerUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Password recovery email sent successfully',
    };
  } catch (error) {
    console.error('Error recovering password:', error);
    return {
      success: false,
      message: 'Error sending password recovery email',
    };
  }
}

// Activate customer account with password
export async function activateCustomerByUrl(
  activationUrl: string,
  password: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerActivateByUrl: {
        customer: any;
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_ACTIVATE_BY_URL, { activationUrl, password });

    if (data.customerActivateByUrl.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerActivateByUrl.customerUserErrors[0].message,
      };
    }

    if (!data.customerActivateByUrl.customerAccessToken) {
      return {
        success: false,
        message: 'Failed to activate account',
      };
    }

    return {
      success: true,
      message: 'Account activated successfully',
      data: {
        customer: data.customerActivateByUrl.customer,
        accessToken: data.customerActivateByUrl.customerAccessToken,
      },
    };
  } catch (error) {
    console.error('Error activating customer:', error);
    return {
      success: false,
      message: 'Error activating account. Please try again.',
    };
  }
}

// Reset customer password with URL
export async function resetCustomerByUrl(
  resetUrl: string,
  password: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerResetByUrl: {
        customer: any;
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_RESET_BY_URL, { resetUrl, password });

    if (data.customerResetByUrl.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerResetByUrl.customerUserErrors[0].message,
      };
    }

    if (!data.customerResetByUrl.customerAccessToken) {
      return {
        success: false,
        message: 'Failed to reset password',
      };
    }

    return {
      success: true,
      message: 'Password reset successfully',
      data: {
        customer: data.customerResetByUrl.customer,
        accessToken: data.customerResetByUrl.customerAccessToken,
      },
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: 'Error resetting password. Please try again.',
    };
  }
}

// Customer Address Management Functions

// Create new customer address
export async function createCustomerAddress(
  customerAccessToken: string,
  address: CustomerAddressInput
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerAddressCreate: {
        customerAddress: any;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_ADDRESS_CREATE, { customerAccessToken, address });

    if (data.customerAddressCreate.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerAddressCreate.customerUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Endereço criado com sucesso',
      data: data.customerAddressCreate.customerAddress,
    };
  } catch (error) {
    console.error('Error creating address:', error);
    return {
      success: false,
      message: 'Erro ao criar endereço. Tente novamente.',
    };
  }
}

// Update existing customer address
export async function updateCustomerAddress(
  customerAccessToken: string,
  id: string,
  address: CustomerAddressInput
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerAddressUpdate: {
        customerAddress: any;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_ADDRESS_UPDATE, { customerAccessToken, id, address });

    if (data.customerAddressUpdate.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerAddressUpdate.customerUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Endereço atualizado com sucesso',
      data: data.customerAddressUpdate.customerAddress,
    };
  } catch (error) {
    console.error('Error updating address:', error);
    return {
      success: false,
      message: 'Erro ao atualizar endereço. Tente novamente.',
    };
  }
}

// Delete customer address
export async function deleteCustomerAddress(
  customerAccessToken: string,
  id: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerAddressDelete: {
        deletedCustomerAddressId: string;
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_ADDRESS_DELETE, { customerAccessToken, id });

    if (data.customerAddressDelete.customerUserErrors.length > 0) {
      return {
        success: false,
        message: data.customerAddressDelete.customerUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Endereço excluído com sucesso',
      data: data.customerAddressDelete.deletedCustomerAddressId,
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    return {
      success: false,
      message: 'Erro ao excluir endereço. Tente novamente.',
    };
  }
}

// Set customer default address
export async function setCustomerDefaultAddress(
  customerAccessToken: string,
  addressId: string
): Promise<ShopifyResponse> {
  try {
    const data = await shopifyFetch<{
      customerDefaultAddressUpdate: {
        customer: {
          id: string;
          defaultAddress: { id: string };
        };
        customerUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CUSTOMER_DEFAULT_ADDRESS_UPDATE, { customerAccessToken, addressId });

    if (data.customerDefaultAddressUpdate.customerUserErrors.length > 0) {
      return {
        success: false,
        message:
          data.customerDefaultAddressUpdate.customerUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Endereço principal definido com sucesso',
      data: data.customerDefaultAddressUpdate.customer,
    };
  } catch (error) {
    console.error('Error setting default address:', error);
    return {
      success: false,
      message: 'Erro ao definir endereço principal. Tente novamente.',
    };
  }
}
