import { GraphQLClient } from 'graphql-request';

// Shopify GraphQL client configuration
const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}/api/2024-07/graphql.json`;

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token':
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Generic Shopify GraphQL fetch function with cache configuration
export async function shopifyFetch<T = any>(
  query: string,
  variables?: Record<string, any>,
  options?: {
    cache?: RequestCache;
    next?: { revalidate?: number | false; tags?: string[] };
  }
): Promise<T> {
  try {
    // For server-side requests, use Next.js fetch with cache control
    if (typeof window === 'undefined') {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token':
            process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        cache: options?.cache || 'force-cache',
        next: options?.next || { revalidate: 60 }, // Revalidate every 60 seconds
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '));
      }

      return result.data;
    } else {
      // For client-side requests, use the graphql-request client
      const data = await shopifyClient.request<T>(query, variables);
      return data;
    }
  } catch (error) {
    console.error('Shopify GraphQL Error:', error);
    throw new Error(
      `Failed to fetch from Shopify: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

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
