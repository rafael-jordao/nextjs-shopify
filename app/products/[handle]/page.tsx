import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import ProductDetails from '../../../components/ProductDetails';
import { getProduct, getProducts } from '../../../lib/shopify/products';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.title} | ShopifyStore`,
    description: product.description || `Buy ${product.title} at our store`,
    openGraph: {
      title: product.title,
      description: product.description || `Buy ${product.title} at our store`,
      images: product.images.edges.map((edge) => ({
        url: edge.node.url,
        width: edge.node.width,
        height: edge.node.height,
        alt: edge.node.altText || product.title,
      })),
    },
  };
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  try {
    const products = await getProducts(50); // Get first 50 products
    return products.map((product) => ({
      handle: product.handle,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <svg
                className="w-4 h-4 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{product.title}</span>
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <ProductDetails product={product} />

        {/* Back to Products Link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
