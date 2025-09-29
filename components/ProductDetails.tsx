'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';
import { useCart } from '@/contexts/CartContext';
import { formatMoney } from '@/lib/shopify';
import MediaViewer from './MediaViewer';

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

  // Use media if available, otherwise use converted images
  const displayMedia = media.length > 0 ? media : mediaFromImages;

  const handleAddToCart = async () => {
    if (selectedVariant && selectedVariant.availableForSale) {
      await addToCart(selectedVariant.id, quantity);
    }
  };

  const handleVariantChange = (variant: ShopifyProductVariant) => {
    setSelectedVariant(variant);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>
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
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    disabled={!variant.availableForSale}
                    className={`p-3 text-sm font-medium rounded-md border transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-black bg-black text-white'
                        : variant.availableForSale
                        ? 'border-gray-300 text-gray-900 hover:border-gray-400'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {variant.title}
                    {!variant.availableForSale && (
                      <span className="block text-xs">Out of Stock</span>
                    )}
                  </button>
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
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale || isLoading}
              className={`w-full py-4 px-6 text-lg font-medium rounded-md transition-colors ${
                selectedVariant?.availableForSale && !isLoading
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading
                ? 'Adding to Cart...'
                : selectedVariant?.availableForSale
                ? 'Add to Cart'
                : 'Out of Stock'}
            </button>

            {/* Product Details */}
            <div className="border-t pt-6 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>SKU</span>
                <span>{selectedVariant?.id.split('/').pop()}</span>
              </div>
              <div className="flex justify-between">
                <span>Availability</span>
                <span
                  className={
                    selectedVariant?.availableForSale
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {selectedVariant?.availableForSale
                    ? 'In Stock'
                    : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
