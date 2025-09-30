'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { ShopifyProduct } from '@/types/shopify';
import { toast } from 'sonner';

interface WishlistButtonProps {
  product: ShopifyProduct;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showToast?: boolean;
}

export default function WishlistButton({
  product,
  size = 'default',
  className = '',
  showToast = true,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorited = isInWishlist(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);

    if (showToast) {
      if (isFavorited) {
        toast.success('Removed from wishlist');
      } else {
        toast.success('Added to wishlist');
      }
    }
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <Button
      variant="ghost"
      size={size === 'default' ? 'sm' : size}
      onClick={handleToggle}
      className={cn(
        'rounded-full transition-all duration-200 hover:scale-110',
        'bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md',
        'border border-gray-200 hover:border-gray-300',
        className
      )}
      title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isFavorited ? (
        // Filled heart
        <svg
          className={cn(iconSizes[size], 'text-red-500')}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        // Outline heart
        <svg
          className={cn(iconSizes[size], 'text-gray-600 hover:text-red-500')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </Button>
  );
}
