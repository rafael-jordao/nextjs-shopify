'use client';

import Link from 'next/link';
import { formatMoney } from '@/utils/helpers';
import { formatOrderStatus, getOrderStatusColor } from '@/utils/helpers';
import type { User } from '@/types/shopify';

interface AccountOrdersProps {
  user: User;
}

export default function AccountOrders({ user }: AccountOrdersProps) {
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Order History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {mockOrders.map((order) => (
          <div key={order.id} className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {order.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Ordered on {new Date(order.processedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatMoney(order.totalPrice)}
                </p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(
                    order.fulfillmentStatus
                  )}`}
                >
                  {formatOrderStatus(order.fulfillmentStatus)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {order.lineItems.edges.map((edge, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
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
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {edge.node.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {edge.node.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <Link
                href={`/account/orders/${order.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Order Details
              </Link>
              {order.fulfillmentStatus === 'FULFILLED' && (
                <button className="text-sm font-medium text-gray-600 hover:text-gray-800">
                  Reorder
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
