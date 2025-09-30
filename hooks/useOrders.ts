'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomerOrders } from '@/lib/shopify/customer';
import { getAuthToken } from '@/utils/cookies';
import type { ShopifyResponse } from '@/types/shopify';

// Types
interface ShopifyOrder {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  lineItems: {
    edges: Array<{
      node: {
        title: string;
        quantity: number;
        variant: {
          id: string;
          price?: {
            amount: string;
            currencyCode: string;
          };
          image?: {
            url: string;
            altText: string;
          };
          product: {
            handle: string;
            title: string;
          };
        };
      };
    }>;
  };
}

// Query Keys para orders
export const ORDER_QUERY_KEYS = {
  orders: ['orders'] as const,
  customerOrders: (token: string) => ['orders', 'customer', token] as const,
} as const;

// Hook para buscar pedidos do cliente
export function useCustomerOrders() {
  const token = getAuthToken();

  return useQuery<ShopifyResponse<ShopifyOrder[]>>({
    queryKey: ORDER_QUERY_KEYS.customerOrders(token || ''),
    queryFn: async () => {
      if (!token || token === 'registered-user-token') {
        return { success: true, data: [], message: 'Demo user' };
      }
      return getCustomerOrders(token);
    },
    enabled: !!token, // Só executa se tem token
    staleTime: 2 * 60 * 1000, // 2 minutos - orders podem mudar
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnMount: true, // Sempre busca dados frescos dos pedidos
    refetchOnWindowFocus: true, // Atualiza quando usuário volta pro tab
    retry: (failureCount, error: any) => {
      // Não retry se for erro de auth (401/403)
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook para estatísticas derivadas dos pedidos
export function useOrderStats() {
  const { data: ordersResponse, ...queryState } = useCustomerOrders();

  const orders: ShopifyOrder[] = ordersResponse?.success
    ? ordersResponse.data || []
    : [];

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
