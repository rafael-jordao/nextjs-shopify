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
