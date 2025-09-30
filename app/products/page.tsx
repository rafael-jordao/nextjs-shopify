import Header from '../../components/Header';
import ProductsWithFilters from '../../components/ProductsWithFilters';
import EmptyState from '../../components/EmptyState';
import { getProducts } from '../../lib/shopify/products';
import { Button } from '../../components/ui/button';

export const metadata = {
  title: 'All Products | ShopifyStore',
  description: 'Browse our complete collection of products',
};

export default async function ProductsPage() {
  const productsResponse = await getProducts(24); // Get more products for the products page
  const products = productsResponse.success ? productsResponse.data || [] : [];

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

        {/* Products with Filters or Empty State */}
        {products.length > 0 ? (
          <ProductsWithFilters products={products} />
        ) : (
          <EmptyState
            title="No Products Available"
            description="We're currently updating our inventory. Please check back soon!"
            action={
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        )}
      </main>
    </div>
  );
}
