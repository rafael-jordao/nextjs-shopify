'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatMoney } from '@/utils/helpers';
import { formatOrderStatus, getOrderStatusColor } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          You need to be logged in to view your account.
        </p>
        <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
          Sign In
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Order History' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.firstName}!</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {mockOrders
                      .reduce(
                        (sum, order) =>
                          sum + parseFloat(order.totalPrice.amount),
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
              <h3 className="text-lg font-medium text-gray-900">
                Recent Orders
              </h3>
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
      )}

      {activeTab === 'orders' && (
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
                      Ordered on{' '}
                      {new Date(order.processedAt).toLocaleDateString()}
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
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Profile Information
            </h3>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={user.firstName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={user.lastName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={user.phone || ''}
                  placeholder="Add phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  readOnly
                />
              </div>
            </div>
            <div className="mt-6">
              <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
