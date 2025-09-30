// Shopify GraphQL API Types

export interface ShopifyImage {
  id?: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ShopifyVideo {
  id: string;
  sources: Array<{
    url: string;
    mimeType: string;
  }>;
}

export interface ShopifyModel3d {
  id: string;
  sources: Array<{
    url: string;
    mimeType: string;
  }>;
}

export interface ShopifyExternalVideo {
  id: string;
  host: 'YOUTUBE' | 'VIMEO';
  originUrl: string;
}

export type ShopifyMediaType =
  | 'IMAGE'
  | 'VIDEO'
  | 'MODEL_3D'
  | 'EXTERNAL_VIDEO';

export interface ShopifyMedia {
  id: string;
  mediaContentType: ShopifyMediaType;
  // Para MediaImage
  image?: ShopifyImage;
  // Para Video
  video?: ShopifyVideo;
  // Para Model3d - os dados vêm diretamente no objeto, não em um sub-objeto
  model3d?: ShopifyModel3d;
  // Para ExternalVideo
  externalVideo?: ShopifyExternalVideo;
  // Campos diretos para Model3D e Video (estrutura real da API)
  sources?: Array<{
    url: string;
    mimeType: string;
  }>;
  // Para ExternalVideo direto
  host?: 'YOUTUBE' | 'VIMEO';
  originUrl?: string;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: ShopifySelectedOption[];
  price: ShopifyMoney;
}

export interface ShopifyCustomerAddress {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  provinceCode: string | null;
  zip: string | null;
  countryCodeV2: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: ShopifySelectedOption[];
  price: ShopifyMoney;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  media: {
    edges: Array<{
      node: ShopifyMedia;
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyMoney;
    product: {
      title: string;
      handle: string;
      images: {
        edges: Array<{
          node: ShopifyImage;
        }>;
      };
    };
  };
}

export interface ShopifyCart {
  id: string;
  createdAt: string;
  updatedAt: string;
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney;
    totalDutyAmount?: ShopifyMoney;
  };
  checkoutUrl: string;
}

// Local cart item interface for easier state management
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  productTitle: string;
  handle: string;
  quantity: number;
  price: ShopifyMoney;
  image?: ShopifyImage;
}

// Cart context interface
export interface CartContextType {
  cart: ShopifyCart | null;
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateCartItem: (lineId: string, quantity: number) => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => string;
  clearCart: () => void;
}

// Customer/User types for authentication
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  acceptsMarketing: boolean;
  addresses: {
    nodes: ShopifyCustomerAddress[];
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing: boolean;
  addresses: Address[];
  orders: Order[];
}

export interface Address {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalPrice: ShopifyMoney;
  createdAt: string;
  fulfillmentStatus: string | null;
  financialStatus: string | null;
  lineItems: OrderLineItem[];
}

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  price: ShopifyMoney;
  variant: {
    id: string;
    title: string;
    image?: ShopifyImage;
  };
}

// Auth interfaces
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Interface padrão para respostas das funções Shopify
export interface ShopifyResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}
