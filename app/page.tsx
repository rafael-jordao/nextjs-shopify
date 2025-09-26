import ProductGrid from '@/components/ProductGrid';
import Header from '../components/Header';

import { getProducts } from '../lib/shopify/products';

export default async function Home() {
  const products = await getProducts(12);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <div className="relative bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Modern E-commerce</span>
                <span className="block text-gray-600">
                  Built with Next.js & Shopify
                </span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500">
                Discover our curated collection of products. Fast, secure, and
                built with modern web technologies.
              </p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Explore our latest collection of premium products
            </p>
          </div>
          <ProductGrid products={products} />
        </div>
      </main>
    </div>
  );
}
