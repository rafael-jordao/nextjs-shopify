'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShopifyProduct } from '../types/shopify';
import {
  formatMoney,
  getProductImage,
  getProductVariant,
} from '../lib/shopify/client';
import { useCart } from '../contexts/CartContext';

interface ProductGridProps {
  products: ShopifyProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = getProductVariant(product);
    if (variant && variant.availableForSale) {
      await addToCart(variant.id);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const image = getProductImage(product);
        const variant = getProductVariant(product);

        return (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <Link href={`/products/${product.handle}`}>
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText || product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
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
            </Link>

            <div className="p-4">
              <Link href={`/products/${product.handle}`}>
                <h3 className="font-medium text-gray-900 mb-2 hover:text-gray-700 line-clamp-2">
                  {product.title}
                </h3>
              </Link>

              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {formatMoney(product.priceRange.minVariantPrice)}
                </span>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!variant?.availableForSale}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    variant?.availableForSale
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {variant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
