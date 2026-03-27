'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfileOrdersTab({ user }: { user: any }) {
  const allOrders = user?.allOrders || [];
  
  // Find active orders (not delivered or cancelled)
  const activeOrders = allOrders.filter((o: any) => 
    !['delivered', 'cancelled'].includes(o.status.toLowerCase())
  );
  
  // Find emergency orders (based on isEmergency flag)
  const emergencyOrders = allOrders.filter((o: any) => o.isEmergency);
  
  // Order history (delivered or cancelled)
  const orderHistory = allOrders.filter((o: any) => 
    ['delivered', 'cancelled'].includes(o.status.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'accepted':
      case 'out for delivery': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Orders Section */}
      <Card className="border-primary/50 shadow-md">
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
          {activeOrders.length > 0 ? activeOrders.map((order: any, i: number) => (
            <div key={i} className="flex flex-col gap-4 mb-6 last:mb-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{order.orderId}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items?.map((it: any) => it.medicineName).join(', ')}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              
              {/* Simple progress bar for active orders */}
              <div className="relative pt-2 pb-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`bg-primary h-2 rounded-full ${
                    order.status === 'pending' ? 'w-1/4' : 
                    order.status === 'accepted' ? 'w-1/2' : 
                    order.status === 'out for delivery' ? 'w-3/4' : 'w-full'
                  }`}></div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-medium">
                  <span className={order.status === 'pending' ? 'text-primary' : ''}>PLACED</span>
                  <span className={order.status === 'accepted' ? 'text-primary' : ''}>ACCEPTED</span>
                  <span className={order.status === 'out for delivery' ? 'text-primary' : ''}>OUT FOR DELIVERY</span>
                  <span>ETA: {order.estimatedDeliveryTime} MINS</span>
                </div>
              </div>
              
              <Button className="w-full gap-2 rounded-xl font-bold" variant="outline">
                <Truck className="w-4 h-4" /> Track Live Status
              </Button>
            </div>
          )) : (
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
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle className="text-destructive">Emergency Orders</CardTitle>
            </div>
            <CardDescription>Fast re-ordering for critical needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyOrders.map((order: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-background p-3 rounded-xl border border-destructive/10">
                <div>
                  <p className="font-semibold text-sm">{order.items?.map((it: any) => it.medicineName).join(', ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" variant="destructive" className="whitespace-nowrap rounded-full gap-1 text-xs font-bold px-4">
                  Order Again
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card className="border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle>Order History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderHistory.length > 0 ? orderHistory.map((order: any, i: number) => (
            <div key={i} className="border rounded-xl p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{order.orderId}</p>
                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="font-bold text-primary text-lg">₹{order.total}</p>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {order.items?.map((it: any) => it.medicineName).join(', ')}
              </p>
              
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full gap-2 group hover:bg-primary hover:text-primary-foreground transition-all rounded-lg font-bold">
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Reorder Items
                </Button>
              </div>
            </div>
          )) : (
            <p className="text-center py-6 text-sm text-gray-400">No past orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
