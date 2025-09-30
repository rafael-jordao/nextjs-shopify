'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ShopifyProduct } from '../types/shopify';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  products: ShopifyProduct[];
  onFilteredProducts: (filteredProducts: ShopifyProduct[]) => void;
  className?: string;
}

interface FilterState {
  search: string;
  priceRange: 'all' | 'under-50' | '50-100' | '100-200' | 'over-200';
  sortBy:
    | 'relevance'
    | 'price-low-high'
    | 'price-high-low'
    | 'newest'
    | 'name-a-z'
    | 'name-z-a';
  availability: 'all' | 'available' | 'out-of-stock';
}

export default function ProductFilters({
  products,
  onFilteredProducts,
  className = '',
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priceRange: 'all',
    sortBy: 'relevance',
    availability: 'all',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters whenever filters or products change
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        switch (filters.priceRange) {
          case 'under-50':
            return price < 50;
          case '50-100':
            return price >= 50 && price <= 100;
          case '100-200':
            return price > 100 && price <= 200;
          case 'over-200':
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter((product) => {
        const isAvailable = product.variants.edges.some(
          (variant) => variant.node.availableForSale
        );
        return filters.availability === 'available'
          ? isAvailable
          : !isAvailable;
      });
    }

    // Sort products
    if (filters.sortBy !== 'relevance') {
      filtered.sort((a, b) => {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount);

        switch (filters.sortBy) {
          case 'price-low-high':
            return priceA - priceB;
          case 'price-high-low':
            return priceB - priceA;
          case 'name-a-z':
            return a.title.localeCompare(b.title);
          case 'name-z-a':
            return b.title.localeCompare(a.title);
          case 'newest':
            return a.id.localeCompare(b.id);
          default:
            return 0;
        }
      });
    }

    onFilteredProducts(filtered);
  }, [filters, products, onFilteredProducts]);

  const clearFilters = () => {
    setFilters({
      search: '',
      priceRange: 'all',
      sortBy: 'relevance',
      availability: 'all',
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search.trim() !== '' ||
      filters.priceRange !== 'all' ||
      filters.sortBy !== 'relevance' ||
      filters.availability !== 'all'
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search.trim() !== '') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.sortBy !== 'relevance') count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  return (
    <div>
      <div className="">
        {/* Main Search Bar - Always Visible */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort By - Always Visible */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Ordenar por:
              </span>
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value as any }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevância</SelectItem>
                  <SelectItem value="price-low-high">Menor Preço</SelectItem>
                  <SelectItem value="price-high-low">Maior Preço</SelectItem>
                  <SelectItem value="name-a-z">Nome A-Z</SelectItem>
                  <SelectItem value="name-z-a">Nome Z-A</SelectItem>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              Filtros
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
              {isExpanded ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Faixa de Preço
                </label>
                <Select
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os preços</SelectItem>
                    <SelectItem value="under-50">Até $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-200">$100 - $200</SelectItem>
                    <SelectItem value="over-200">Acima de $200</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Disponibilidade
                </label>
                <Select
                  value={filters.availability}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      availability: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="available">Em Estoque</SelectItem>
                    <SelectItem value="out-of-stock">
                      Fora de Estoque
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                {hasActiveFilters() && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
