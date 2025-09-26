import { shopifyFetch } from './client';
import { GET_PRODUCTS, GET_PRODUCT } from './queries/products';
import { ShopifyProduct } from '../../types/shopify';

// Fetch all products with revalidation
export async function getProducts(
  first: number = 12,
  revalidate: number = 300
) {
  const data = await shopifyFetch<{
    products: { edges: Array<{ node: ShopifyProduct }> };
  }>(
    GET_PRODUCTS,
    { first },
    {
      next: {
        revalidate, // Revalidate every 5 minutes by default
        tags: ['products'],
      },
    }
  );

  return data.products.edges.map((edge) => edge.node);
}

// Fetch single product by handle with revalidation
export async function getProduct(handle: string, revalidate: number = 60) {
  const data = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>(
    GET_PRODUCT,
    { handle },
    {
      next: {
        revalidate, // Revalidate every minute by default
        tags: ['product', `product-${handle}`],
      },
    }
  );

  return data.productByHandle;
}

// Get product URL
export function getProductUrl(handle: string) {
  return `/products/${handle}`;
}
