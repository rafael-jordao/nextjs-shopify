import { revalidateTag, revalidatePath } from 'next/cache';

// Functions to revalidate specific data

export async function revalidateProducts() {
  'use server';
  revalidateTag('products');
  revalidatePath('/');
}

export async function revalidateProduct(handle: string) {
  'use server';
  revalidateTag('product');
  revalidateTag(`product-${handle}`);
  revalidatePath(`/products/${handle}`);
}

export async function revalidateAllProducts() {
  'use server';
  revalidateTag('products');
  revalidateTag('product');
  revalidatePath('/', 'layout');
}

// Webhook handler for Shopify to trigger revalidation
export async function handleShopifyWebhook(
  eventType: string,
  productHandle?: string
) {
  'use server';

  switch (eventType) {
    case 'products/create':
    case 'products/update':
      if (productHandle) {
        await revalidateProduct(productHandle);
      }
      await revalidateProducts();
      break;

    case 'products/delete':
      await revalidateProducts();
      break;

    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }
}
