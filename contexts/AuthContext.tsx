'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  createCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomer,
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
          try {
            const customerData = await getCustomer(token);
            if (customerData.customer) {
              const user = convertShopifyCustomerToUser(customerData.customer);
              dispatch({ type: 'SET_USER', payload: user });
              // Update localStorage with fresh data
              localStorage.setItem('shopify-user', JSON.stringify(user));
            } else {
              // Invalid token, clear storage
              localStorage.removeItem('shopify-user');
              localStorage.removeItem('shopify-auth-token');
            }
          } catch (error) {
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
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Call Shopify login API - will throw error if login fails
      const customerAccessToken = await loginCustomer({ email, password });

      // Get customer data using the access token
      const customerData = await getCustomer(customerAccessToken.accessToken);

      if (!customerData.customer) {
        throw new Error('Failed to retrieve customer data');
      }

      // Convert Shopify customer to User interface
      const user = convertShopifyCustomerToUser(customerData.customer);

      // Save user and token to localStorage
      localStorage.setItem('shopify-user', JSON.stringify(user));
      localStorage.setItem(
        'shopify-auth-token',
        customerAccessToken.accessToken
      );

      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Create customer using Shopify API
      const customerResponse = await createCustomer({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        acceptsMarketing: userData.acceptsMarketing,
        password: userData.password,
      });

      if (customerResponse.customerUserErrors.length > 0) {
        throw new Error(customerResponse.customerUserErrors[0].message);
      }

      // Convert Shopify customer to User interface
      const user = convertShopifyCustomerToUser(customerResponse.customer);

      // Save user to localStorage (consider using secure storage in production)
      localStorage.setItem('shopify-user', JSON.stringify(user));
      localStorage.setItem('shopify-auth-token', 'registered-user-token'); // In real implementation, use proper token

      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('shopify-auth-token');

      // If there's a valid token, call Shopify logout API
      if (token && token !== 'registered-user-token') {
        await logoutCustomer(token);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local storage and user state
      localStorage.removeItem('shopify-user');
      localStorage.removeItem('shopify-auth-token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!state.user) throw new Error('No user logged in');

      dispatch({ type: 'SET_LOADING', payload: true });

      // In production, call Shopify's Customer Account API to update user data
      // For demo purposes, we'll just update locally
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('shopify-user', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      if (!state.user) return;

      dispatch({ type: 'SET_LOADING', payload: true });

      const token = localStorage.getItem('shopify-auth-token');

      if (token && token !== 'registered-user-token') {
        // Fetch fresh data from Shopify
        const customerData = await getCustomer(token);
        if (customerData.customer) {
          const user = convertShopifyCustomerToUser(customerData.customer);
          localStorage.setItem('shopify-user', JSON.stringify(user));
          dispatch({ type: 'SET_USER', payload: user });
        }
      } else {
        // Refresh from localStorage for demo users
        const savedUser = localStorage.getItem('shopify-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          dispatch({ type: 'SET_USER', payload: user });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Refresh failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
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
