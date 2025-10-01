'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

export default function AuthRedirectHandler() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Don't process while auth is still loading
    if (isLoading) return;

    const authRequired = searchParams.get('auth');
    const redirectPath = searchParams.get('redirect');

    if (authRequired === 'required' && !isAuthenticated) {
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
  }, [searchParams, isAuthenticated, isLoading]);

  // Close modal when user becomes authenticated
  // useEffect(() => {
  //   if (isAuthenticated && showAuthModal) {
  //     setShowAuthModal(false);
  //   }
  // }, [isAuthenticated, showAuthModal]);

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
