'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { safeLocalStorage } from '../hooks/useLocalStorage';
import {
  createCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomer,
  updateCustomer,
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
    acceptsMarketing: customer.acceptsMarketing,
    addresses: customer.addresses.nodes.map(
      (address): Address => ({
        id: address.id,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.provinceCode,
        zip: address.zip,
        country: address.countryCodeV2,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        phone: address.phone,
      })
    ),
    orders: [], // Orders will be loaded separately when needed
  };
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize user from localStorage (SSR-safe)
  useEffect(() => {
    const initializeUser = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const token = safeLocalStorage.getItem('shopify-auth-token');
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
          // Load from localStorage (for demo/registered users)
          const demoUser = savedUser ? JSON.parse(savedUser) : null;
          if (demoUser) {
            dispatch({ type: 'SET_USER', payload: demoUser });
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao inicializar usuário' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeUser();
  }, []); // Login function
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

      // Save user and token to localStorage (with SSR safety)
      safeLocalStorage.setJSON('shopify-user', user);
      safeLocalStorage.setItem(
        'shopify-auth-token',
        loginResponse.data.accessToken
      );

      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Login realizado com sucesso!');

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
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        acceptsMarketing: userData.acceptsMarketing,
        password: userData.password,
      });

      if (!registerResponse.success) {
        dispatch({ type: 'SET_ERROR', payload: registerResponse.message });
        toast.error(registerResponse.message || 'Erro ao criar conta');
        return { success: false, message: registerResponse.message };
      }

      // Convert Shopify customer to User interface
      const user = convertShopifyCustomerToUser(registerResponse.data);

      // Save user to localStorage (with SSR safety)
      safeLocalStorage.setJSON('shopify-user', user);
      safeLocalStorage.setItem('shopify-auth-token', 'registered-user-token'); // In real implementation, use proper token

      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Conta criada com sucesso!');

      return { success: true, data: user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao criar conta';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    const token = safeLocalStorage.getItem('shopify-auth-token');

    // If there's a valid token, call Shopify logout API
    if (token && token !== 'registered-user-token') {
      const logoutResponse = await logoutCustomer(token);
      if (!logoutResponse.success) {
        console.warn('Logout API call failed:', logoutResponse.message);
      }
    }

    // Always clear local storage and user state
    safeLocalStorage.removeItem('shopify-user');
    safeLocalStorage.removeItem('shopify-auth-token');
    dispatch({ type: 'LOGOUT' });
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) {
      dispatch({ type: 'SET_ERROR', payload: 'Usuário não logado' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    const token = safeLocalStorage.getItem('shopify-auth-token');

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

    const token = safeLocalStorage.getItem('shopify-auth-token');

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
