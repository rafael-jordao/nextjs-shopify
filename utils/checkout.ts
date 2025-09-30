/**
 * Utility functions for Shopify Checkout URL pre-population
 *
 * O Shopify aceita parâmetros na URL de checkout para pre-popular dados do cliente.
 * Esta função ajuda a construir URLs de checkout com dados pre-populados.
 */

export interface CheckoutData {
  email: string;
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

/**
 * Constrói URL de checkout do Shopify com dados pre-populados
 *
 * @param baseCheckoutUrl - URL base do checkout (cart.checkoutUrl)
 * @param data - Dados do cliente para pre-popular
 * @returns URL completa com parâmetros de pre-população
 *
 * @example
 * ```typescript
 * const prePopulatedUrl = buildShopifyCheckoutUrl(cart.checkoutUrl, {
 *   email: 'cliente@email.com',
 *   firstName: 'João',
 *   lastName: 'Silva',
 *   address1: 'Rua das Flores, 123',
 *   city: 'São Paulo',
 *   province: 'SP',
 *   country: 'BR',
 *   zip: '01234-567'
 * });
 * ```
 */
export function buildShopifyCheckoutUrl(
  baseCheckoutUrl: string,
  data: CheckoutData
): string {
  try {
    const checkoutUrl = new URL(baseCheckoutUrl);
    const params = new URLSearchParams();

    // Dados de contato
    params.append('checkout[email]', data.email);

    // Dados de entrega (shipping address)
    if (data.firstName)
      params.append('checkout[shipping_address][first_name]', data.firstName);
    if (data.lastName)
      params.append('checkout[shipping_address][last_name]', data.lastName);
    if (data.address1)
      params.append('checkout[shipping_address][address1]', data.address1);
    if (data.address2)
      params.append('checkout[shipping_address][address2]', data.address2);
    if (data.city) params.append('checkout[shipping_address][city]', data.city);
    if (data.province)
      params.append('checkout[shipping_address][province]', data.province);
    if (data.country)
      params.append('checkout[shipping_address][country]', data.country);
    if (data.zip) params.append('checkout[shipping_address][zip]', data.zip);
    if (data.phone)
      params.append('checkout[shipping_address][phone]', data.phone);

    // Dados de cobrança (billing address) - geralmente igual ao shipping
    if (data.firstName)
      params.append('checkout[billing_address][first_name]', data.firstName);
    if (data.lastName)
      params.append('checkout[billing_address][last_name]', data.lastName);
    if (data.address1)
      params.append('checkout[billing_address][address1]', data.address1);
    if (data.address2)
      params.append('checkout[billing_address][address2]', data.address2);
    if (data.city) params.append('checkout[billing_address][city]', data.city);
    if (data.province)
      params.append('checkout[billing_address][province]', data.province);
    if (data.country)
      params.append('checkout[billing_address][country]', data.country);
    if (data.zip) params.append('checkout[billing_address][zip]', data.zip);
    if (data.phone)
      params.append('checkout[billing_address][phone]', data.phone);

    // Construir URL final
    return `${checkoutUrl.origin}${checkoutUrl.pathname}?${params.toString()}`;
  } catch (error) {
    console.error('Erro ao construir URL de checkout:', error);
    // Fallback: retorna URL original se houver erro
    return baseCheckoutUrl;
  }
}

/**
 * Parâmetros aceitos pelo Shopify Checkout (para referência)
 *
 * Dados de contato:
 * - checkout[email]
 *
 * Endereço de entrega:
 * - checkout[shipping_address][first_name]
 * - checkout[shipping_address][last_name]
 * - checkout[shipping_address][address1]
 * - checkout[shipping_address][address2]
 * - checkout[shipping_address][city]
 * - checkout[shipping_address][province]
 * - checkout[shipping_address][country]
 * - checkout[shipping_address][zip]
 * - checkout[shipping_address][phone]
 *
 * Endereço de cobrança:
 * - checkout[billing_address][first_name]
 * - checkout[billing_address][last_name]
 * - checkout[billing_address][address1]
 * - checkout[billing_address][address2]
 * - checkout[billing_address][city]
 * - checkout[billing_address][province]
 * - checkout[billing_address][country]
 * - checkout[billing_address][zip]
 * - checkout[billing_address][phone]
 *
 * Outros parâmetros opcionais:
 * - checkout[attributes][custom_field] (para campos customizados)
 * - discount_code (código de desconto)
 */
