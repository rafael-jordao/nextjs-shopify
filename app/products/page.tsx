import Header from '../../components/Header';
import ProductGrid from '../../components/ProductGrid';
import { getProducts } from '../../lib/shopify/products';

export const metadata = {
  title: 'All Products | ShopifyStore',
  description: 'Browse our complete collection of products',
};

export default async function ProductsPage() {
  const products = await getProducts(24); // Get more products for the products page

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            All Products
          </h1>
          <p className="text-lg text-gray-600">
            Discover our complete collection of premium products
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="mb-6 text-sm text-gray-500">
              Showing {products.length} products
            </div>
            <ProductGrid products={products} />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 mb-8">
              <svg
                className="w-full h-full text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Products Available
            </h2>
            <p className="text-gray-600 mb-8">
              We&apos;re currently updating our inventory. Please check back
              soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
