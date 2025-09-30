'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
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

  // Check for existing user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const token = localStorage.getItem('shopify-auth-token');
        const savedUser = localStorage.getItem('shopify-user');

        if (token && savedUser && token !== 'registered-user-token') {
          // Try to validate token with Shopify
          const customerResponse = await getCustomer(token);

          if (customerResponse.success && customerResponse.data) {
            const user = convertShopifyCustomerToUser(customerResponse.data);
            dispatch({ type: 'SET_USER', payload: user });
            // Update localStorage with fresh data
            localStorage.setItem('shopify-user', JSON.stringify(user));
          } else {
            // Token validation failed, but keep user data if available
            console.warn('Token validation failed, using cached user data');
            const user = JSON.parse(savedUser);
            dispatch({ type: 'SET_USER', payload: user });
          }
        } else if (savedUser) {
          // Load from localStorage (for demo/registered users)
          const user = JSON.parse(savedUser);
          dispatch({ type: 'SET_USER', payload: user });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    // Call Shopify login API
    const loginResponse = await loginCustomer({ email, password });

    if (!loginResponse.success) {
      dispatch({ type: 'SET_ERROR', payload: loginResponse.message });
      return;
    }

    // Get customer data using the access token
    const customerResponse = await getCustomer(loginResponse.data.accessToken);

    if (!customerResponse.success || !customerResponse.data) {
      dispatch({ type: 'SET_ERROR', payload: customerResponse.message });
      return;
    }

    // Convert Shopify customer to User interface
    const user = convertShopifyCustomerToUser(customerResponse.data);

    // Save user and token to localStorage
    localStorage.setItem('shopify-user', JSON.stringify(user));
    localStorage.setItem('shopify-auth-token', loginResponse.data.accessToken);

    dispatch({ type: 'SET_USER', payload: user });
  };

  // Register function
  const register = async (userData: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

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
      return;
    }

    // Convert Shopify customer to User interface
    const user = convertShopifyCustomerToUser(registerResponse.data);

    // Save user to localStorage (consider using secure storage in production)
    localStorage.setItem('shopify-user', JSON.stringify(user));
    localStorage.setItem('shopify-auth-token', 'registered-user-token'); // In real implementation, use proper token

    dispatch({ type: 'SET_USER', payload: user });
  };

  // Logout function
  const logout = async () => {
    const token = localStorage.getItem('shopify-auth-token');

    // If there's a valid token, call Shopify logout API
    if (token && token !== 'registered-user-token') {
      const logoutResponse = await logoutCustomer(token);
      if (!logoutResponse.success) {
        console.warn('Logout API call failed:', logoutResponse.message);
      }
    }

    // Always clear local storage and user state
    localStorage.removeItem('shopify-user');
    localStorage.removeItem('shopify-auth-token');
    dispatch({ type: 'LOGOUT' });
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) {
      dispatch({ type: 'SET_ERROR', payload: 'Usuário não logado' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    const token = localStorage.getItem('shopify-auth-token');

    if (token && token !== 'registered-user-token') {
      // Call Shopify's Customer Account API to update user data
      const updateResponse = await updateCustomer(token, userData);

      if (!updateResponse.success) {
        dispatch({ type: 'SET_ERROR', payload: updateResponse.message });
        return;
      }

      const updatedUser = convertShopifyCustomerToUser(updateResponse.data);
      localStorage.setItem('shopify-user', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } else {
      // For demo users, update locally
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('shopify-user', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!state.user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    const token = localStorage.getItem('shopify-auth-token');

    if (token && token !== 'registered-user-token') {
      // Fetch fresh data from Shopify
      const customerResponse = await getCustomer(token);

      if (customerResponse.success && customerResponse.data) {
        const user = convertShopifyCustomerToUser(customerResponse.data);
        localStorage.setItem('shopify-user', JSON.stringify(user));
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_ERROR', payload: customerResponse.message });
      }
    } else {
      // Refresh from localStorage for demo users
      const savedUser = localStorage.getItem('shopify-user');
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
