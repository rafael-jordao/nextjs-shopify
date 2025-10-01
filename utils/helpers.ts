import { Address, ShopifyCustomer, User } from '@/types/shopify';

// Helper function to extract the first image from a product
export function getProductImage(product: any) {
  return product?.images?.edges?.[0]?.node || null;
}

// Helper function to get the first variant from a product
export function getProductVariant(product: any) {
  return product?.variants?.edges?.[0]?.node || null;
}

// Helper function to format money
export function formatMoney(money: { amount: string; currencyCode: string }) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

// Helper function to get cart line items
export function getCartLines(cart: any) {
  return cart?.lines?.edges?.map((edge: any) => edge.node) || [];
}

// Helper function to calculate cart total items
export function getCartTotalItems(cart: any) {
  const lines = getCartLines(cart);
  return lines.reduce((total: number, line: any) => total + line.quantity, 0);
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

// Get product URL
export function getProductUrl(handle: string) {
  return `/products/${handle}`;
}

export function convertShopifyCustomerToUser(customer: ShopifyCustomer): User {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || undefined,
    acceptsMarketing: customer.acceptsMarketing || false,
    addresses:
      customer.addresses?.edges?.map(
        (edge): Address => ({
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
        })
      ) || [],
    orders: [], // Orders will be loaded separately when needed
  };
}

// Function to format international phone number
export const formatPhoneForShopify = (
  phone: string | undefined
): string | undefined => {
  if (!phone || phone.trim() === '') return undefined;

  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');

  // If phone already starts with +, keep it as is (already formatted)
  if (phone.startsWith('+')) {
    return phone.replace(/[^+\d]/g, ''); // Keep only + and digits
  }

  // If phone doesn't start with + and has valid length, add + prefix
  if (cleanPhone.length >= 7 && cleanPhone.length <= 15) {
    return `+${cleanPhone}`;
  }

  // Return the cleaned phone number as fallback
  return cleanPhone || undefined;
};

export async function apiCall<T>(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    const isJson = res.headers
      .get('content-type')
      ?.includes('application/json');
    const body = isJson ? await res.json() : {};

    if (!res.ok) {
      const msg = (body?.error ||
        body?.message ||
        `Request failed (${res.status})`) as string;
      return { success: false, error: msg, message: msg };
    }
    return {
      success: true,
      data: body.data as T,
      message: body.message as string | undefined,
    };
  } catch (e) {
    console.error('API call error:', e);
    return {
      success: false,
      error: 'Network error',
      message: 'Erro de conexão. Tente novamente.',
    };
  }
}
