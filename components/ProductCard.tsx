'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShopifyProduct } from '../types/shopify';
import {
  formatMoney,
  getProductImage,
  getProductVariant,
} from '@/utils/helpers';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ShopifyProduct;
  className?: string;
}

export default function ProductCard({
  product,
  className = '',
}: ProductCardProps) {
  const { addToCart } = useCart();
  const image = getProductImage(product);
  const variant = getProductVariant(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (variant && variant.availableForSale) {
      try {
        await addToCart(variant.id);
        toast.success(`${product.title} adicionado ao carrinho!`);
      } catch (error) {
        toast.error('Erro ao adicionar produto ao carrinho');
      }
    } else {
      toast.error('Produto indisponível');
    }
  };

  return (
    <Card
      className={`group w-full sm:max-w-[20rem] hover:shadow-lg  transition-shadow overflow-hidden ${className}`}
    >
      {/* Imagem do produto - sem padding para encostar no topo */}
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Badge para indicar se está esgotado */}
          {!variant?.availableForSale && (
            <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white">
              Esgotado
            </Badge>
          )}
        </div>
      </Link>

      {/* Conteúdo do card */}
      <CardContent className="p-4">
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

          <Button
            onClick={handleAddToCart}
            disabled={!variant?.availableForSale}
            size="sm"
            variant={variant?.availableForSale ? 'default' : 'secondary'}
          >
            {variant?.availableForSale ? 'Adicionar' : 'Esgotado'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
