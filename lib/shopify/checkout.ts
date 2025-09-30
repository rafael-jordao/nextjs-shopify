import { shopifyFetch } from './client';
import {
  CREATE_CHECKOUT,
  UPDATE_CHECKOUT_SHIPPING_ADDRESS,
  UPDATE_CHECKOUT_EMAIL,
  UPDATE_CHECKOUT_SHIPPING_LINE,
  GET_CHECKOUT,
} from './queries/checkout';
import { ShopifyResponse } from '../../types/shopify';

// Types para checkout
export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
}

export interface ShopifyCheckout {
  id: string;
  webUrl: string;
  email?: string;
  subtotalPriceV2: {
    amount: string;
    currencyCode: string;
  };
  totalTaxV2: {
    amount: string;
    currencyCode: string;
  };
  totalPriceV2: {
    amount: string;
    currencyCode: string;
  };
  shippingAddress?: ShippingAddress;
  shippingLine?: {
    handle: string;
    title: string;
    priceV2: {
      amount: string;
      currencyCode: string;
    };
  };
  availableShippingRates?: {
    ready: boolean;
    shippingRates: Array<{
      handle: string;
      title: string;
      priceV2: {
        amount: string;
        currencyCode: string;
      };
    }>;
  };
  lineItems: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        quantity: number;
        variant: {
          id: string;
          title: string;
          price: string;
          priceV2: {
            amount: string;
            currencyCode: string;
          };
          product: {
            id: string;
            handle: string;
            title: string;
          };
          image?: {
            url: string;
            altText: string;
          };
        };
      };
    }>;
  };
}

// Criar checkout com itens do carrinho
export async function createCheckout(
  lineItems: CheckoutLineItem[]
): Promise<ShopifyResponse<ShopifyCheckout>> {
  try {
    const data = await shopifyFetch<{
      checkoutCreate: {
        checkout: ShopifyCheckout;
        checkoutUserErrors: Array<{ field: string; message: string }>;
      };
    }>(CREATE_CHECKOUT, {
      input: {
        lineItems: lineItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      },
    });

    if (data.checkoutCreate.checkoutUserErrors.length > 0) {
      return {
        success: false,
        message: data.checkoutCreate.checkoutUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Checkout criado com sucesso',
      data: data.checkoutCreate.checkout,
    };
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    return {
      success: false,
      message: 'Erro ao criar checkout',
    };
  }
}

// Atualizar endereço de entrega
export async function updateCheckoutShippingAddress(
  checkoutId: string,
  shippingAddress: ShippingAddress
): Promise<ShopifyResponse<ShopifyCheckout>> {
  try {
    const data = await shopifyFetch<{
      checkoutShippingAddressUpdateV2: {
        checkout: ShopifyCheckout;
        checkoutUserErrors: Array<{ field: string; message: string }>;
      };
    }>(UPDATE_CHECKOUT_SHIPPING_ADDRESS, {
      checkoutId,
      shippingAddress,
    });

    if (data.checkoutShippingAddressUpdateV2.checkoutUserErrors.length > 0) {
      return {
        success: false,
        message:
          data.checkoutShippingAddressUpdateV2.checkoutUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Endereço atualizado com sucesso',
      data: data.checkoutShippingAddressUpdateV2.checkout,
    };
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    return {
      success: false,
      message: 'Erro ao atualizar endereço',
    };
  }
}

// Atualizar email do checkout
export async function updateCheckoutEmail(
  checkoutId: string,
  email: string
): Promise<ShopifyResponse<ShopifyCheckout>> {
  try {
    const data = await shopifyFetch<{
      checkoutEmailUpdateV2: {
        checkout: ShopifyCheckout;
        checkoutUserErrors: Array<{ field: string; message: string }>;
      };
    }>(UPDATE_CHECKOUT_EMAIL, {
      checkoutId,
      email,
    });

    if (data.checkoutEmailUpdateV2.checkoutUserErrors.length > 0) {
      return {
        success: false,
        message: data.checkoutEmailUpdateV2.checkoutUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Email atualizado com sucesso',
      data: data.checkoutEmailUpdateV2.checkout,
    };
  } catch (error) {
    console.error('Erro ao atualizar email:', error);
    return {
      success: false,
      message: 'Erro ao atualizar email',
    };
  }
}

// Selecionar método de entrega
export async function updateCheckoutShippingLine(
  checkoutId: string,
  shippingRateHandle: string
): Promise<ShopifyResponse<ShopifyCheckout>> {
  try {
    const data = await shopifyFetch<{
      checkoutShippingLineUpdate: {
        checkout: ShopifyCheckout;
        checkoutUserErrors: Array<{ field: string; message: string }>;
      };
    }>(UPDATE_CHECKOUT_SHIPPING_LINE, {
      checkoutId,
      shippingRateHandle,
    });

    if (data.checkoutShippingLineUpdate.checkoutUserErrors.length > 0) {
      return {
        success: false,
        message: data.checkoutShippingLineUpdate.checkoutUserErrors[0].message,
      };
    }

    return {
      success: true,
      message: 'Método de entrega selecionado',
      data: data.checkoutShippingLineUpdate.checkout,
    };
  } catch (error) {
    console.error('Erro ao selecionar entrega:', error);
    return {
      success: false,
      message: 'Erro ao selecionar método de entrega',
    };
  }
}

// Buscar checkout por ID
export async function getCheckout(
  checkoutId: string
): Promise<ShopifyResponse<ShopifyCheckout | null>> {
  try {
    const data = await shopifyFetch<{ node: ShopifyCheckout | null }>(
      GET_CHECKOUT,
      { id: checkoutId },
      {
        cache: 'no-store',
        next: { revalidate: false },
      }
    );

    return {
      success: true,
      message: 'Checkout carregado com sucesso',
      data: data.node,
    };
  } catch (error) {
    console.error('Erro ao carregar checkout:', error);
    return {
      success: false,
      message: 'Erro ao carregar checkout',
      data: null,
    };
  }
}
