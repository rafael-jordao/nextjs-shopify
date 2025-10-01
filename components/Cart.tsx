'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface CartProps {
  children: React.ReactNode;
}

export default function Cart({ children }: CartProps) {
  const { cartItems, removeFromCart, updateCartItem, getTotalItems, cart } =
    useCart();

  const totalItems = getTotalItems();

  const handleUpdateQuantity = async (lineId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(lineId);
        toast.success('Item removido do carrinho');
      } else {
        await updateCartItem(lineId, quantity);
        toast.success('Quantidade atualizada');
      }
    } catch (error) {
      toast.error('Erro ao atualizar quantidade');
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    try {
      await removeFromCart(lineId);
      toast.success('Item removido do carrinho');
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 rounded-full"
            >
              {totalItems}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-1/4 md:w-1/2 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Seu carrinho está vazio
                </h3>
                <p className="text-gray-500 mb-4">
                  Adicione alguns produtos para continuar
                </p>
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/products">Ver Produtos</Link>
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.image.url}
                            alt={item.image.altText || item.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {item.productTitle}
                      </h3>
                      {item.title !== 'Default Title' && (
                        <p className="text-xs text-gray-500 mb-2">
                          {item.title}
                        </p>
                      )}
                      <p className="text-base font-bold text-gray-900 mb-3">
                        ${parseFloat(item.price.amount).toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="h-8 w-8 p-0 rounded-r-none border-r hover:bg-gray-50"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium px-3 min-w-[3rem] text-center bg-gray-50">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="h-8 w-8 p-0 rounded-l-none border-l hover:bg-gray-50"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full self-start mt-1"
                      title="Remover item"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t px-6 py-4 space-y-4 bg-gray-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  $
                  {cart?.cost.totalAmount
                    ? parseFloat(cart.cost.totalAmount.amount).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Frete e impostos calculados na finalização
              </p>
              <div className="space-y-3">
                <SheetClose asChild>
                  <Button asChild className="w-full h-12 text-base font-medium">
                    <Link href="/checkout">Finalizar Compra</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" asChild className="w-full h-10">
                    <Link href="/products">Continuar Comprando</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
