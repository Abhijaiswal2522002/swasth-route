'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, Clock, AlertTriangle, RefreshCw, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';

interface ProfileOrdersTabProps {
  user: any;
  onRefresh?: () => void;
}

export default function ProfileOrdersTab({ user, onRefresh }: ProfileOrdersTabProps) {
  const router = useRouter();
  const allOrders = user?.allOrders || [];
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Find active orders (not delivered or cancelled)
  const activeOrders = allOrders.filter((o: any) => 
    !['delivered', 'cancelled'].includes(o.status?.toLowerCase() || '')
  );
  
  // Find emergency orders (based on isEmergency flag)
  const emergencyOrders = allOrders.filter((o: any) => o.isEmergency);
  
  // Order history (delivered or cancelled)
  const orderHistory = allOrders.filter((o: any) => 
    ['delivered', 'cancelled'].includes(o.status?.toLowerCase() || '')
  );

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'accepted':
      case 'processing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'assigned':
      case 'picked_up':
      case 'out for delivery': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success('Orders refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReorder = async (order: any) => {
    setReorderingId(order._id || order.orderId);
    try {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.medicineId && order.pharmacyId) {
            const pharmId = typeof order.pharmacyId === 'object' ? order.pharmacyId._id : order.pharmacyId;
            await ApiClient.addToCart(
              item.medicineId,
              pharmId,
              item.medicineName,
              item.price
            );
          }
        }
        toast.success('Items added to cart!');
        router.push('/app/cart');
      } else {
        router.push('/app/medicines');
      }
    } catch (err: any) {
      toast.error('Could not auto-add items to cart. Redirecting to medicine catalog...');
      router.push('/app/medicines');
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with refresh */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Orders</h2>
          <p className="text-sm text-muted-foreground">Track active deliveries and view previous prescriptions</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="gap-1.5 rounded-xl font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Active Orders Section */}
      <Card className="border-primary/50 shadow-md rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </div>
            <CardTitle>Active Orders</CardTitle>
          </div>
          <CardDescription>Real-time tracking of your ongoing deliveries</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {activeOrders.length > 0 ? activeOrders.map((order: any, i: number) => {
            const orderKey = order._id || order.orderId || i;
            const currentStatus = order.status?.toLowerCase() || 'pending';
            
            return (
              <div key={orderKey} className="flex flex-col gap-4 mb-6 last:mb-0 border-b last:border-b-0 pb-6 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{order.orderId || `ORD-${order._id?.slice(-6)}`}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {order.items?.map((it: any) => it.medicineName).join(', ') || 'Prescription items'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status || 'Pending'}
                  </Badge>
                </div>
                
                {/* Progress bar for active orders */}
                <div className="relative pt-2 pb-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`bg-primary h-2 rounded-full transition-all duration-500 ${
                      currentStatus === 'pending' ? 'w-1/4' : 
                      currentStatus === 'accepted' || currentStatus === 'processing' ? 'w-1/2' : 
                      currentStatus === 'assigned' || currentStatus === 'picked_up' || currentStatus === 'out for delivery' ? 'w-3/4' : 'w-full'
                    }`}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-medium">
                    <span className={currentStatus === 'pending' ? 'text-primary font-bold' : ''}>PLACED</span>
                    <span className={['accepted', 'processing'].includes(currentStatus) ? 'text-primary font-bold' : ''}>ACCEPTED</span>
                    <span className={['assigned', 'picked_up', 'out for delivery'].includes(currentStatus) ? 'text-primary font-bold' : ''}>ON THE WAY</span>
                    <span>ETA: {order.estimatedDeliveryTime || '15-20'} MINS</span>
                  </div>
                </div>
                
                <Link href={`/app/track-order/${order._id || order.orderId}`} className="w-full">
                  <Button className="w-full gap-2 rounded-xl font-bold" variant="outline">
                    <Truck className="w-4 h-4 text-primary" /> Track Live Status
                  </Button>
                </Link>
              </div>
            );
          }) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 opacity-30">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No active orders right now.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Orders Highlights */}
      {emergencyOrders.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 rounded-3xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle className="text-destructive">Emergency Orders</CardTitle>
            </div>
            <CardDescription>Instant re-order for recurring emergency prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyOrders.map((order: any, i: number) => (
              <div key={order._id || i} className="flex justify-between items-center bg-background p-3.5 rounded-2xl border border-destructive/10">
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    {order.items?.map((it: any) => it.medicineName).join(', ') || 'Emergency Medicine'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()} • ₹{order.total || order.subtotal || 0}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleReorder(order)}
                  disabled={reorderingId === (order._id || order.orderId)}
                  className="whitespace-nowrap rounded-xl gap-1.5 text-xs font-bold px-4"
                >
                  {reorderingId === (order._id || order.orderId) ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  )}
                  Order Again
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card className="border-gray-100 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle>Order History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {orderHistory.length > 0 ? orderHistory.map((order: any, i: number) => (
            <div key={order._id || i} className="border border-gray-100 rounded-2xl p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{order.orderId || `ORD-${order._id?.slice(-6)}`}</p>
                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                      {order.status || 'Delivered'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </p>
                </div>
                <p className="font-black text-primary text-lg">₹{order.total || 0}</p>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {order.items?.map((it: any) => `${it.medicineName} (x${it.quantity || 1})`).join(', ') || 'Items'}
              </p>
              
              <div className="pt-2 border-t border-gray-100 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleReorder(order)}
                  disabled={reorderingId === (order._id || order.orderId)}
                  className="w-full gap-2 group hover:bg-primary hover:text-primary-foreground transition-all rounded-xl font-bold"
                >
                  {reorderingId === (order._id || order.orderId) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  )}
                  Reorder Items
                </Button>
              </div>
            </div>
          )) : (
            <p className="text-center py-8 text-sm text-gray-400">No past orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
