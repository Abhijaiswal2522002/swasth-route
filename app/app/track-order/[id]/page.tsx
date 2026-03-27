'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Package, RefreshCw, Truck } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import ApiClient from '@/lib/api';

export default function TrackOrderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && orderId) {
      const fetchOrder = async () => {
        setIsLoading(true);
        try {
          const res = await ApiClient.getOrderDetails(orderId);
          if (res.data) {
            setOrder(res.data as any);
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    }
  }, [user, authLoading, orderId, router]);

  if (authLoading || (isLoading && !order)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Connecting to tracking server...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Button onClick={() => router.push('/app/orders')}>View All Orders</Button>
      </div>
    );
  }

  const statusSteps = [
    { label: 'Order Confirmed', completed: ['pending', 'accepted', 'out for delivery', 'delivered'].includes(order.status) },
    { label: 'Preparing', completed: ['accepted', 'out for delivery', 'delivered'].includes(order.status) },
    { label: 'Out for Delivery', completed: ['out for delivery', 'delivered'].includes(order.status) },
    { label: 'Delivered', completed: order.status === 'delivered' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Track Order</h1>
            <p className="text-primary font-bold uppercase tracking-widest text-sm">Order ID: {order.orderId}</p>
          </div>
          <div className="bg-primary/5 text-primary px-4 py-2 rounded-2xl border border-primary/10 font-black text-xs uppercase tracking-widest">
            {order.status}
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <Card className="mb-8 border-gray-100 rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-lg font-bold">Delivery Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-0 relative">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-6 pb-8 last:pb-0 relative">
                {index < statusSteps.length - 1 && (
                  <div className={`absolute left-[15px] top-[30px] w-0.5 h-[calc(100%-20px)] ${
                    statusSteps[index+1].completed ? 'bg-primary' : 'bg-gray-100'
                  }`} />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors duration-500 ${step.completed
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-white border-2 border-gray-100 text-gray-400'
                  }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-bold text-lg transition-colors duration-500 ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  {step.completed && (
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Updated just now</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/30">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Delivery Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Estimated Arrival</p>
              <p className="text-2xl font-black text-primary">{statusSteps[3].completed ? 'Arrived' : `${order.estimatedDeliveryTime} mins`}</p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
              <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Support Contact</p>
                <p className="font-bold text-gray-900">+91 91234 56789</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/30">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm font-medium text-gray-700 leading-relaxed">
            {order.deliveryAddress?.street},<br />
            {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <Card className="border-gray-100 rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/30">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-bold">FROM: <span className="text-gray-900">{order.pharmacyId?.name}</span></p>
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate max-w-[70%]">{item.medicineName}</p>
                <p className="text-sm font-black text-primary">₹{item.price} x {item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="font-black text-gray-500 uppercase tracking-widest text-xs">Total Amount Paid</span>
            <span className="text-3xl font-black text-primary">₹{order.total}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
