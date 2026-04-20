'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, BarChart3, TrendingUp, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import ApiClient from '@/lib/api';

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalPharmacies: number;
  totalRiders: number;
  revenueChart: { name: string; revenue: number; orders: number }[];
  orderFulfillmentRate: string;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await ApiClient.getAdminAnalytics();

        if (res.error) {
          console.error(res.error);
        } else {
          setData(res.data as DashboardData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center animate-pulse">
        <p className="text-muted-foreground font-medium">Aggregating platform intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50/30 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Analytics Hub</h1>
          <p className="text-muted-foreground font-medium mt-1">Deep-dive into platform performance & trajectories</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Data Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: data?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Platform Orders', value: data?.totalOrders, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Gross Revenue', value: `₹${data?.totalRevenue?.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Shops', value: data?.totalPharmacies, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((kpi, i) => (
          <Card key={i} className="border-0 shadow-sm rounded-[2rem] overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-8">
          <CardHeader className="p-0 mb-8 border-0">
             <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3 lowercase">
                   <TrendingUp className="w-6 h-6 text-primary" />
                   Revenue Growth (7D)
                </CardTitle>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase">Revenue</span>
                   </div>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueChart ?? []}>
                  <defs>
                    <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 900}}
                    formatter={(val) => [`₹${val?.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRevenueAnalytics)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Meta Stats */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-0 bg-zinc-900 text-white p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-white/10">
                   <Package className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white/70">Fulfillment</h3>
             </div>
             <div className="space-y-2 mb-8">
                <h2 className="text-5xl font-black tracking-tighter">{data?.orderFulfillmentRate}</h2>
                <p className="text-xs font-medium text-white/40">Real-time order success ratio</p>
             </div>
             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-primary transition-all duration-1000 ease-out" 
                   style={{width: data?.orderFulfillmentRate}}
                />
             </div>
          </Card>

          <Card className="rounded-[2.5rem] border-0 bg-white p-8 shadow-sm">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-primary" /> Daily Orders
             </h3>
             <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data?.revenueChart ?? []}>
                      <XAxis dataKey="name" hide />
                      <Tooltip 
                         contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px'}}
                         formatter={(val) => [val, 'Orders']}
                      />
                      <Area type="step" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.1} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 text-center">Volume over week</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
