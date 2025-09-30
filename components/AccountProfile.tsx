'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/shopify';

// Profile edit schema
const profileEditSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Por favor, insira um email válido'),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone.trim() === '') return true; // Optional field
        // Remove todos os caracteres não numéricos
        const cleanPhone = phone.replace(/\D/g, '');
        // Deve ter 11 dígitos (2 do DDD + 9 do número)
        return cleanPhone.length === 11;
      },
      {
        message: 'Telefone deve ter 11 dígitos (DDD + número). Ex: 83999999999',
      }
    ),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

// Função para formatar telefone brasileiro
const formatPhoneForShopify = (
  phone: string | undefined
): string | undefined => {
  if (!phone || phone.trim() === '') return undefined;

  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Se já tem 11 dígitos, adiciona +55
  if (cleanPhone.length === 11) {
    return `+55${cleanPhone}`;
  }

  // Se tem 13 dígitos e começa com 55, adiciona +
  if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
    return `+${cleanPhone}`;
  }

  // Se já tem + no início, retorna como está
  if (phone.startsWith('+55')) {
    return phone.replace(/\D/g, '').replace(/^55/, '+55');
  }

  return undefined;
};

interface AccountProfileProps {
  user: User;
}

export default function AccountProfile({ user }: AccountProfileProps) {
  const { updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Profile edit form
  const profileForm = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone ? user.phone.replace('+55', '') : '',
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone ? user.phone.replace('+55', '') : '',
      });
    }
  }, [user, profileForm]);

  // Handle profile update
  const onProfileSubmit = async (data: ProfileEditFormData) => {
    setIsUpdatingProfile(true);

    try {
      await updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: formatPhoneForShopify(data.phone),
      });

      toast.success('Perfil atualizado com sucesso!');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone ? user.phone.replace('+55', '') : '',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Profile Information
          </h3>
          {!isEditingProfile && (
            <Button onClick={() => setIsEditingProfile(true)} variant="outline">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      <div className="px-6 py-6">
        {isEditingProfile ? (
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <Input
                  type="text"
                  {...profileForm.register('firstName')}
                  className={
                    profileForm.formState.errors.firstName
                      ? 'border-red-500'
                      : ''
                  }
                />
                {profileForm.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome
                </label>
                <Input
                  type="text"
                  {...profileForm.register('lastName')}
                  className={
                    profileForm.formState.errors.lastName
                      ? 'border-red-500'
                      : ''
                  }
                />
                {profileForm.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  {...profileForm.register('email')}
                  className={
                    profileForm.formState.errors.email ? 'border-red-500' : ''
                  }
                />
                {profileForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone (Opcional)
                </label>
                <Input
                  type="tel"
                  {...profileForm.register('phone')}
                  placeholder="83999999999 (DDD + número)"
                  className={
                    profileForm.formState.errors.phone ? 'border-red-500' : ''
                  }
                />
                {profileForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Será formatado como +5583999999999
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex-1 sm:flex-none"
              >
                {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdatingProfile}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <Input
                type="text"
                value={user.firstName}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sobrenome
              </label>
              <Input
                type="text"
                value={user.lastName}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={user.email}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <Input
                type="tel"
                value={user.phone || ''}
                placeholder="Nenhum telefone cadastrado"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
