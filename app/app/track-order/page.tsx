'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Clock, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrackOrderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Loading tracker...</p>
      </div>
    );
  }

  const orderStatus = {
    id: 'ORD-2024-001',
    pharmacy: 'Apollo Pharmacy',
    medicines: ['Aspirin (2 strips)', 'Vitamin D (1 pack)'],
    status: 'in-transit',
    date: '2024-02-21 10:30 AM',
    estimatedDelivery: '2024-02-21 11:30 AM',
    deliveryAddress: '123 Main St, Mumbai, MH 400001',
    deliveryPartner: 'Raj Kumar',
    deliveryPhone: '+91 98765 43210',
    total: 450,
  };

  const statusSteps = [
    { label: 'Order Confirmed', completed: true },
    { label: 'Preparing', completed: true },
    { label: 'Out for Delivery', completed: true },
    { label: 'Delivered', completed: false },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Order</h1>
        <p className="text-muted-foreground">Order ID: {orderStatus.id}</p>
      </div>

      {/* Status Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${step.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {step.completed && index < statusSteps.length - 1 && (
                    <div className="h-8 border-l-2 border-green-500 ml-4 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Partner */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Delivery Partner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-lg">{orderStatus.deliveryPartner}</p>
              <p className="text-sm text-muted-foreground">Delivery Executive</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">3 mins away</p>
              <p className="text-xs text-muted-foreground">Estimated arrival</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t">
            <Phone className="w-5 h-5 text-primary" />
            <a href={`tel:${orderStatus.deliveryPhone}`} className="text-primary hover:underline font-medium">
              {orderStatus.deliveryPhone}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Delivery Address</p>
              <p className="font-medium">{orderStatus.deliveryAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-4 border-t">
            <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium">{orderStatus.estimatedDelivery}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-2">From: {orderStatus.pharmacy}</p>
            {orderStatus.medicines.map((medicine, index) => (
              <p key={index} className="text-sm font-medium">• {medicine}</p>
            ))}
          </div>
          <div className="pt-4 border-t flex items-center justify-between">
            <span className="font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-primary">₹{orderStatus.total}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
