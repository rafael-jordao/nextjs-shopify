'use client';

import { ShopifyOrder, ShopifyResponse } from '@/types/shopify';
import { useQuery } from '@tanstack/react-query';

// Query Keys para orders
export const ORDER_QUERY_KEYS = {
  orders: ['orders'] as const,
  customerOrders: ['orders', 'customer'] as const,
} as const;

// Função para fazer fetch autenticado via API routes
async function fetchCustomerOrders(): Promise<ShopifyResponse> {
  const response = await fetch('/api/customer/orders', {
    method: 'GET',
    credentials: 'include', // Inclui cookies HttpOnly
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please login');
    }
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}

// Hook para buscar pedidos do cliente
export function useCustomerOrders() {
  return useQuery<ShopifyResponse>({
    queryKey: ORDER_QUERY_KEYS.customerOrders,
    queryFn: fetchCustomerOrders,
    staleTime: 2 * 60 * 1000, // 2 minutos - orders podem mudar
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnMount: true, // Sempre busca dados frescos dos pedidos
    refetchOnWindowFocus: true, // Atualiza quando usuário volta pro tab
    retry: (failureCount, error: any) => {
      // Não retry se for erro de auth (401/403)
      if (
        error?.message?.includes('Unauthorized') ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook para estatísticas derivadas dos pedidos
export function useOrderStats() {
  const { data, ...queryState } = useCustomerOrders();
  const orders: ShopifyOrder[] = data?.success ? data.data.orders || [] : [];
  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce(
      (sum: number, order: ShopifyOrder) =>
        sum + parseFloat(order.totalPrice?.amount || '0'),
      0
    ),
    pendingOrders: orders.filter(
      (order: ShopifyOrder) => order.fulfillmentStatus === 'UNFULFILLED'
    ).length,
    recentOrders: orders.slice(0, 3),
  };

  return {
    ...queryState,
    orders,
    stats,
  };
}

// Export the type for use in components
export type { ShopifyOrder };
