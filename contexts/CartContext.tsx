'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShopifyCart, CartContextType } from '../types/shopify';
import {
  createCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  getCart,
} from '../lib/shopify';

// Cart state interface
interface CartState {
  cart: ShopifyCart | null;
  isLoading: boolean;
  error: string | null;
}

// Cart actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: ShopifyCart }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_CART' };

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_CART':
      return { ...state, cart: null, error: null };
    default:
      return state;
  }
}

// Initial state
const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

// Query keys for TanStack Query
const CART_QUERY_KEYS = {
  cart: (cartId?: string) => ['cart', cartId] as const,
} as const;

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const queryClient = useQueryClient();

  // Get cart ID from localStorage (client-side only)
  const getCartId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopify-cart-id');
    }
    return null;
  };

  // TanStack Query para carregar o carrinho
  const { data: cartData, isLoading: queryLoading } = useQuery({
    queryKey: CART_QUERY_KEYS.cart(getCartId() || undefined),
    queryFn: async () => {
      const cartId = getCartId();
      if (!cartId) return null;

      const response = await getCart(cartId);
      if (!response.success) {
        // Cart not found, clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('shopify-cart-id');
        }
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!getCartId(),
    staleTime: 0, // Carrinho sempre fresh
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      // Não retry se carrinho não existe (404)
      if (error?.message?.includes('not found')) return false;
      return failureCount < 2;
    },
  });

  // Sync TanStack Query data with local state
  useEffect(() => {
    if (cartData) {
      dispatch({ type: 'SET_CART', payload: cartData });
    } else if (!queryLoading) {
      dispatch({ type: 'CLEAR_CART' });
    }
    dispatch({ type: 'SET_LOADING', payload: queryLoading });
  }, [cartData, queryLoading]);

  // Mutations com TanStack Query
  const createCartMutation = useMutation({
    mutationFn: createCart,
    onSuccess: (data) => {
      if (data.success && data.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopify-cart-id', data.data.id);
        }
        queryClient.setQueryData(CART_QUERY_KEYS.cart(data.data.id), data.data);
      }
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: ({
      cartId,
      items,
    }: {
      cartId: string;
      items: Array<{ merchandiseId: string; quantity: number }>;
    }) => addToCart(cartId, items),
    onSuccess: (data, variables) => {
      if (data.success && data.data) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.cart(variables.cartId),
          data.data
        );
        queryClient.invalidateQueries({
          queryKey: CART_QUERY_KEYS.cart(variables.cartId),
        });
      }
    },
  });

  // Add to cart function
  const handleAddToCart = async (variantId: string, quantity: number = 1) => {
    try {
      let cartId = getCartId();

      // Create cart if it doesn't exist
      if (!cartId) {
        const createResult = await createCartMutation.mutateAsync();
        if (!createResult.success || !createResult.data) {
          throw new Error(createResult.message);
        }
        cartId = createResult.data.id;
      }

      // Add item to cart
      await addToCartMutation.mutateAsync({
        cartId,
        items: [{ merchandiseId: variantId, quantity }],
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const removeFromCartMutation = useMutation({
    mutationFn: ({ cartId, lineIds }: { cartId: string; lineIds: string[] }) =>
      removeFromCart(cartId, lineIds),
    onSuccess: (data, variables) => {
      if (data.success && data.data) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.cart(variables.cartId),
          data.data
        );
        queryClient.invalidateQueries({
          queryKey: CART_QUERY_KEYS.cart(variables.cartId),
        });
      }
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: ({
      cartId,
      lines,
    }: {
      cartId: string;
      lines: Array<{ id: string; quantity: number }>;
    }) => updateCartLine(cartId, lines),
    onSuccess: (data, variables) => {
      if (data.success && data.data) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.cart(variables.cartId),
          data.data
        );
        queryClient.invalidateQueries({
          queryKey: CART_QUERY_KEYS.cart(variables.cartId),
        });
      }
    },
  });

  // Remove from cart function
  const handleRemoveFromCart = async (lineId: string) => {
    const cartId = getCartId();
    if (!cartId) return;

    try {
      await removeFromCartMutation.mutateAsync({ cartId, lineIds: [lineId] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Update cart item quantity
  const handleUpdateCartItem = async (lineId: string, quantity: number) => {
    const cartId = getCartId();
    if (!cartId) return;

    try {
      await updateCartMutation.mutateAsync({
        cartId,
        lines: [{ id: lineId, quantity }],
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Get total items in cart
  const getTotalItems = () => {
    if (!state.cart) return 0;
    return state.cart.lines.edges.reduce(
      (total, edge) => total + edge.node.quantity,
      0
    );
  };

  // Get total price
  const getTotalPrice = () => {
    if (!state.cart) return '0.00';
    return state.cart.cost.totalAmount.amount;
  };

  // Clear cart
  const clearCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shopify-cart-id');
    }
    dispatch({ type: 'CLEAR_CART' });
  };

  // Convert cart lines to simplified cart items
  const cartItems =
    state.cart?.lines.edges.map((edge) => ({
      id: edge.node.id,
      variantId: edge.node.merchandise.id,
      productId: edge.node.merchandise.product.handle, // Using handle as productId for simplicity
      title: edge.node.merchandise.title,
      productTitle: edge.node.merchandise.product.title,
      handle: edge.node.merchandise.product.handle,
      quantity: edge.node.quantity,
      price: edge.node.merchandise.price,
      image: edge.node.merchandise.product.images.edges[0]?.node,
    })) || [];

  // Combine loading states from TanStack Query mutations
  const isLoading =
    state.isLoading ||
    createCartMutation.isPending ||
    addToCartMutation.isPending ||
    removeFromCartMutation.isPending ||
    updateCartMutation.isPending;

  const value: CartContextType = {
    cart: state.cart,
    cartItems,
    isLoading,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateCartItem: handleUpdateCartItem,
    getTotalItems,
    getTotalPrice,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
