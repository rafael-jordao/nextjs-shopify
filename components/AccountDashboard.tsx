'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AccountOverview from './AccountOverview';
import AccountOrders from './AccountOrders';
import AccountProfile from './AccountProfile';

export default function AccountDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
      {activeTab === 'overview' && <AccountOverview user={user} />}
      {activeTab === 'orders' && <AccountOrders user={user} />}
      {activeTab === 'profile' && <AccountProfile user={user} />}
    </div>
  );
}
