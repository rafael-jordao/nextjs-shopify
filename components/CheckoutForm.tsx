'use client';

// Checkout será feito usando checkoutUrl do carrinho com parâmetros pre-populados
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatMoney } from '@/utils/helpers';
import { buildShopifyCheckoutUrl, type CheckoutData } from '@/utils/checkout';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');

  // Obter endereço principal do usuário
  const defaultAddress = user?.addresses?.find((addr) => addr.default);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: defaultAddress?.firstName || user?.firstName || '',
      lastName: defaultAddress?.lastName || user?.lastName || '',
      address1: defaultAddress?.address1 || '',
      address2: defaultAddress?.address2 || '',
      city: defaultAddress?.city || '',
      province: defaultAddress?.province || '',
      country: defaultAddress?.country || 'BR',
      zip: defaultAddress?.zip || '',
      phone: defaultAddress?.phone || user?.phone || '',
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // Usar o checkoutUrl do carrinho existente e adicionar parâmetros de pre-população
      if (cart?.checkoutUrl) {
        // Preparar dados para a função utilitária
        const checkoutData: CheckoutData = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          province: data.province,
          country: data.country,
          zip: data.zip,
          phone: data.phone,
        };

        // Construir URL pre-populada usando função utilitária
        const finalUrl = buildShopifyCheckoutUrl(
          cart.checkoutUrl,
          checkoutData
        );

        console.log('Redirecionando para checkout pre-populado:', finalUrl);

        // Redirecionar para checkout do Shopify com dados pre-populados
        window.location.href = finalUrl;
      } else {
        throw new Error('Checkout URL não encontrada');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Houve um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 00-2-2h-2"
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
      {/* Formulário de Contato e Entrega */}
      <div className="space-y-6">
        {/* Indicação de dados pre-populados */}
        {defaultAddress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-blue-800 font-medium">
                Dados preenchidos automaticamente do seu perfil
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Você pode editar qualquer informação abaixo se necessário.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contact</CardTitle>
              {!user ? (
                <Link
                  href="/account"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </Link>
              ) : (
                <span className="text-sm text-green-600">
                  Logado como {user.firstName}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                type="email"
                {...register('email')}
                placeholder="Email or mobile phone number"
                className={`h-12 text-base ${
                  errors.email
                    ? 'border-red-500 focus-visible:ring-red-500/20'
                    : ''
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Section */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Country/Region */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Country/Region
                </label>
                <Select
                  value={watchedValues.country || ''}
                  onValueChange={(value) => setValue('country', value)}
                >
                  <SelectTrigger
                    className={`h-12 text-base ${
                      errors.country
                        ? 'border-red-500 focus-visible:ring-red-500/20'
                        : ''
                    }`}
                  >
                    <SelectValue placeholder="Brazil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brazil</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    {...register('firstName')}
                    placeholder="First name (optional)"
                    className={`h-12 text-base ${
                      errors.firstName
                        ? 'border-red-500 focus-visible:ring-red-500/20'
                        : ''
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    type="text"
                    {...register('lastName')}
                    placeholder="Last name"
                    className={`h-12 text-base ${
                      errors.lastName
                        ? 'border-red-500 focus-visible:ring-red-500/20'
                        : ''
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Input
                  type="text"
                  {...register('address1')}
                  placeholder="Address"
                  className={`h-12 text-base ${
                    errors.address1
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : ''
                  }`}
                />
                {errors.address1 && (
                  <p className="text-sm text-red-600">
                    {errors.address1.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="text"
                  {...register('address2')}
                  placeholder="Apartment, suite, etc. (optional)"
                  className="h-12 text-base"
                />
              </div>

              {/* Postal Code */}
              <div className="relative space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    {...register('zip')}
                    placeholder="Postal code"
                    className={`h-12 text-base pr-12 ${
                      errors.zip
                        ? 'border-red-500 focus-visible:ring-red-500/20'
                        : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                {errors.zip && (
                  <p className="text-sm text-red-600">{errors.zip.message}</p>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    {...register('city')}
                    placeholder="City"
                    className={`h-12 text-base ${
                      errors.city
                        ? 'border-red-500 focus-visible:ring-red-500/20'
                        : ''
                    }`}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Select
                    value={watchedValues.province || ''}
                    onValueChange={(value) => setValue('province', value)}
                  >
                    <SelectTrigger
                      className={`h-12 text-base ${
                        errors.province
                          ? 'border-red-500 focus-visible:ring-red-500/20'
                          : ''
                      }`}
                    >
                      <SelectValue placeholder="Paraíba" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.province && (
                    <p className="text-sm text-red-600">
                      {errors.province.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Save Information Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveInfo"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="saveInfo" className="text-sm text-gray-700">
                  Save this information for next time
                </label>
              </div>

              {/* Shipping Method */}
              <div className="pt-6 border-t space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipping method
                </h3>
                <div className="text-sm text-gray-500">
                  Enter your shipping address to view available shipping
                  methods.
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="relative">
                  {item.image ? (
                    <img
                      src={item.image.url}
                      alt={item.image.altText || item.title}
                      className="w-16 h-16 object-cover rounded border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded border-2 border-gray-200 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.productTitle}
                  </h3>
                  <p className="text-sm text-gray-500">{item.title}</p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatMoney(item.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {cart?.cost.subtotalAmount
                  ? formatMoney(cart.cost.subtotalAmount)
                  : 'R$0,00'}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-gray-500">Enter shipping address</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Estimated taxes</span>
              <span>
                {cart?.cost.totalTaxAmount &&
                parseFloat(cart.cost.totalTaxAmount.amount) > 0
                  ? formatMoney(cart.cost.totalTaxAmount)
                  : 'R$136,00'}
              </span>
            </div>

            <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">BRL</span>
                <span>
                  {cart?.cost.totalAmount
                    ? formatMoney(cart.cost.totalAmount)
                    : 'R$936,00'}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              size="lg"
              className="w-full h-12 text-lg font-medium mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                'Complete order'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
