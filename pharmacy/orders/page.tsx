'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';

interface OrderItem {
  medicineName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  status: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: any;
  createdAt: string;
}

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const response = await ApiClient.getPharmacyOrders(selectedStatus || undefined);
        if (response.error) {
          setError(response.error);
        } else {
          setOrders(response.data as Order[]);
        }
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [selectedStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300';
      case 'accepted':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Orders Queue</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={selectedStatus === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(null)}
          >
            All Orders
          </Button>
          {['pending', 'accepted', 'processing', 'dispatched', 'delivered'].map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <CardTitle className="text-lg">{order.orderId}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Items:</p>
                    <div className="ml-4 space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {item.medicineName} x{item.quantity} - ₹{item.price * item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Delivery Address:</p>
                    <p className="text-sm text-muted-foreground ml-4 line-clamp-2">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-lg font-bold text-primary">Total: ₹{order.total}</span>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Mark as Dispatched
                        </Button>
                      )}
                      {['pending', 'accepted', 'processing', 'dispatched'].includes(order.status) && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
