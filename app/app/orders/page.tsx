'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
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
        <p className="text-muted-foreground animate-pulse">Loading orders...</p>
      </div>
    );
  }

  const orders = [
    {
      id: '1',
      pharmacy: 'Apollo Pharmacy',
      medicines: 'Aspirin, Vitamin D',
      status: 'delivered',
      date: '2024-02-20',
      total: 450,
    },
    {
      id: '2',
      pharmacy: 'MedPlus',
      medicines: 'Ibuprofen, Paracetamol',
      status: 'pending',
      date: '2024-02-21',
      total: 320,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track your medicine orders</p>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{order.pharmacy}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{order.medicines}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center justify-end gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium capitalize">{order.status}</span>
                    </div>
                    <p className="text-lg font-bold text-primary">₹{order.total}</p>
                    <Button size="sm" variant="outline">
                      Track
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-12 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start ordering medicines from nearby pharmacies</p>
              <Button onClick={() => router.push('/')}>Browse Pharmacies</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
