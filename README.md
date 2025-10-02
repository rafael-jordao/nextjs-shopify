# Next.js Shopify E-commerce

A modern, secure, and performant e-commerce application built with Next.js 15 and Shopify Storefront API. This project implements enterprise-grade security practices, modern state management, and optimized user experience.

## 🚀 Features

### 🔒 **Security First**

- **HttpOnly Cookies**: Secure authentication using server-side cookies instead of localStorage tokens
- **API Route Proxying**: All Shopify operations go through secure server-side API routes
- **CSRF Protection**: Built-in protection against cross-site request forgery
- **Token Management**: Customer access tokens never exposed to client-side

### ⚡ **Performance & UX**

- **TanStack Query**: Intelligent caching, background updates, and optimistic mutations
- **Smart Caching**: Different cache strategies for queries vs mutations
- **Loading States**: Granular loading indicators throughout the app
- **Error Boundaries**: Robust error handling with user-friendly messages
- **Optimistic Updates**: Instant UI feedback for better user experience

### 🛒 **E-commerce Features**

- **Product Catalog**: Browse products with filters, search, and pagination
- **Shopping Cart**: Add/remove items, quantity management, persistent cart
- **Customer Accounts**: Registration, login, profile management
- **Order History**: View past orders with detailed information
- **Address Management**: Multiple shipping addresses with default selection
- **Wishlist**: Save favorite products for later
- **Checkout**: Secure checkout process with Shopify integration

### 🎨 **Modern UI/UX**

- **Tailwind CSS**: Utility-first styling with consistent design system
- **Shadcn/ui**: High-quality, accessible UI components
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Dark/Light Mode**: Theme switching capabilities
- **Toast Notifications**: Real-time feedback for user actions

## 🏗️ Architecture

### **Tech Stack**

- **Framework**: Next.js 15 with App Router
- **TypeScript**: Full type safety throughout the application
- **State Management**: TanStack Query for server state, React Context for client state
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Custom secure implementation with HttpOnly cookies
- **API**: Shopify Storefront GraphQL API

### **Project Structure**

```
├── app/                    # Next.js 15 App Router
│   ├── api/               # API Routes (secure server-side)
│   │   ├── auth/          # Authentication endpoints
│   │   └── customer/      # Customer operations
│   ├── account/           # Customer account pages
│   ├── products/          # Product catalog
│   └── checkout/          # Checkout process
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom hooks with TanStack Query
├── lib/                   # Utility functions and configurations
│   └── shopify/           # Shopify API integration
└── types/                 # TypeScript type definitions
```

### **Security Architecture**

#### **Authentication Flow**

1. **Client Login**: User submits credentials via secure form
2. **Server Verification**: API route validates credentials with Shopify
3. **Token Storage**: Customer access token stored in HttpOnly cookie
4. **Session Management**: Server-side session validation for all requests
5. **Auto Refresh**: Transparent token refresh without user intervention

#### **API Route Protection**

```typescript
// All customer operations go through secure API routes
/api/customer/profile    # Get/update customer profile
/api/customer/orders     # Fetch customer orders
/api/customer/addresses  # Manage shipping addresses
/api/auth/session        # Session validation
```

### **State Management Strategy**

#### **Server State (TanStack Query)**

- **Queries**: Product data, customer profile, orders, addresses
- **Mutations**: Login, register, profile updates, cart operations
- **Cache Management**: Intelligent invalidation and background refetch
- **Error Handling**: Automatic retry with exponential backoff

#### **Client State (React Context)**

- **Authentication**: User session and login state
- **Cart**: Shopping cart items and operations
- **Wishlist**: Saved products
- **UI State**: Modals, themes, notifications

## 🛠️ Installation & Setup

### **Prerequisites**

- Node.js 18+
- npm/pnpm/yarn
- Shopify store with Storefront API access

### **Key Dependencies**

- **Next.js 15**: Latest React framework with App Router
- **React 19**: Latest React version
- **TanStack Query 5**: Modern data fetching and caching
- **TypeScript 5**: Latest TypeScript for type safety
- **Tailwind CSS 4**: Latest utility-first CSS framework

### **Environment Variables**

Create a `.env.local` file:

```bash
# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics, etc.
```

### **Installation**

```bash
# Clone the repository
git clone https://github.com/rafael-jordao/nextjs-shopify.git
cd nextjs-shopify

# Install dependencies
npm install
# or
pnpm install

# Run development server (with Turbopack)
npm run dev
# or
pnpm dev

# Build for production (with Turbopack)
npm run build
# or
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Usage Examples

### **Custom Hooks**

#### **useCustomerOrders**

```typescript
import { useCustomerOrders } from '@/hooks/useOrders';

function OrderHistory() {
  const { data: ordersData, isLoading, error } = useCustomerOrders();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  const orders = ordersData?.success ? ordersData.data || [] : [];

  return (
    <div>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

#### **useCreateAddress**

```typescript
import { useCreateAddress } from '@/hooks/useAddresses';

function AddressForm() {
  const createAddress = useCreateAddress();

  const handleSubmit = async (data) => {
    try {
      await createAddress.mutateAsync(data);
      // Success toast automatically shown
      // Cache automatically invalidated
    } catch (error) {
      // Error toast automatically shown
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={createAddress.isPending}>
        {createAddress.isPending ? 'Creating...' : 'Create Address'}
      </button>
    </form>
  );
}
```

### **Secure Authentication**

```typescript
import { useAuth } from '@/contexts/SecureAuthContext';

function LoginForm() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      // Automatic redirect handled by context
      // Session automatically established
    }
  };

  return <form onSubmit={handleLogin}>{/* Form implementation */}</form>;
}
```

## 🔧 Configuration

### **TanStack Query Setup**

```typescript
// contexts/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) {
          return false; // Don't retry auth errors
        }
        return failureCount < 2;
      },
    },
  },
});
```

### **Shopify Client Configuration**

```typescript
// lib/shopify/client.ts
export const shopifyFetch = async (query: string, variables = {}) => {
  // Intelligent caching strategy
  const cache = query.includes('mutation') ? 'no-store' : 'force-cache';

  const response = await fetch(SHOPIFY_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache,
  });

  return response.json();
};
```

## 🚀 Deployment

### **Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### **Environment Variables for Production**

- `NEXT_PUBLIC_SHOPIFY_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `NEXT_PUBLIC_STORE_URL`

## 📈 Performance

### **Core Web Vitals**

- **LCP**: < 2.5s (optimized images, fonts, and code splitting)
- **FID**: < 100ms (minimal JavaScript, optimized interactions)
- **CLS**: < 0.1 (stable layouts, reserved space for dynamic content)

### **Optimization Features**

- **Turbopack**: Ultra-fast bundler for development and production builds
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching Strategy**: Intelligent cache headers and service worker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Shopify](https://shopify.dev/) - E-commerce platform and APIs
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI component library

---

**Built with 💚 by Rafael Jordão**
