'use client';

import { ShopifyProduct } from '../types/shopify';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ShopifyProduct[];
  className?: string;
}

export default function ProductGrid({
  products,
  className = '',
}: ProductGridProps) {
  return (
    <div className={`flex flex-row flex-wrap gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
