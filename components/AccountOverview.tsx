'use client';

import Link from 'next/link';
import { formatMoney } from '@/utils/helpers';
import { formatOrderStatus, getOrderStatusColor } from '@/utils/helpers';
import type { User } from '@/types/shopify';

interface AccountOverviewProps {
  user: User;
}

export default function AccountOverview({ user }: AccountOverviewProps) {
  // Mock orders data (in production, this would come from Shopify)
  const mockOrders = [
    {
      id: 'order-1',
      name: '#1001',
      processedAt: '2024-01-15T10:30:00Z',
      fulfillmentStatus: 'FULFILLED',
      financialStatus: 'PAID',
      totalPrice: { amount: '129.99', currencyCode: 'USD' },
      lineItems: {
        edges: [
          {
            node: {
              title: 'Classic T-Shirt',
              quantity: 2,
              variant: {
                image: { url: '/placeholder-product.jpg', altText: 'T-Shirt' },
                product: {
                  handle: 'classic-t-shirt',
                  title: 'Classic T-Shirt',
                },
              },
            },
          },
        ],
      },
    },
    {
      id: 'order-2',
      name: '#1002',
      processedAt: '2024-01-10T14:20:00Z',
      fulfillmentStatus: 'UNFULFILLED',
      financialStatus: 'PAID',
      totalPrice: { amount: '89.99', currencyCode: 'USD' },
      lineItems: {
        edges: [
          {
            node: {
              title: 'Premium Hoodie',
              quantity: 1,
              variant: {
                image: { url: '/placeholder-product.jpg', altText: 'Hoodie' },
                product: { handle: 'premium-hoodie', title: 'Premium Hoodie' },
              },
            },
          },
        ],
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockOrders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {mockOrders
                  .reduce(
                    (sum, order) => sum + parseFloat(order.totalPrice.amount),
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  mockOrders.filter(
                    (order) => order.fulfillmentStatus === 'UNFULFILLED'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(
                      order.fulfillmentStatus
                    )}`}
                  >
                    {formatOrderStatus(order.fulfillmentStatus)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatMoney(order.totalPrice)}
                  </p>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 bg-gray-50 text-center">
          <Link
            href="/account/orders"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All Orders →
          </Link>
        </div>
      </div>
    </div>
  );
}
