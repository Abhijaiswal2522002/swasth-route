'use client';

import React from 'react';
import { useCart } from '@/lib/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, isLoading } = useCart();

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed shadow-sm">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-primary/40" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Looks like you haven't added any medicines yet.</p>
          <Link href="/app/medicines">
            <Button size="lg" className="rounded-2xl px-8 font-black shadow-lg shadow-primary/20">
              Browse Medicines
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={`${item.medicineId}-${item.pharmacyId}`} className="border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.medicineName}</h3>
                      <p className="text-gray-500 text-sm font-medium mt-0.5">₹{item.price} per unit</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 mt-2 sm:mt-0">
                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.medicineId, item.pharmacyId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 hover:text-red-500 transition-colors"
                      >
                        {item.quantity <= 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      </button>
                      <span className="w-6 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.medicineId, item.pharmacyId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-black text-xl text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="border-primary/20 bg-white sticky top-24 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                <h3 className="font-extrabold text-lg text-gray-900">Order Summary</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3 font-medium text-gray-600 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                    <span className="font-bold text-gray-900">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-green-600">Free</span>
                  </div>
                </div>
                
                <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
                  <span className="font-extrabold text-gray-900 text-lg">Total</span>
                  <span className="font-black text-3xl text-primary">₹{cartTotal}</span>
                </div>
                
                <Button className="w-full rounded-2xl h-14 font-black text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
