import { shopifyFetch } from './client';
import {
  GET_CUSTOMER,
  GET_ORDER,
  CUSTOMER_CREATE,
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_UPDATE,
} from './queries/customer';

// Customer interfaces
interface CustomerCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
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
export async function createCustomer(input: CustomerCreateInput) {
  const data = await shopifyFetch<{
    customerCreate: {
      customer: any;
      customerUserErrors: Array<{ field: string; message: string }>;
    };
  }>(CUSTOMER_CREATE, { input });

  if (data.customerCreate.customerUserErrors.length > 0) {
    throw new Error(data.customerCreate.customerUserErrors[0].message);
  }

  return data.customerCreate.customer;
}

// Login customer and get access token
export async function loginCustomer(input: CustomerLoginInput) {
  const data = await shopifyFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: Array<{ field: string; message: string }>;
    };
  }>(CUSTOMER_ACCESS_TOKEN_CREATE, { input });

  if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
    throw new Error(
      data.customerAccessTokenCreate.customerUserErrors[0].message
    );
  }

  if (!data.customerAccessTokenCreate.customerAccessToken) {
    throw new Error('Invalid email or password');
  }

  return data.customerAccessTokenCreate.customerAccessToken;
}

// Logout customer (delete access token)
export async function logoutCustomer(customerAccessToken: string) {
  const data = await shopifyFetch<{
    customerAccessTokenDelete: {
      deletedAccessToken: string;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(CUSTOMER_ACCESS_TOKEN_DELETE, { customerAccessToken });

  if (data.customerAccessTokenDelete.userErrors.length > 0) {
    throw new Error(data.customerAccessTokenDelete.userErrors[0].message);
  }

  return data.customerAccessTokenDelete.deletedAccessToken;
}

// Get customer data including orders
export async function getCustomer(customerAccessToken: string) {
  const data = await shopifyFetch<{
    customer: any;
  }>(GET_CUSTOMER, { customerAccessToken });

  return data.customer;
}

// Update customer information
export async function updateCustomer(
  customerAccessToken: string,
  customer: CustomerUpdateInput
) {
  const data = await shopifyFetch<{
    customerUpdate: {
      customer: any;
      customerUserErrors: Array<{ field: string; message: string }>;
    };
  }>(CUSTOMER_UPDATE, { customerAccessToken, customer });

  if (data.customerUpdate.customerUserErrors.length > 0) {
    throw new Error(data.customerUpdate.customerUserErrors[0].message);
  }

  return data.customerUpdate.customer;
}

// Get specific order details
export async function getOrder(id: string) {
  const data = await shopifyFetch<{
    order: any;
  }>(GET_ORDER, { id });

  return data.order;
}

// Helper function to format order status
export function formatOrderStatus(status: string) {
  const statusMap: { [key: string]: string } = {
    FULFILLED: 'Delivered',
    UNFULFILLED: 'Processing',
    PARTIALLY_FULFILLED: 'Partially Shipped',
    PAID: 'Paid',
    PENDING: 'Payment Pending',
    PARTIALLY_PAID: 'Partially Paid',
    REFUNDED: 'Refunded',
    VOIDED: 'Cancelled',
  };

  return statusMap[status] || status;
}

// Helper function to get order status color
export function getOrderStatusColor(status: string) {
  const colorMap: { [key: string]: string } = {
    FULFILLED: 'text-green-600 bg-green-100',
    UNFULFILLED: 'text-yellow-600 bg-yellow-100',
    PARTIALLY_FULFILLED: 'text-blue-600 bg-blue-100',
    PAID: 'text-green-600 bg-green-100',
    PENDING: 'text-yellow-600 bg-yellow-100',
    PARTIALLY_PAID: 'text-blue-600 bg-blue-100',
    REFUNDED: 'text-gray-600 bg-gray-100',
    VOIDED: 'text-red-600 bg-red-100',
  };

  return colorMap[status] || 'text-gray-600 bg-gray-100';
}
