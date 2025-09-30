'use client';

import { useWishlist } from '@/contexts/WishlistContext';
import ProductGrid from './ProductGrid';
import EmptyState from './EmptyState';
import { Button } from './ui/button';
import Link from 'next/link';

export default function WishlistContent() {
  const { wishlist, wishlistCount, clearWishlist } = useWishlist();

  if (wishlistCount === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save products you love to your wishlist and find them here later."
        icon={
          <svg
            className="w-16 h-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        }
        action={
          <Button asChild>
            <Link href="/products">Explore Products</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Wishlist Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {wishlistCount} product{wishlistCount !== 1 ? 's' : ''} in your
          wishlist
        </p>
        {wishlistCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearWishlist}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid products={wishlist} />
    </div>
  );
}
