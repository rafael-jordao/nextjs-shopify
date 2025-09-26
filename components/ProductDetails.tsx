'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';
import { useCart } from '@/contexts/CartContext';
import { formatMoney } from '@/lib/shopify';

interface ProductDetailsProps {
  product: ShopifyProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart, isLoading } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(
    product.variants.edges[0]?.node
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = product.images.edges.map((edge) => edge.node);
  const variants = product.variants.edges.map((edge) => edge.node);

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
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
            {images[selectedImageIndex] ? (
              <Image
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].altText || product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-24 h-24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square relative bg-gray-100 rounded-md overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? 'border-black'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || `${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          )}
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
