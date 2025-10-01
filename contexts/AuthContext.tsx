/**
 * Enhanced AuthContext with secure server-side authentication
 * Uses API routes for all customer operations to protect customerAccessToken
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { toast } from 'sonner';
import { safeLocalStorage } from '../hooks/useLocalStorage';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  User,
  AuthState,
  AuthContextType,
  LoginData,
  RegisterData,
} from '../types/shopify';
import { apiCall } from '@/utils/helpers';

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Create context with default values to prevent SSR issues
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API helper functions
// async function apiCall<T>(
//   url: string,
//   options: RequestInit = {}
// ): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
//   try {
//     const response = await fetch(url, {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       return {
//         success: false,
//         error: result.error || result.message || 'Request failed',
//         message: result.error || result.message || 'Request failed',
//       };
//     }

//     return {
//       success: true,
//       data: result.data,
//       message: result.message,
//     };
//   } catch (error) {
//     console.error('API call error:', error);
//     return {
//       success: false,
//       error: 'Network error',
//       message: 'Erro de conexão. Tente novamente.',
//     };
//   }
// }

// Query Keys para auth
export const AUTH_QUERY_KEYS = {
  session: ['auth', 'session'] as const,
  profile: ['auth', 'profile'] as const,
} as const;

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize user session using TanStack Query
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: () =>
      apiCall<{ user: User; authenticated: boolean }>('/api/auth/session'),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Update state based on session data
  useEffect(() => {
    if (sessionLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
      return;
    }

    if (sessionData?.success && sessionData?.data?.authenticated) {
      const user = sessionData.data.user;
      safeLocalStorage.setJSON('shopify-user', user);
      dispatch({ type: 'SET_USER', payload: user });
    } else {
      safeLocalStorage.removeItem('shopify-user');
      dispatch({ type: 'LOGOUT' });
    }
  }, [sessionData, sessionLoading]);

  // Listen for localStorage changes (like manual user removal between tabs)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'shopify-user' && event.newValue === null) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiCall<{ user: User; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    onMutate: () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
    },
    onSuccess: (loginResponse) => {
      if (!loginResponse.success) {
        throw new Error(loginResponse.message || 'Erro ao fazer login');
      }

      const user = loginResponse.data!.user;
      safeLocalStorage.setJSON('shopify-user', user);
      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Login realizado com sucesso!');

      // Invalidate session query to refetch
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.session });

      // Handle post-login redirect
      const redirectPath = sessionStorage.getItem('post-login-redirect');
      if (redirectPath) {
        sessionStorage.removeItem('post-login-redirect');
        router.push(redirectPath);
      } else {
        router.push('/account');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Erro inesperado ao fazer login';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    },
    onSettled: () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await loginMutation.mutateAsync({ email, password });
        return { success: true, data: state.user || undefined };
      } catch (e: any) {
        return { success: false, message: e.message };
      }
    },
    [loginMutation, state.user]
  );
  // Login function wrapper

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) =>
      apiCall<{ message: string; customer: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    onMutate: () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
    },
    onSuccess: (registerResponse) => {
      if (!registerResponse.success) {
        throw new Error(registerResponse.message || 'Erro ao criar conta');
      }
      toast.success(registerResponse.data!.message);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Erro inesperado ao criar conta';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    },
    onSettled: () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    },
  });

  // Register function wrapper
  const register = useCallback(
    async (userData: RegisterData) => {
      try {
        const result = await registerMutation.mutateAsync(userData);
        return {
          success: true,
          message: result.data!.message,
          data: result.data!.customer,
        };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    [registerMutation]
  );

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiCall('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.warn('Logout API call failed:', error);
    },
    onSettled: () => {
      // Always clear local state regardless of API call result
      safeLocalStorage.removeItem('shopify-user');
      dispatch({ type: 'LOGOUT' });
      router.push('/');
    },
  });

  // Logout function wrapper
  const logout = useCallback(async () => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<User>) =>
      apiCall<{ user: User; message: string }>('/api/customer/update', {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
    onMutate: () => {
      if (!state.user) {
        throw new Error('Usuário não logado');
      }
      dispatch({ type: 'SET_LOADING', payload: true });
    },
    onSuccess: (updateResponse) => {
      if (!updateResponse.success) {
        throw new Error(updateResponse.message || 'Erro ao atualizar perfil');
      }

      const updatedUser = updateResponse.data!.user;
      safeLocalStorage.setJSON('shopify-user', updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      toast.success('Perfil atualizado com sucesso!');

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.session });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Erro ao atualizar perfil';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    },
    onSettled: () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    },
  });

  // Update user function wrapper
  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      updateUserMutation.mutate(userData);
    },
    [updateUserMutation]
  );

  // Refresh user function using query invalidation
  const refreshUser = async () => {
    if (!state.user) return;

    // Invalidate and refetch profile data
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.session });
  };

  // Recover password mutation
  const recoverPasswordMutation = useMutation({
    mutationFn: (email: string) =>
      apiCall<{ message: string }>('/api/auth/recover-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    onMutate: () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
    },
    onSuccess: (result) => {
      if (!result.success) {
        throw new Error(
          result.message || 'Erro ao enviar email de recuperação'
        );
      }
      toast.success(
        result.data?.message || 'Email de recuperação enviado com sucesso'
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error.message || 'Erro ao enviar email de recuperação';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    },
    onSettled: () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    },
  });

  // Recover password function wrapper
  const recoverPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await recoverPasswordMutation.mutateAsync(email);
      return { success: true, message: result.data?.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  // Utility functions for manual state updates (used by activation process)
  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
    safeLocalStorage.setItem('shopify-user', JSON.stringify(user));
  };

  const setIsAuthenticated = (isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value: AuthContextType = useMemo(() => {
    return {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading || sessionLoading,
      error: state.error,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      recoverPassword,
      setUser,
      setIsAuthenticated,
    };
  }, [
    state,
    sessionLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    recoverPassword,
    setUser,
    setIsAuthenticated,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
