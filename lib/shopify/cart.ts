import { shopifyFetch } from './client';
import {
  CREATE_CART,
  ADD_TO_CART,
  UPDATE_CART,
  REMOVE_FROM_CART,
  GET_CART,
} from './queries/cart';
import { ShopifyCart, ShopifyResponse } from '../../types/shopify';

// Create a new cart
export async function createCart(): Promise<ShopifyResponse<ShopifyCart>> {
  try {
    const data = await shopifyFetch<{
      cartCreate: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>(CREATE_CART, {
      input: {},
    });

    if (data.cartCreate.userErrors.length > 0) {
      return {
        success: false,
        message: data.cartCreate.userErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Carrinho criado com sucesso',
      data: data.cartCreate.cart,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao criar carrinho',
    };
  }
}

// Add items to cart
export async function addToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<ShopifyResponse<ShopifyCart>> {
  try {
    const data = await shopifyFetch<{
      cartLinesAdd: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>(ADD_TO_CART, {
      cartId,
      lines,
    });

    if (data.cartLinesAdd.userErrors.length > 0) {
      return {
        success: false,
        message: data.cartLinesAdd.userErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Item adicionado ao carrinho',
      data: data.cartLinesAdd.cart,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao adicionar item ao carrinho',
    };
  }
}

// Update cart line item quantity
export async function updateCartLine(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<ShopifyResponse<ShopifyCart>> {
  try {
    const data = await shopifyFetch<{
      cartLinesUpdate: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>(UPDATE_CART, {
      cartId,
      lines,
    });

    if (data.cartLinesUpdate.userErrors.length > 0) {
      return {
        success: false,
        message: data.cartLinesUpdate.userErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Carrinho atualizado',
      data: data.cartLinesUpdate.cart,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao atualizar carrinho',
    };
  }
}

// Remove items from cart
export async function removeFromCart(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyResponse<ShopifyCart>> {
  try {
    const data = await shopifyFetch<{
      cartLinesRemove: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>(REMOVE_FROM_CART, {
      cartId,
      lineIds,
    });

    if (data.cartLinesRemove.userErrors.length > 0) {
      return {
        success: false,
        message: data.cartLinesRemove.userErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Item removido do carrinho',
      data: data.cartLinesRemove.cart,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao remover item do carrinho',
    };
  }
}

// Get cart by ID
export async function getCart(
  cartId: string,
): Promise<ShopifyResponse<ShopifyCart | null>> {
  try {
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>(
      GET_CART,
      { cartId },
      {
        cache: 'no-store', // Never cache cart data as it's user-specific
        next: { revalidate: false },
      },
    );

    return {
      success: true,
      message: 'Carrinho carregado com sucesso',
      data: data.cart,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao carregar carrinho',
      data: null,
    };
  }
}
