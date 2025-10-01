'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';
import { useCart } from '@/contexts/CartContext';
import { formatMoney } from '@/utils/helpers';
import MediaViewer from './MediaViewer';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import WishlistButton from './WishlistButton';

interface ProductDetailsProps {
  product: ShopifyProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart, isLoading } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(
    product.variants.edges[0]?.node
  );
  const [quantity, setQuantity] = useState(1);

  // Get media from product (includes images, videos, 3D models)
  const media = product.media?.edges?.map((edge) => edge.node) || [];
  // Fallback to images if no media available
  const images = product.images.edges.map((edge) => edge.node);
  const variants = product.variants.edges.map((edge) => edge.node);

  // Convert images to media format for compatibility
  const mediaFromImages = images.map((image) => ({
    id: image.id || image.url,
    mediaContentType: 'IMAGE' as const,
    image: image,
  }));

  // Use variant image if available, otherwise use product media/images
  let displayMedia = media.length > 0 ? media : mediaFromImages;

  // If selected variant has a specific image, prioritize it
  if (selectedVariant?.image) {
    const variantMedia = {
      id: selectedVariant.image.id || selectedVariant.image.url,
      mediaContentType: 'IMAGE' as const,
      image: selectedVariant.image,
    };
    // Put variant image first, followed by other media
    displayMedia = [
      variantMedia,
      ...displayMedia.filter(
        (m) => m.image?.url !== selectedVariant.image?.url
      ),
    ];
  }

  console.log('Selected Variant:', selectedVariant.image);

  const handleAddToCart = async () => {
    if (selectedVariant && selectedVariant.availableForSale) {
      try {
        await addToCart(selectedVariant.id, quantity);
        toast.success(`${product.title} added to cart!`);
      } catch (error) {
        toast.error('Error adding product to cart');
      }
    }
  };

  const handleVariantChange = (variant: ShopifyProductVariant) => {
    setSelectedVariant(variant);
    // Reset quantity to 1 when variant changes
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Product Media (Images, Videos, 3D Models) */}
        <div>
          <MediaViewer media={displayMedia} className="w-full" />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">
                {product.title}
              </h1>
              <WishlistButton product={product} size="lg" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {formatMoney(
                selectedVariant?.price || product.priceRange.minVariantPrice
              )}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h3>
            <div
              className="text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Variants */}
          {variants.length > 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Options
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {variants.map((variant) => (
                  <Button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    disabled={!variant.availableForSale}
                    variant={
                      selectedVariant?.id === variant.id ? 'default' : 'outline'
                    }
                    className="p-3 h-auto flex flex-col items-center justify-center"
                  >
                    <span className="text-sm font-medium">{variant.title}</span>
                    {!variant.availableForSale && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Unavailable
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label
              htmlFor="quantity"
              className="block text-lg font-medium text-gray-900 mb-2"
            >
              Quantity
              {selectedVariant?.quantityAvailable && (
                <span className="text-sm text-gray-500 ml-2">
                  ({selectedVariant.quantityAvailable} available)
                </span>
              )}
            </label>
            <Select
              value={quantity.toString()}
              onValueChange={(value) => setQuantity(Number(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ...Array(
                    Math.min(selectedVariant?.quantityAvailable || 10, 10)
                  ),
                ].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale || isLoading}
              className="w-full py-6 text-lg font-medium"
              size="lg"
            >
              {isLoading
                ? 'Adding to Cart...'
                : selectedVariant?.availableForSale
                ? 'Add to Cart'
                : 'Unavailable'}
            </Button>

            {/* Product Details */}
            <div className="border-t pt-6 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">SKU</span>
                <span className="font-medium">
                  {selectedVariant?.id.split('/').pop()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Availability</span>
                <Badge
                  variant={
                    selectedVariant?.availableForSale ? 'default' : 'secondary'
                  }
                  className={
                    selectedVariant?.availableForSale
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {selectedVariant?.availableForSale
                    ? 'In Stock'
                    : 'Unavailable'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
