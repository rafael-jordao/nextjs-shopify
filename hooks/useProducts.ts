'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShopifyProduct } from '@/types/shopify';
import { getProducts, getProduct } from '@/lib/shopify/products';

// Query Keys - centralizados para consistência
export const QUERY_KEYS = {
  products: ['products'] as const,
  product: (handle: string) => ['products', handle] as const,
  cart: ['cart'] as const,
  customer: ['customer'] as const,
} as const;

// Hook para buscar todos os produtos
// Coordena com o cache do Next.js (revalidate: 300s)
export function useProducts(first: number = 12) {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, first],
    queryFn: () => getProducts(first, 300), // 5 minutos - alinhado com Next.js revalidate
    staleTime: 5 * 60 * 1000, // 5 minutos - sincronizado com Next.js
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnMount: false, // Evita double-fetch se Next.js já carregou
    refetchOnWindowFocus: false,
  });
}

// Hook para buscar produto específico
// Coordena com o cache do Next.js
export function useProduct(handle: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(handle),
    queryFn: () => getProduct(handle),
    enabled: !!handle, // Só executa se handle existe
    staleTime: 10 * 60 * 1000, // 10 minutos - produtos individuais mudam pouco
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnMount: false, // Next.js já fez SSG/ISR
    refetchOnWindowFocus: false,
  });
}

// Hook para invalidar cache de produtos
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateProducts: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products }),
    invalidateProduct: (handle: string) =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(handle) }),
  };
}
