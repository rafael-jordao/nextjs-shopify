'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthModal from './AuthModal';

export default function AuthRedirectHandler() {
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const authRequired = searchParams.get('auth');
    const redirectPath = searchParams.get('redirect');

    if (authRequired === 'required') {
      setShowAuthModal(true);

      // Store redirect path for after login
      if (redirectPath) {
        sessionStorage.setItem('post-login-redirect', redirectPath);
      }

      // Clean up URL by removing the query parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth');
      newUrl.searchParams.delete('redirect');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
