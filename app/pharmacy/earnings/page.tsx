'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Package, Award, RefreshCw, ArrowUpRight, ArrowDownRight, IndianRupee, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ApiClient from '@/lib/api';

export default function EarningsPage() {
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEarningsData();
    }
  }, [user]);

  const fetchEarningsData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        ApiClient.getPharmacyAnalytics(),
        ApiClient.getPharmacyOrders('delivered')
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data as any);
      if (ordersRes.data) setRecentOrders((ordersRes.data as any[]).slice(0, 10));
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && !analytics)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Calculating financial metrics...</p>
      </div>
    );
  }

  // Generate chart data from recent orders or analytics
  const chartData = [
    { name: 'Mon', revenue: 0 },
    { name: 'Tue', revenue: 0 },
    { name: 'Wed', revenue: 0 },
    { name: 'Thu', revenue: 0 },
    { name: 'Fri', revenue: 0 },
    { name: 'Sat', revenue: 0 },
    { name: 'Sun', revenue: analytics?.totalRevenue || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in duration-700 px-1">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">Revenue Ledger</h1>
          <p className="text-gray-500 font-medium max-w-lg italic">Comprehensive fiscal oversight of payouts, platform commissions, and gross liquidity.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Cycle End</p>
            <p className="text-xs font-black text-gray-900 uppercase">31 Mar 2026</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{analytics?.totalRevenue || 0}</p>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
              <ArrowUpRight className="w-4 h-4" /> 12% vs last week
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Payout</p>
                <p className="text-3xl font-black text-green-600 tracking-tighter">₹{Math.floor((analytics?.totalRevenue || 0) * (1 - (analytics?.commissionRate || 10) / 100))}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              After 10% Platform Fee
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fulfillment</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{analytics?.deliveredOrders || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
              {analytics?.deliveredOrders > 0 ? 'Consistent Velocity' : 'Awaiting Deliveries'}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trust Index</p>
                <p className="text-3xl font-black text-amber-500 tracking-tighter">{analytics?.averageRating?.toFixed(1) || '5.0'}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1 w-4 rounded-full ${i <= Math.round(analytics?.averageRating || 5) ? 'bg-amber-400' : 'bg-gray-100'}`} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Chart */}
        <div className="lg:col-span-8">
          <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white h-full flex flex-col">
            <CardHeader className="p-8 pb-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-black text-gray-900 tracking-tight uppercase">Cash Velocity</CardTitle>
                <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest">Weekly Analytics</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-10 flex-1">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b8a4f" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0b8a4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{
                      color: '#0b8a4f',
                      fontWeight: 900,
                      fontSize: '12px',
                      textTransform: 'uppercase'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0b8a4f"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#0b8a4f' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-4">
          <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-xl font-black text-gray-900 tracking-tight uppercase">Recent Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-gray-50 h-full">
                {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                  <div key={order._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <ArrowUpRight size={18} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-900 uppercase tracking-tight">{order.orderId}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">₹{order.total}</p>
                      <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Settled</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-200">
                      <FileText size={32} />
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No settled payouts yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
