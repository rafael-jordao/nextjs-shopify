import { shopifyFetch } from './client';
import { GET_PRODUCTS, GET_PRODUCT } from './queries/products';
import { ShopifyProduct, ShopifyResponse } from '../../types/shopify';

// Fetch all products with revalidation
export async function getProducts(
  first: number = 12,
  revalidate: number = 60
): Promise<ShopifyResponse<ShopifyProduct[]>> {
  try {
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

    const products = data.products.edges.map((edge) => edge.node);

    return {
      success: true,
      message: 'Produtos carregados com sucesso',
      data: products,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao carregar produtos',
    };
  }
}

// Fetch single product by handle with revalidation
export async function getProduct(
  handle: string,
  revalidate: number = 60
): Promise<ShopifyResponse<ShopifyProduct | null>> {
  try {
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

    if (!data.productByHandle) {
      return {
        success: false,
        message: 'Produto não encontrado',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Produto carregado com sucesso',
      data: data.productByHandle,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao carregar produto',
      data: null,
    };
  }
}
