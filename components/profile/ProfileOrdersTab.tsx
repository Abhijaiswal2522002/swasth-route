import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfileOrdersTab({ user }: { user: any }) {
  // Mock data for UI demonstration
  const activeOrders = [
    { id: '#ORD-9821', status: 'Out for delivery', eta: '15 mins', items: 'Paracetamol 500mg, Vitamin C' }
  ];
  const emergencyOrders = [
    { id: '#EMG-102', date: 'Oct 12, 2023', items: 'Epinephrine Auto-Installer (EpiPen)', total: '₹4500' }
  ];
  const orderHistory = [
    { id: '#ORD-8734', date: 'Sep 25, 2023', status: 'Delivered', items: 'Ibuprofen 400mg, Cough Syrup', total: '₹320' },
    { id: '#ORD-8120', date: 'Aug 10, 2023', status: 'Cancelled', items: 'Amoxicillin 250mg', total: '₹150' },
  ];

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
          {activeOrders.length > 0 ? activeOrders.map((order, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.items}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{order.status}</Badge>
              </div>
              
              {/* Stepper tracking */}
              <div className="relative pt-4 pb-2 border-t border-b">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-primary">Placed</span>
                  <span className="text-primary">Accepted</span>
                  <span className="text-primary">Out for Delivery</span>
                  <span className="text-muted-foreground">Delivered</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div className="bg-primary h-2 rounded-full w-3/4"></div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>10:30 AM</span>
                  <span>10:35 AM</span>
                  <span>10:45 AM</span>
                  <span>ETA: {order.eta}</span>
                </div>
              </div>
              
              <Button className="w-full gap-2" variant="outline">
                <Truck className="w-4 h-4" /> Track Driver
              </Button>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-4">No active orders right now.</p>
          )}
        </CardContent>
      </Card>

      {/* Emergency Orders Highlights */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle className="text-destructive">Emergency Orders</CardTitle>
          </div>
          <CardDescription>Fast re-ordering for critical needs</CardDescription>
        </CardHeader>
        <CardContent>
          {emergencyOrders.length > 0 ? emergencyOrders.map((order, i) => (
            <div key={i} className="flex justify-between items-center bg-background p-3 rounded-lg border">
              <div>
                <p className="font-semibold text-sm">{order.items}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
              <Button size="sm" variant="destructive" className="whitespace-nowrap rounded-full gap-1">
                <AlertTriangle className="w-3 h-3" /> Order Again
              </Button>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No past emergency orders.</p>
          )}
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle>Order History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderHistory.map((order, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{order.id}</p>
                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{order.date}</p>
                </div>
                <p className="font-bold">{order.total}</p>
              </div>
              <p className="text-sm">{order.items}</p>
              
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full gap-2 group hover:bg-primary hover:text-primary-foreground transition-all">
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Reorder Items
                </Button>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-primary">View All Orders</Button>
        </CardContent>
      </Card>
    </div>
  );
}
