'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { SignInForm, SignUpForm, ResetPasswordForm } from './forms';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot-password';
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(
    defaultMode
  );

  const handleSuccess = () => {
    onClose();
  };

  const handleResetPasswordSuccess = () => {
    setMode('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login'
              ? 'Sign In'
              : mode === 'register'
              ? 'Create Account'
              : 'Reset Password'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {mode === 'login' && (
            <SignInForm
              onSuccess={handleSuccess}
              onForgotPassword={() => setMode('forgot-password')}
            />
          )}

          {mode === 'register' && <SignUpForm onSuccess={handleSuccess} />}

          {mode === 'forgot-password' && (
            <ResetPasswordForm onSuccess={handleResetPasswordSuccess} />
          )}

          {/* Toggle Mode */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-black font-medium hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-black font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot-password' && (
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-black font-medium hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
