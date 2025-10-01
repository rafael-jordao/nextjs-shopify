'use client';

import { Address, ShopifyResponse } from '@/types/shopify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query Keys para addresses
export const ADDRESS_QUERY_KEYS = {
  addresses: ['addresses'] as const,
  customerAddresses: ['addresses', 'customer'] as const,
} as const;

// Função para fazer fetch autenticado via API routes
async function fetchCustomerAddresses(): Promise<ShopifyResponse> {
  const response = await fetch('/api/customer/addresses', {
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
    throw new Error(`Failed to fetch addresses: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}

// Hook para buscar endereços do cliente
export function useCustomerAddresses() {
  return useQuery<ShopifyResponse>({
    queryKey: ADDRESS_QUERY_KEYS.customerAddresses,
    queryFn: fetchCustomerAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutos - addresses não mudam muito
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

// Hook para criar endereço
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData: Omit<Address, 'id'>) => {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login');
        }
        throw new Error(`Failed to create address: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidar cache dos endereços
        queryClient.invalidateQueries({
          queryKey: ADDRESS_QUERY_KEYS.customerAddresses,
        });
        toast.success('Address created successfully!');
      } else {
        toast.error(data.message || 'Failed to create address');
      }
    },
    onError: (error: any) => {
      console.error('Error creating address:', error);
      toast.error(error.message || 'Error creating address');
    },
  });
}

// Hook para atualizar endereço
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      addressData,
    }: {
      id: string;
      addressData: Partial<Address>;
    }) => {
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login');
        }
        throw new Error(`Failed to update address: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidar cache dos endereços
        queryClient.invalidateQueries({
          queryKey: ADDRESS_QUERY_KEYS.customerAddresses,
        });
        toast.success('Address updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update address');
      }
    },
    onError: (error: any) => {
      console.error('Error updating address:', error);
      toast.error(error.message || 'Error updating address');
    },
  });
}

// Hook para deletar endereço
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login');
        }
        throw new Error(`Failed to delete address: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidar cache dos endereços
        queryClient.invalidateQueries({
          queryKey: ADDRESS_QUERY_KEYS.customerAddresses,
        });
        toast.success('Address deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete address');
      }
    },
    onError: (error: any) => {
      console.error('Error deleting address:', error);
      toast.error(error.message || 'Error deleting address');
    },
  });
}

// Hook para definir endereço padrão
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await fetch(
        `/api/customer/addresses/${addressId}/default`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login');
        }
        throw new Error(
          `Failed to set default address: ${response.statusText}`
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidar cache dos endereços
        queryClient.invalidateQueries({
          queryKey: ADDRESS_QUERY_KEYS.customerAddresses,
        });
        toast.success('Default address updated!');
      } else {
        toast.error(data.message || 'Failed to set default address');
      }
    },
    onError: (error: any) => {
      console.error('Error setting default address:', error);
      toast.error(error.message || 'Error setting default address');
    },
  });
}
