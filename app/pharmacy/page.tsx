'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Building2, MapPin, CheckCircle2, AlertCircle,
  Clock, Package, TrendingUp, ChevronRight, Check, X, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';
import Link from 'next/link';

export default function PharmacyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [profileRes, ordersRes, analyticsRes] = await Promise.all([
            ApiClient.getPharmacyProfile(),
            ApiClient.getPharmacyOrders(),
            ApiClient.getPharmacyAnalytics()
          ]);

          if (profileRes.data) setProfile(profileRes.data as any);
          if (ordersRes.data) setOrders(ordersRes.data as any[]);
          if (analyticsRes.data) setAnalytics(analyticsRes.data as any);
        } catch (error) {
          console.error('Error fetching pharmacy dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      let res;
      if (status === 'accepted') {
        res = await ApiClient.acceptOrder(orderId);
      } else if (status === 'rejected') {
        res = await ApiClient.rejectOrder(orderId, 'Unspecified reason');
      } else {
        res = await ApiClient.updateOrderStatus(orderId, status);
      }
      
      if (!res.error) {
        // Refresh orders
        const ordersRes = await ApiClient.getPharmacyOrders();
        if (ordersRes.data) setOrders(ordersRes.data as any[]);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (authLoading || (isLoading && !profile)) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Syncing pharmacy portal...</p>
      </div>
    );
  }

  const incomingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'out for delivery'].includes(o.status.toLowerCase()));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled', 'rejected'].includes(o.status.toLowerCase())).slice(0, 5);

  const shopDetails = {
    name: profile?.name || user?.name || 'ABC Medical Store',
    address: profile?.address?.street ? `${profile.address.street}, ${profile.address.city}` : 'Update your address in Settings',
    status: profile?.status?.toUpperCase() || 'APPROVED'
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP SECTION: Shop Identity */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-primary font-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{shopDetails.name}</h1>
              <div className="flex items-center gap-2 text-gray-400 mt-1.5 font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">{shopDetails.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-green-50 px-6 py-2.5 rounded-2xl border border-green-100 shadow-sm shadow-green-100/50">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-xs font-black text-green-700 uppercase tracking-[0.1em]">Status: {shopDetails.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* LEFT COLUMN: Incoming & Active Orders */}
          <div className="lg:col-span-7 space-y-8">

            {/* INCOMING ORDERS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                  </span>
                  Incoming Requests
                </h2>
                <Badge className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-50 rounded-xl px-4 py-1 font-black text-xs uppercase tracking-widest">{incomingOrders.length} New</Badge>
              </div>

              <div className="grid gap-4">
                {incomingOrders.length > 0 ? incomingOrders.map((order) => (
                  <Card key={order._id} className={`overflow-hidden transition-all duration-300 hover:shadow-xl border-2 rounded-3xl ${order.isEmergency ? 'border-red-500/30' : 'border-dashed border-gray-100'}`}>
                    {order.isEmergency && (
                      <div className="bg-red-600 px-6 py-2 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em]">
                          <AlertCircle className="w-4 h-4" /> EMERGENCY ORDER
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                    <CardContent className={`p-6 ${!order.isEmergency ? 'pt-6' : ''}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 opacity-60">ORDER {order.orderId}</p>
                          <p className="font-bold text-lg text-gray-900 leading-tight">
                            {order.items?.map((it: any) => it.medicineName).join(', ')}
                          </p>
                        </div>
                        {!order.isEmergency && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</span>}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex gap-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> Delivery Area: {order.deliveryAddress?.city}</div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 sm:flex-none border-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] transition-all"
                            onClick={() => handleUpdateStatus(order._id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button 
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-100 transition-all border-0"
                            onClick={() => handleUpdateStatus(order._id, 'accepted')}
                          >
                            Accept Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-10 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No pending orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* ACTIVE ORDERS */}
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <Package className="w-7 h-7 text-primary" /> Operational Pipeline
              </h2>
              <div className="grid gap-4">
                {activeOrders.length > 0 ? activeOrders.map((order) => (
                  <Card key={order._id} className="border-gray-100 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-900">{order.orderId}</p>
                          <Badge className="bg-blue-50 text-blue-700 border-blue-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{order.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 font-medium line-clamp-1">{order.items?.map((it: any) => it.medicineName).join(', ')}</p>
                      </div>
                      <Link href={`/pharmacy/orders/${order._id}`}>
                        <Button variant="outline" className="w-full sm:w-auto shrink-0 border-gray-100 hover:bg-primary/5 hover:text-primary hover:border-primary/20 text-gray-600 rounded-2xl h-12 px-6 font-bold">
                          Manage & Update <ChevronRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )) : (
                   <div className="text-center py-8 bg-white/50 rounded-3xl border border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Zero Active Deliveries</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Earnings & History */}
          <div className="lg:col-span-5 space-y-8">

            {/* EARNINGS */}
            <Card className="bg-gradient-to-br from-primary to-[#0b8a4f] text-white border-0 shadow-2xl shadow-primary/20 rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="w-32 h-32" />
              </div>
              <CardHeader className="pt-10 pb-2">
                <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em] flex justify-between items-center">
                  Live Liquidity Today <div className="p-2 bg-white/10 rounded-full"><TrendingUp className="w-4 h-4" /></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-10">
                <div className="text-6xl font-black mb-6 tracking-tighter">₹{analytics?.totalRevenue || 0}</div>
                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                  <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.15em] mb-2">Processed</p>
                    <p className="text-2xl font-black">{analytics?.deliveredOrders || 0} <span className="text-xs text-white/40">Orders</span></p>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.15em] mb-2">Plat. Deduct</p>
                    <p className="text-2xl font-black">₹{Math.floor((analytics?.totalRevenue || 0) * ((analytics?.commissionRate || 10) / 100))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-3xl border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Rating</p>
                <p className="text-3xl font-black text-gray-900">{analytics?.averageRating?.toFixed(1) || '5.0'}</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= Math.round(analytics?.averageRating || 5) ? 'bg-amber-400' : 'bg-gray-200'}`} />)}
                </div>
              </Card>
              <Card className="rounded-3xl border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Volume</p>
                <p className="text-3xl font-black text-gray-900">{analytics?.totalOrders || 0}</p>
                <p className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Life Time</p>
              </Card>
            </div>

            {/* ORDER HISTORY */}
            <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-gray-50">
                <div className="flex justify-between items-center text-gray-900">
                  <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" /> Logged Events
                  </CardTitle>
                  <Link href="/pharmacy/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer">Archive</Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {pastOrders.length > 0 ? pastOrders.map((order) => (
                    <div key={order._id} className="px-6 py-5 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-base text-gray-900">{order.orderId}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">₹{order.total}</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 block ${order.status === 'delivered' ? 'text-green-600' : 'text-red-500'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center">
                       <p className="text-gray-300 font-bold uppercase text-[10px] tracking-[0.2em]">Empty History</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
