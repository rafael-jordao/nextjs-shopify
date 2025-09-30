'use client';

import { useState } from 'react';
import { ShopifyProduct } from '../types/shopify';
import ProductGrid from './ProductGrid';
import ProductFilters from './ProductFilters';
import EmptyState from './EmptyState';

interface ProductsWithFiltersProps {
  products: ShopifyProduct[];
  className?: string;
}

export default function ProductsWithFilters({
  products,
  className = '',
}: ProductsWithFiltersProps) {
  const [filteredProducts, setFilteredProducts] =
    useState<ShopifyProduct[]>(products);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters Bar - Top */}
      <ProductFilters
        products={products}
        onFilteredProducts={setFilteredProducts}
      />

      {/* Main Content */}
      <main>
        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredProducts.length === products.length
              ? `Mostrando ${products.length} produto${
                  products.length !== 1 ? 's' : ''
                }`
              : `Mostrando ${filteredProducts.length} de ${
                  products.length
                } produto${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Products Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <EmptyState
            title="Nenhum produto encontrado"
            description="Tente ajustar os filtros para encontrar o que você está procurando."
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        )}
      </main>
    </div>
  );
}
