'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  useCustomerAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/useAddresses';
import type { User, Address } from '@/types/shopify';

// Schema de validação para endereço
const addressSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address1: z.string().min(5, 'Address must be at least 5 characters'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  province: z.string().min(2, 'State/Province is required'),
  country: z.string().min(2, 'Country is required'),
  zip: z.string().min(5, 'ZIP/Postal code must be at least 5 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
  default: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AccountAddresses() {
  const { data: addressesData, isLoading: addressesLoading } =
    useCustomerAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const addresses: Address[] = addressesData?.success
    ? addressesData?.data?.addresses || []
    : [];
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      country: 'BR',
      zip: '',
      phone: '',
      company: '',
      default: false,
    },
  });

  // Brazilian states
  const brazilianStates = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
  ];

  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setEditingAddressId(null);
    addressForm.reset({
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      country: 'BR',
      zip: '',
      phone: '',
      company: '',
      default: addresses.length === 0, // Primeiro endereço é padrão
    });
  };

  const handleEditAddress = (address: Address) => {
    setIsAddingAddress(false);
    setEditingAddressId(address.id);
    addressForm.reset({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      country: address.country || 'BR',
      zip: address.zip || '',
      phone: address.phone || '',
      company: address.company || '',
      default: address.default || false,
    });
  };

  const handleCancelEdit = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    addressForm.reset();
  };

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);

    try {
      const addressInput = {
        firstName: data.firstName,
        lastName: data.lastName,
        address1: data.address1,
        address2: data.address2 || null,
        city: data.city,
        province: data.province,
        country: data.country,
        zip: data.zip,
        phone: data.phone || null,
        company: data.company || null,
      };

      if (editingAddressId) {
        // Editando endereço existente
        await updateAddressMutation.mutateAsync({
          id: editingAddressId,
          addressData: addressInput,
        });
      } else {
        // Criando novo endereço
        const result = await createAddressMutation.mutateAsync(addressInput);

        // Se este endereço foi marcado como padrão, definir como padrão
        if (data.default && result.data?.id) {
          await setDefaultMutation.mutateAsync(result.data.id);
        }
      }

      handleCancelEdit();
    } catch (error) {
      console.error('Error saving address:', error);
      // O toast de erro já é tratado pelas mutations
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await deleteAddressMutation.mutateAsync(addressId);
    } catch (error) {
      console.error('Error deleting address:', error);
      // O toast de erro já é tratado pela mutation
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultMutation.mutateAsync(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
      // O toast de erro já é tratado pela mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
        <Button
          onClick={handleAddAddress}
          disabled={isAddingAddress || editingAddressId !== null}
        >
          Add Address
        </Button>
      </div>

      {/* Form para adicionar/editar endereço */}
      {(isAddingAddress || editingAddressId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddressId ? 'Edit Address' : 'New Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={addressForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    {...addressForm.register('firstName')}
                    className={
                      addressForm.formState.errors.firstName
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {addressForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    {...addressForm.register('lastName')}
                    className={
                      addressForm.formState.errors.lastName
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {addressForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <Input
                  {...addressForm.register('address1')}
                  placeholder="Street, number"
                  className={
                    addressForm.formState.errors.address1
                      ? 'border-red-500'
                      : ''
                  }
                />
                {addressForm.formState.errors.address1 && (
                  <p className="mt-1 text-sm text-red-600">
                    {addressForm.formState.errors.address1.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment, Suite, etc.
                </label>
                <Input
                  {...addressForm.register('address2')}
                  placeholder="Apartment, building, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    {...addressForm.register('city')}
                    className={
                      addressForm.formState.errors.city ? 'border-red-500' : ''
                    }
                  />
                  {addressForm.formState.errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Select
                    value={addressForm.watch('province')}
                    onValueChange={(value) =>
                      addressForm.setValue('province', value)
                    }
                  >
                    <SelectTrigger
                      className={
                        addressForm.formState.errors.province
                          ? 'border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {addressForm.formState.errors.province && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.formState.errors.province.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <Input
                    {...addressForm.register('zip')}
                    placeholder="00000-000"
                    className={
                      addressForm.formState.errors.zip ? 'border-red-500' : ''
                    }
                  />
                  {addressForm.formState.errors.zip && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.formState.errors.zip.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    {...addressForm.register('phone')}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <Input
                    {...addressForm.register('company')}
                    placeholder="Company name (optional)"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  {...addressForm.register('default')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="default" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving...'
                    : editingAddressId
                    ? 'Update'
                    : 'Add'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de endereços */}
      {addressesLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading addresses...</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={address.default ? 'ring-2 ring-blue-500' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {address.firstName} {address.lastName}
                      </h4>
                      {address.default && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{address.address1}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {address.city}, {address.province} {address.zip}
                      </p>
                      <p>
                        {address.country === 'BR' ? 'Brasil' : address.country}
                      </p>
                      {address.phone && <p>Tel: {address.phone}</p>}
                      {address.company && <p>Empresa: {address.company}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!address.default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Make Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                      disabled={isAddingAddress || editingAddressId !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isAddingAddress || editingAddressId !== null}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isAddingAddress && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  Nenhum endereço cadastrado
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Adicione um endereço para facilitar suas compras futuras.
                </p>
                <Button className="mt-4" onClick={handleAddAddress}>
                  Adicionar Primeiro Endereço
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
