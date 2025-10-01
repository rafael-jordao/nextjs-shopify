import { GraphQLClient } from 'graphql-request';

// Shopify API version - centralized for easy updates
const SHOPIFY_API_VERSION = '2024-07';

// Shopify GraphQL client configuration
const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token':
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-SDK-Variant': 'nextjs',
  },
});

// Server-side Shopify fetch with retry logic for throttling
async function shopifyFetchServer<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: RequestInit,
  tries = 2
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token':
          process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-SDK-Variant': 'nextjs',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      ...init,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      // Check for throttling
      const throttled = result.errors.some((e: any) =>
        String(e.message).includes('THROTTLED')
      );

      if (throttled && tries > 0) {
        // Wait before retry with exponential backoff
        const delay = response.headers.get('Retry-After')
          ? parseInt(response.headers.get('Retry-After')!) * 1000
          : 700 + Math.random() * 300;

        await new Promise((resolve) => setTimeout(resolve, delay));
        return shopifyFetchServer<T>(query, variables, init, tries - 1);
      }

      throw new Error(result.errors.map((e: any) => e.message).join(', '));
    }

    return result.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Generic Shopify GraphQL fetch function with intelligent caching
export async function shopifyFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: {
    cache?: RequestCache;
    next?: { revalidate?: number | false; tags?: string[] };
    signal?: AbortSignal;
  }
): Promise<T> {
  const isServer = typeof window === 'undefined';
  const isMutation = /^\s*mutation\b/i.test(query);

  try {
    if (isServer) {
      // Server-side with intelligent caching
      const cache = isMutation ? 'no-store' : options?.cache ?? 'force-cache';
      const next = isMutation ? undefined : options?.next ?? { revalidate: 60 };

      return await shopifyFetchServer<T>(query, variables, {
        cache,
        next,
        signal: options?.signal,
      });
    } else {
      // Client-side with timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        // Note: graphql-request doesn't support AbortSignal directly
        // We'll use a timeout promise race instead
        const requestPromise = shopifyClient.request<T>(query, variables);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000);
        });

        const data = await Promise.race([requestPromise, timeoutPromise]);
        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  } catch (err: any) {
    // Normalize and localize error messages
    const msg = String(err?.message ?? err);

    if (err.name === 'AbortError') {
      throw new Error('Tempo limite excedido. Verifique sua conexão.');
    }

    if (/THROTTLED|Limit exceeded/i.test(msg)) {
      throw new Error(
        'Muitas tentativas recentes. Tente novamente em alguns minutos.'
      );
    }

    if (/Unauthorized|Invalid access token/i.test(msg)) {
      throw new Error('Erro de autenticação. Verifique suas credenciais.');
    }

    if (/validation|invalid/i.test(msg)) {
      throw new Error('Dados inválidos. Verifique as informações fornecidas.');
    }

    if (/network|fetch/i.test(msg)) {
      throw new Error('Erro de conexão com o servidor. Tente novamente.');
    }

    // Preserve original error for debugging, but provide user-friendly message
    console.error('Shopify GraphQL Error:', err);
    throw new Error('Erro inesperado. Tente novamente.');
  }
}
