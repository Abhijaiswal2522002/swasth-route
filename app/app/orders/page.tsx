'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      const fetchOrders = async () => {
        setIsFetching(true);
        try {
          const res = await ApiClient.getUserOrders();
          if (res.data) {
            setOrders(res.data as any[]);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setIsFetching(false);
        }
      };
      fetchOrders();
    }
  }, [user, loading, router]);

  if (loading || (isFetching && orders.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading your orders...</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'accepted':
      case 'out for delivery':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'accepted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your medicine orders</p>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow border-gray-100">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{order.pharmacyId?.name || 'Pharmacy'}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Order ID: {order.orderId}</p>
                      </div>
                    </div>
                    <div className="pl-12">
                      <p className="text-sm text-gray-700 font-medium">
                        {order.items?.map((it: any) => it.medicineName).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right space-y-1">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                      <p className="text-2xl font-black text-primary">₹{order.total}</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="rounded-xl px-6 font-bold shadow-sm"
                      onClick={() => router.push(`/app/track-order/${order._id}`)}
                    >
                      Track
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-2 border-gray-100 shadow-none">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <ShoppingCart className="w-8 h-8 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start ordering medicines from pharmacies near your area to see them here.</p>
              <Button 
                onClick={() => router.push('/app')}
                className="rounded-xl px-8 font-bold h-12 shadow-lg shadow-primary/20"
              >
                Browse Pharmacies
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
