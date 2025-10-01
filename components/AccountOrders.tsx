'use client';

import Link from 'next/link';
import { formatMoney } from '@/utils/helpers';
import { formatOrderStatus, getOrderStatusColor } from '@/utils/helpers';
import { useCustomerOrders } from '@/hooks/useOrders';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import type { ShopifyOrder, User } from '@/types/shopify';

interface AccountOrdersProps {
  user: User;
}

export default function AccountOrders({ user }: AccountOrdersProps) {
  const {
    data: ordersResponse,
    isLoading,
    error,
    isError,
  } = useCustomerOrders();

  const orders: ShopifyOrder[] = ordersResponse?.success
    ? ordersResponse.data.orders || []
    : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order History</h3>
        </div>
        <div className="p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order History</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading orders: {error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order History</h3>
        </div>
        <div className="p-6">
          <EmptyState
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping to see your order history here."
            icon={
              <svg
                className="w-16 h-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            }
            action={
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Start Shopping
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Order History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
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

            <div className="flex items-center space-x-4 overflow-x-auto">
              {order.lineItems.edges.slice(0, 3).map((edge, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 flex-shrink-0"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                    {edge.node.variant?.image?.url ? (
                      <img
                        src={edge.node.variant.image.url}
                        alt={edge.node.variant.image.altText || edge.node.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
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
                    )}
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
              {order.lineItems.edges.length > 3 && (
                <div className="text-sm text-gray-500 flex-shrink-0">
                  +{order.lineItems.edges.length - 3} more items
                </div>
              )}
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
