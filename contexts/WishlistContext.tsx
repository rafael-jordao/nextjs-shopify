'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeLocalStorage } from '../hooks/useLocalStorage';
import { ShopifyProduct } from '@/types/shopify';

interface WishlistContextType {
  wishlist: ShopifyProduct[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: ShopifyProduct) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: ShopifyProduct) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const WISHLIST_STORAGE_KEY = 'shopify-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<ShopifyProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = safeLocalStorage.getJSON<ShopifyProduct[]>(
        WISHLIST_STORAGE_KEY,
        []
      );
      if (savedWishlist && Array.isArray(savedWishlist)) {
        setWishlist(savedWishlist);
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        safeLocalStorage.setJSON(WISHLIST_STORAGE_KEY, wishlist);
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((product) => product.id === productId);
  };

  const addToWishlist = (product: ShopifyProduct) => {
    setWishlist((current) => {
      // Avoid duplicates
      if (current.some((item) => item.id === product.id)) {
        return current;
      }
      return [...current, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((current) =>
      current.filter((product) => product.id !== productId)
    );
  };

  const toggleWishlist = (product: ShopifyProduct) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const wishlistCount = wishlist.length;

  const value: WishlistContextType = {
    wishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
