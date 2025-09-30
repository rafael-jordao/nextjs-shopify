'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { safeLocalStorage } from '../hooks/useLocalStorage';
import { getAuthToken, setCookie, removeCookie } from '../utils/cookies';
import {
  createCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomer,
  updateCustomer,
  recoverCustomerPassword,
} from '../lib/shopify/customer';
import type {
  User,
  AuthState,
  AuthContextType,
  LoginData,
  RegisterData,
  ShopifyCustomer,
  Address,
} from '../types/shopify';

import { useRouter } from 'next/navigation';

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

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert ShopifyCustomer to User
function convertShopifyCustomerToUser(customer: ShopifyCustomer): User {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || undefined,
    acceptsMarketing: customer.acceptsMarketing || false,
    addresses:
      customer.addresses?.edges?.map(
        (edge): Address => ({
          id: edge.node.id,
          address1: edge.node.address1,
          address2: edge.node.address2,
          city: edge.node.city,
          province: edge.node.provinceCode,
          zip: edge.node.zip,
          country: edge.node.countryCodeV2,
          firstName: edge.node.firstName,
          lastName: edge.node.lastName,
          company: edge.node.company,
          phone: edge.node.phone,
        })
      ) || [],
    orders: [], // Orders will be loaded separately when needed
  };
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Initialize user from localStorage (SSR-safe)
  useEffect(() => {
    const initializeUser = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const token = getAuthToken();
        const savedUser = safeLocalStorage.getItem('shopify-user');

        if (token && savedUser) {
          const userJson = JSON.parse(savedUser);

          // Validate with Shopify (if real user)
          if (token !== 'registered-user-token') {
            const customerResponse = await getCustomer(token);
            if (customerResponse.success && customerResponse.data) {
              const validatedUser = convertShopifyCustomerToUser(
                customerResponse.data
              );
              // Update localStorage with fresh data
              safeLocalStorage.setJSON('shopify-user', validatedUser);
              dispatch({ type: 'SET_USER', payload: validatedUser });
            } else {
              // Token invalid, use saved user data
              dispatch({ type: 'SET_USER', payload: userJson });
            }
          } else {
            dispatch({ type: 'SET_USER', payload: userJson });
          }
        } else {
          // No token means no authentication - clear any stored user data
          if (savedUser) {
            safeLocalStorage.removeItem('shopify-user');
          }
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao inicializar usuário' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeUser();

    // Listen for localStorage changes (like manual user removal between tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'shopify-user' && event.newValue === null) {
        // User was removed, logout user immediately
        dispatch({ type: 'LOGOUT' });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Separate effect for periodic token validation
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = getAuthToken();
      if (state.user && !token) {
        // User is logged in but no token exists - force logout
        safeLocalStorage.removeItem('shopify-user');
        dispatch({ type: 'LOGOUT' });
      }
    };

    const intervalId = setInterval(checkTokenValidity, 2000); // Check every 2 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [state.user]);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Call Shopify login API
      const loginResponse = await loginCustomer({ email, password });

      if (!loginResponse.success) {
        dispatch({ type: 'SET_ERROR', payload: loginResponse.message });
        toast.error(loginResponse.message || 'Erro ao fazer login');
        return { success: false, message: loginResponse.message };
      }

      // Get customer data using the access token
      const customerResponse = await getCustomer(
        loginResponse.data.accessToken
      );

      if (!customerResponse.success || !customerResponse.data) {
        const errorMessage =
          customerResponse.message || 'Erro ao carregar dados do usuário';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }

      // Convert Shopify customer to User interface
      const user = convertShopifyCustomerToUser(customerResponse.data);

      // Save user to localStorage (with SSR safety)
      safeLocalStorage.setJSON('shopify-user', user);

      // Set cookie for both middleware and client access
      setCookie('shopify-auth-token', loginResponse.data.accessToken);

      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Login realizado com sucesso!');

      // Handle post-login redirect
      const redirectPath = sessionStorage.getItem('post-login-redirect');
      if (redirectPath) {
        sessionStorage.removeItem('post-login-redirect');
        router.push(redirectPath);
      }

      return { success: true, data: user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao fazer login';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Create customer using Shopify API
      const registerResponse = await createCustomer({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        acceptsMarketing: userData.acceptsMarketing,
      });

      if (!registerResponse.success) {
        dispatch({ type: 'SET_ERROR', payload: registerResponse.message });
        toast.error(registerResponse.message || 'Erro ao criar conta');
        return { success: false, message: registerResponse.message };
      }

      toast.success('Account created successfully!');

      return {
        success: true,
        message: 'Account created successfully!',
        data: registerResponse.data,
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao criar conta';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    const token = getAuthToken();

    // If there's a valid token, call Shopify logout API
    if (token && token !== 'registered-user-token') {
      const logoutResponse = await logoutCustomer(token);
      if (!logoutResponse.success) {
        console.warn('Logout API call failed:', logoutResponse.message);
      }
    }

    // Always clear local storage and user state
    safeLocalStorage.removeItem('shopify-user');

    // Clear cookie (our single source of truth for token)
    removeCookie('shopify-auth-token');

    dispatch({ type: 'LOGOUT' });
    router.push('/');
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) {
      dispatch({ type: 'SET_ERROR', payload: 'Usuário não logado' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    const token = getAuthToken();

    if (token && token !== 'registered-user-token') {
      // Call Shopify's Customer Account API to update user data
      const updateResponse = await updateCustomer(token, userData);

      if (!updateResponse.success) {
        dispatch({ type: 'SET_ERROR', payload: updateResponse.message });
        return;
      }

      const updatedUser = convertShopifyCustomerToUser(updateResponse.data);
      safeLocalStorage.setJSON('shopify-user', updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } else {
      // For demo users, update locally
      const updatedUser = { ...state.user, ...userData };
      safeLocalStorage.setJSON('shopify-user', updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!state.user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    const token = getAuthToken();

    if (token && token !== 'registered-user-token') {
      // Fetch fresh data from Shopify
      const customerResponse = await getCustomer(token);

      if (customerResponse.success && customerResponse.data) {
        const user = convertShopifyCustomerToUser(customerResponse.data);
        safeLocalStorage.setJSON('shopify-user', user);
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_ERROR', payload: customerResponse.message });
      }
    } else {
      // Refresh from localStorage for demo users
      const savedUser = safeLocalStorage.getItem('shopify-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Recover password function
  const recoverPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await recoverCustomerPassword(email);

      if (response.success) {
        toast.success(
          response.message || 'Password recovery email sent successfully'
        );
        return { success: true, message: response.message };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(
          response.message || 'Error sending password recovery email'
        );
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = 'Error sending password recovery email';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
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
