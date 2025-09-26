'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
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

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCartId = localStorage.getItem('shopify-cart-id');
        if (savedCartId) {
          dispatch({ type: 'SET_LOADING', payload: true });
          const cart = await getCart(savedCartId);
          if (cart) {
            dispatch({ type: 'SET_CART', payload: cart });
          } else {
            // Cart not found, clear localStorage
            localStorage.removeItem('shopify-cart-id');
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('shopify-cart-id');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCart();
  }, []);

  // Add to cart function
  const handleAddToCart = async (variantId: string, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      let cart = state.cart;

      // Create cart if it doesn't exist
      if (!cart) {
        cart = await createCart();
        localStorage.setItem('shopify-cart-id', cart.id);
      }

      // Add item to cart
      const updatedCart = await addToCart(cart.id, [
        { merchandiseId: variantId, quantity },
      ]);

      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Remove from cart function
  const handleRemoveFromCart = async (lineId: string) => {
    try {
      if (!state.cart) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCart = await removeFromCart(state.cart.id, [lineId]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Update cart item quantity
  const handleUpdateCartItem = async (lineId: string, quantity: number) => {
    try {
      if (!state.cart) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCart = await updateCartLine(state.cart.id, [
        { id: lineId, quantity },
      ]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update cart item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
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
    localStorage.removeItem('shopify-cart-id');
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

  const value: CartContextType = {
    cart: state.cart,
    cartItems,
    isLoading: state.isLoading,
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
