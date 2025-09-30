'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

// Login schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Register schema
const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password confirmation is required'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().optional(),
    acceptsMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const { login, register, isLoading, error } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data.email, data.password);
      console.log('Login response:', response);
      toast.success('Login realizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        acceptsMarketing: data.acceptsMarketing || false,
      });
      toast.success('Conta criada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <Input
                  type="email"
                  id="email"
                  {...loginForm.register('email')}
                  placeholder="your@email.com"
                  className={
                    loginForm.formState.errors.email ? 'border-red-500' : ''
                  }
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  {...loginForm.register('password')}
                  placeholder="Enter your password"
                  className={
                    loginForm.formState.errors.password ? 'border-red-500' : ''
                  }
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name
                  </label>
                  <Input
                    type="text"
                    id="firstName"
                    {...registerForm.register('firstName')}
                    className={
                      registerForm.formState.errors.firstName
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name
                  </label>
                  <Input
                    type="text"
                    id="lastName"
                    {...registerForm.register('lastName')}
                    className={
                      registerForm.formState.errors.lastName
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="registerEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <Input
                  type="email"
                  id="registerEmail"
                  {...registerForm.register('email')}
                  placeholder="your@email.com"
                  className={
                    registerForm.formState.errors.email ? 'border-red-500' : ''
                  }
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="registerPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <Input
                  type="password"
                  id="registerPassword"
                  {...registerForm.register('password')}
                  placeholder="Create a password"
                  className={
                    registerForm.formState.errors.password
                      ? 'border-red-500'
                      : ''
                  }
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  {...registerForm.register('confirmPassword')}
                  placeholder="Confirm your password"
                  className={
                    registerForm.formState.errors.confirmPassword
                      ? 'border-red-500'
                      : ''
                  }
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  id="phone"
                  {...registerForm.register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acceptsMarketing"
                  {...registerForm.register('acceptsMarketing')}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label
                  htmlFor="acceptsMarketing"
                  className="text-sm text-gray-700"
                >
                  I want to receive marketing emails and updates
                </label>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}
              <Button
                type="button"
                variant="link"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-1 p-0 h-auto text-black font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
