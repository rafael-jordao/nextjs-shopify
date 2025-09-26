'use client';

import { z } from 'zod';
import { useCart } from '../contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

// Zod validation schema
const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address1: z.string().min(5, 'Address must be at least 5 characters'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().min(2, 'Please select a country'),
  province: z.string().min(2, 'Province/State is required'),
  zip: z.string().min(3, 'Postal/ZIP code is required'),
  phone: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const { cart, cartItems } = useCart();
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm<CheckoutFormData>({
  //   resolver: zodResolver(checkoutSchema),
  // });

  // const onSubmit = async (data: CheckoutFormData) => {
  //   setIsSubmitting(true);

  //   try {
  //     // In a real implementation, you would redirect to Shopify's checkout URL
  //     // or use Shopify's Buy SDK to create a checkout with customer information

  //     if (cart?.checkoutUrl) {
  //       // Add customer data to the checkout (this would typically be done server-side)
  //       console.log('Checkout data:', data);
  //       console.log('Redirecting to Shopify checkout:', cart.checkoutUrl);

  //       // Redirect to Shopify's hosted checkout
  //       window.location.href = cart.checkoutUrl;
  //     } else {
  //       alert('No items in cart to checkout');
  //     }
  //   } catch (error) {
  //     console.error('Checkout error:', error);
  //     alert('There was an error processing your checkout. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-500 mb-6">
          Add some products to your cart before checking out.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Order Summary
        </h2>

        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              {item.image && (
                <Image
                  width="64"
                  height="64"
                  src={item.image.url}
                  alt={item.image.altText || item.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {item.productTitle}
                </h3>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                ${(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-base text-gray-600">
            <span>Subtotal</span>
            <span>
              $
              {cart?.cost.subtotalAmount
                ? parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)
                : '0.00'}
            </span>
          </div>

          {cart?.cost.totalTaxAmount &&
            parseFloat(cart.cost.totalTaxAmount.amount) > 0 && (
              <div className="flex justify-between text-base text-gray-600">
                <span>Tax</span>
                <span>
                  ${parseFloat(cart.cost.totalTaxAmount.amount).toFixed(2)}
                </span>
              </div>
            )}

          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>
              $
              {cart?.cost.totalAmount
                ? parseFloat(cart.cost.totalAmount.amount).toFixed(2)
                : '0.00'}
            </span>
          </div>

          <Link href={cart?.checkoutUrl ?? '/'}>
            <button
              type="submit"
              className={`w-full py-4 px-6 text-lg font-medium rounded-md transition-colors ${'bg-black text-white hover:bg-gray-800'}`}
            >
              Complete Order
            </button>
          </Link>
        </div>
      </div>

      {/* Shipping Information */}
      {/* <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Shipping Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                errors.email
                  ? 'border-red-300 focus:border-red-300'
                  : 'border-gray-300 focus:border-black'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.firstName
                    ? 'border-red-300 focus:border-red-300'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.lastName
                    ? 'border-red-300 focus:border-red-300'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="address1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address *
            </label>
            <input
              type="text"
              id="address1"
              {...register('address1')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                errors.address1
                  ? 'border-red-300 focus:border-red-300'
                  : 'border-gray-300 focus:border-black'
              }`}
              placeholder="123 Main Street"
            />
            {errors.address1 && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address1.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="address2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address 2 (Optional)
            </label>
            <input
              type="text"
              id="address2"
              {...register('address2')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City *
              </label>
              <input
                type="text"
                id="city"
                {...register('city')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.city
                    ? 'border-red-300 focus:border-red-300'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country *
              </label>
              <select
                id="country"
                {...register('country')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.country
                    ? 'border-red-300 focus:border-red-300'
                    : 'border-gray-300 focus:border-black'
                }`}
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="BR">Brazil</option>
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="province"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State/Province *
              </label>
              <input
                type="text"
                id="province"
                {...register('province')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.province
                    ? 'border-red-300 focus:border-red-300'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
              {errors.province && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.province.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="zip"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ZIP/Postal Code *
              </label>
              <input
                type="text"
                id="zip"
                {...register('zip')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.zip
                    ? 'border-red-300 focus:border-red-300'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
              {errors.zip && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.zip.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 text-lg font-medium rounded-md transition-colors ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              You will be redirected to Shopify&apos;s secure checkout to
              complete your payment.
            </p>
          </div>
        </form>
      </div> */}
    </div>
  );
}
