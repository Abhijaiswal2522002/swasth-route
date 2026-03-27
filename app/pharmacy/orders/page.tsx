'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, ChevronRight, Package, 
  MapPin, Phone, RefreshCw, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';
import { Input } from '@/components/ui/input';

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
  isEmergency?: boolean;
  userId?: {
    name: string;
    phone: string;
  };
}

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      let res;
      if (newStatus === 'accepted') {
        res = await ApiClient.acceptOrder(orderId);
      } else if (newStatus === 'rejected') {
        res = await ApiClient.rejectOrder(orderId, 'Unspecified reason');
      } else {
        res = await ApiClient.updateOrderStatus(orderId, newStatus);
      }
      
      if (!res.error) {
        loadOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const statusColors: any = {
    pending: 'bg-orange-50 text-orange-600 border-orange-100',
    accepted: 'bg-blue-50 text-blue-600 border-blue-100',
    preparing: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'out for delivery': 'bg-purple-50 text-purple-600 border-purple-100',
    delivered: 'bg-green-50 text-green-600 border-green-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing order vaults...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Order Management</h1>
          <p className="text-gray-500 font-medium max-w-md">Real-time queue of patient requests, emergency scripts, and logistics tracking.</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge className="bg-primary/5 text-primary border-primary/10 rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
             Global Queue: {orders.length}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* FILTERS SIDEBAR/TOP */}
        <div className="md:col-span-3 space-y-6">
          <Card className="rounded-[2rem] border-gray-100 bg-white shadow-sm p-6 overflow-hidden">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Stream
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedStatus(null)}
                className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStatus === null ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                All Orders
              </button>
              {['pending', 'accepted', 'preparing', 'out for delivery', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStatus === status ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ORDERS FEED */}
        <div className="md:col-span-9 space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-5 w-6 h-6 text-gray-300 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by Order ID or Patient Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 h-16 rounded-[1.5rem] border-2 border-gray-100 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm text-lg font-bold"
            />
          </div>

          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <Card key={order._id} className="rounded-[2rem] border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
                    
                    {/* Order Metadata */}
                    <div className="lg:w-1/3 p-8 bg-gray-50/30">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`${statusColors[order.status.toLowerCase()] || 'bg-gray-50 text-gray-500'} rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border border-current opacity-70`}>
                          {order.status}
                        </Badge>
                        {order.isEmergency && (
                          <div className="animate-pulse bg-red-600 text-white p-1 rounded-md">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">{order.orderId}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      
                      <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary"><User2 size={14} /></div>
                          <p className="text-sm font-bold text-gray-700">{order.userId?.name || 'Anonymous User'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary"><Phone size={14} /></div>
                          <p className="text-xs font-bold text-gray-500">{order.userId?.phone || 'No phone provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="lg:flex-1 p-8 bg-white flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prescribed Items</p>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm font-bold bg-gray-50/50 p-2.5 rounded-xl border border-gray-50">
                                  <span className="text-gray-900">{item.medicineName}</span>
                                  <span className="text-primary tracking-tighter">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Logistics Meta</p>
                            <div className="flex gap-2">
                              <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 mt-8 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Settlement</p>
                          <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{order.total}</span>
                        </div>
                        <div className="flex gap-2">
                           {order.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                className="rounded-2xl h-11 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-black uppercase tracking-widest text-[9px] px-5"
                                onClick={() => handleStatusUpdate(order._id, 'rejected')}
                              >
                                Reject
                              </Button>
                              <Button 
                                className="rounded-2xl h-11 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[9px] px-8 shadow-lg shadow-green-100"
                                onClick={() => handleStatusUpdate(order._id, 'accepted')}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                          {order.status === 'accepted' && (
                            <Button 
                              className="rounded-2xl h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[9px] px-8"
                              onClick={() => handleStatusUpdate(order._id, 'preparing')}
                            >
                              Start Preparation
                            </Button>
                          )}
                           {order.status === 'preparing' && (
                            <Button 
                              className="rounded-2xl h-11 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-[9px] px-8"
                              onClick={() => handleStatusUpdate(order._id, 'out for delivery')}
                            >
                              Dispatch Order
                            </Button>
                          )}
                          {order.status === 'out for delivery' && (
                            <Button 
                              className="rounded-2xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[9px] px-8"
                              onClick={() => handleStatusUpdate(order._id, 'delivered')}
                            >
                              Mark Delivered
                            </Button>
                          )}
                          <Button variant="outline" className="rounded-2xl h-11 w-11 p-0 border-gray-100 text-gray-400 hover:bg-gray-50 flex items-center justify-center">
                             <FileText size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>

                  </div>
                </Card>
              ))
            ) : (
               <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Queue is Clear</h3>
                <p className="text-gray-400 font-medium">No orders match the current filter criteria.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper icons
function User2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
