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
      console.log('Server-side Shopify fetch');
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
      console.log('Client-side Shopify fetch');
      // For client-side requests, use the graphql-request client
      const data = await shopifyClient.request<T>(query, variables);
      return data;
    }
  } catch (error) {
    console.error('Shopify GraphQL Error:', error);

    // Handle specific Shopify errors
    if (error instanceof Error) {
      // Check for rate limiting errors
      if (
        error.message.includes('THROTTLED') ||
        error.message.includes('Limit exceeded')
      ) {
        throw new Error(
          'Muitas tentativas recentes. Tente novamente em alguns minutos.'
        );
      }

      // Check for authentication errors
      if (
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid access token')
      ) {
        throw new Error('Erro de autenticação. Verifique suas credenciais.');
      }

      // Check for validation errors
      if (
        error.message.includes('validation') ||
        error.message.includes('invalid')
      ) {
        throw new Error(
          'Dados inválidos. Verifique as informações fornecidas.'
        );
      }

      throw error;
    }

    throw new Error('Erro de conexão com o servidor. Tente novamente.');
  }
}
