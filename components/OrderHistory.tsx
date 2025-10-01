'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatMoney } from '@/utils/helpers';
import { formatOrderStatus, getOrderStatusColor } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders, type ShopifyOrder } from '@/hooks/useOrders';
import LoadingSpinner from './LoadingSpinner';
import Image from 'next/image';

export default function OrderHistory() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    data: ordersResponse,
    isLoading,
    error,
    isError,
  } = useCustomerOrders();
  const orders: ShopifyOrder[] = ordersResponse?.success
    ? ordersResponse.data.orders || []
    : [];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lineItems.edges.some((edge) =>
        edge.node.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === 'all' || order.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Please Sign In
        </h2>
        <p className="text-gray-600 mb-8">
          You need to be logged in to view your orders.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-red-600">
            <p>Error loading orders: {error?.message || 'Unknown error'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/account" className="hover:text-gray-700">
            Account
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Order History</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600 mt-2">Track and manage all your orders</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Orders</option>
              <option value="UNFULFILLED">Processing</option>
              <option value="FULFILLED">Delivered</option>
              <option value="PARTIALLY_FULFILLED">Partially Shipped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't placed any orders yet."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow">
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {order.name}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(
                        order.fulfillmentStatus
                      )}`}
                    >
                      {formatOrderStatus(order.fulfillmentStatus)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      {formatMoney(order.totalPrice)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.lineItems.edges.map((edge, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                          {edge.node.variant?.image?.url ? (
                            <Image
                              width={48}
                              height={48}
                              src={edge.node.variant.image.url}
                              alt={
                                edge.node.variant.image.altText ||
                                edge.node.title
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg
                              className="w-6 h-6 text-gray-400"
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
                            Quantity: {edge.node.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {edge.node.variant.price
                          ? formatMoney(edge.node.variant.price)
                          : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                  {order.shippingAddress ? (
                    <p>
                      Shipped to: {order.shippingAddress.address1 || 'N/A'},{' '}
                      {order.shippingAddress.city || 'N/A'},{' '}
                      {order.shippingAddress.province || 'N/A'}{' '}
                      {order.shippingAddress.zip || 'N/A'}
                    </p>
                  ) : (
                    <p>Shipping address not available</p>
                  )}
                </div>
                <div className="flex space-x-4">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </Link>
                  {order.fulfillmentStatus === 'FULFILLED' && (
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-800">
                      Reorder
                    </button>
                  )}
                  {order.fulfillmentStatus === 'UNFULFILLED' && (
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
