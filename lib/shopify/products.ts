import { shopifyFetch } from './client';
import { GET_PRODUCTS, GET_PRODUCT } from './queries/products';
import { ShopifyProduct } from '../../types/shopify';

// Fetch all products
export async function getProducts(first: number = 12) {
  const data = await shopifyFetch<{
    products: { edges: Array<{ node: ShopifyProduct }> };
  }>(GET_PRODUCTS, { first });

  return data.products.edges.map((edge) => edge.node);
}

// Fetch single product by handle
export async function getProduct(handle: string) {
  const data = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>(
    GET_PRODUCT,
    { handle }
  );

  return data.productByHandle;
}

// Get product URL
export function getProductUrl(handle: string) {
  return `/products/${handle}`;
}
