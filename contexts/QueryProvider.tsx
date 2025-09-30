'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configurações otimizadas para e-commerce
            staleTime: 5 * 60 * 1000, // 5 minutos - produtos não mudam frequentemente
            gcTime: 10 * 60 * 1000, // 10 minutos - cache garbage collection
            retry: (failureCount, error: any) => {
              // Não retry em erros 4xx, apenas 5xx e network errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false, // Evita refetch desnecessário
            refetchOnMount: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1, // Retry uma vez para mutations (carrinho, auth)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
