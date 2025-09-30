import Header from '@/components/Header';
import WishlistContent from '@/components/WishlistContent';

export const metadata = {
  title: 'Wishlist | ShopifyStore',
  description: 'Your favorite products saved for later',
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Products you&apos;ve saved for later</p>
        </div>
        <WishlistContent />
      </main>
    </div>
  );
}
