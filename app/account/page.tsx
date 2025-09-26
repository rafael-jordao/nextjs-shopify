import AccountDashboard from '@/components/AccountDashboard';
import Header from '../../components/Header';

export const metadata = {
  title: 'My Account | ShopifyStore',
  description: 'Manage your account and view order history',
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AccountDashboard />
      </main>
    </div>
  );
}
