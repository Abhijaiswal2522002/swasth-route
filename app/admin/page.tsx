'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingCart, DollarSign, Activity, 
  Bike, TrendingUp, Package, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, LayoutDashboard,
  Building2, MapPin, RefreshCw, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface RecentRider {
  _id: string;
  name: string;
  phone: string;
  vehicleType: string;
  status: string;
  rating: number;
  totalEarnings: number;
}

interface DashboardData {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalPharmacies: number;
    totalRiders: number;
    activeRiders: number;
    orderFulfillmentRate: string;
    pendingPharmacies: number;
    revenueTrend: string;
    ordersTrend: string;
    revenueChart: { name: string; revenue: number; orders: number }[];
    recentRiders: RecentRider[];
}

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  busy: 'bg-blue-100 text-blue-700',
  offline: 'bg-gray-100 text-gray-500',
};

function TrendBadge({ trend, label }: { trend: string; label?: string }) {
  const value = parseFloat(trend);
  const isUp = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {label ?? `${isUp ? '+' : ''}${trend}%`}
    </div>
  );
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await ApiClient.getAdminAnalytics();
                if (!res.error) {
                    setData(res.data as DashboardData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
          <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Syncing platform analytics...</p>
          </div>
        );
    }

    const kpis = [
      { 
        title: 'Total Revenue', 
        value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, 
        icon: DollarSign, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50',
        trend: data?.revenueTrend ?? '0',
        trendLabel: undefined,
        up: parseFloat(data?.revenueTrend ?? '0') >= 0,
      },
      { 
        title: 'Total Orders', 
        value: data?.totalOrders ?? 0, 
        icon: ShoppingCart, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        trend: data?.ordersTrend ?? '0',
        trendLabel: undefined,
        up: parseFloat(data?.ordersTrend ?? '0') >= 0,
      },
      { 
        title: 'Active Riders', 
        value: `${data?.activeRiders ?? 0}/${data?.totalRiders ?? 0}`, 
        icon: Bike, 
        color: 'text-primary', 
        bg: 'bg-primary/5',
        trend: data?.totalRiders ? `${Math.round(((data?.activeRiders ?? 0) / data?.totalRiders) * 100)}%` : '0%',
        trendLabel: data?.totalRiders ? `${Math.round(((data?.activeRiders ?? 0) / data?.totalRiders) * 100)}% Active` : 'No Riders',
        up: true,
      },
      { 
        title: 'Active Shops', 
        value: data?.totalPharmacies ?? 0, 
        icon: Building2, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        trend: '0',
        trendLabel: `${data?.pendingPharmacies ?? 0} Pending`,
        up: false,
      }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                           <LayoutDashboard className="w-10 h-10 text-primary" />
                           Platform Control
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">Global performance metrics for SwasthRoute</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-gray-200">Export Reports</Button>
                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] border-0 shadow-xl">Real-time Map</Button>
                    </div>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, i) => (
                      <Card key={i} className="border-0 shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300">
                         <CardContent className="p-7">
                            <div className="flex justify-between items-start mb-4">
                               <div className={`w-14 h-14 ${kpi.bg} rounded-2xl flex items-center justify-center border border-transparent group-hover:scale-110 transition-transform`}>
                                  <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                               </div>
                               <TrendBadge trend={kpi.trend} label={kpi.trendLabel} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.title}</p>
                               <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{kpi.value}</h2>
                            </div>
                         </CardContent>
                      </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* CHART AREA */}
                    <Card className="lg:col-span-8 border-0 shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-8">
                        <div className="flex items-center justify-between mb-8">
                           <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 lowercase">
                              <TrendingUp className="w-6 h-6 text-primary" />
                              Revenue Trajectory
                           </h3>
                           <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-[9px] px-3 py-1">Last 7 Days</Badge>
                        </div>
                        <div className="h-[350px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={data?.revenueChart ?? []}>
                                 <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} dy={10} />
                                 <YAxis hide />
                                 <Tooltip 
                                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight:900}} 
                                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                                 />
                                 <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* RIGHT PANEL */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        <Card className="rounded-[2.5rem] border-0 bg-zinc-900 text-white p-8 shadow-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-10">
                              <CheckCircle2 className="w-32 h-32 text-primary" />
                           </div>
                           <div className="relative z-10">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">Fulfillment Rate</p>
                              <h3 className="text-6xl font-black mb-6 tracking-tighter">{data?.orderFulfillmentRate}</h3>
                              <p className="text-xs font-medium text-white/60 leading-relaxed mb-6">Percentage of orders successfully delivered against total placed orders platform-wide.</p>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary transition-all duration-700" style={{width: data?.orderFulfillmentRate}}></div>
                              </div>
                           </div>
                        </Card>

                        {/* RECENT RIDERS - REAL DATA */}
                        <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm overflow-hidden">
                           <CardHeader className="px-8 pt-8 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                              <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-3">
                                 <Users className="w-5 h-5 text-primary" /> Recent Riders
                              </CardTitle>
                              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-[9px] cursor-pointer hover:bg-primary/20 transition-colors">View All</Badge>
                           </CardHeader>
                           <CardContent className="p-0">
                              <div className="divide-y divide-gray-50">
                                 {(data?.recentRiders ?? []).length === 0 ? (
                                   <p className="px-8 py-6 text-sm text-gray-400 text-center">No riders yet</p>
                                 ) : (
                                   (data?.recentRiders ?? []).map((rider) => (
                                      <div key={rider._id} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                         <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            <Bike className="w-5 h-5 text-gray-400" />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm truncate">{rider.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                                              {rider.vehicleType} •{' '}
                                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${STATUS_COLORS[rider.status] ?? 'bg-gray-100 text-gray-400'}`}>
                                                {rider.status}
                                              </span>
                                            </p>
                                         </div>
                                         <div className="ml-auto text-right shrink-0">
                                            <p className="text-xs font-black text-emerald-600">₹{(rider.totalEarnings || 0).toLocaleString('en-IN')}</p>
                                            <div className="flex items-center gap-0.5 mt-1 justify-end">
                                               <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                               <span className="text-[9px] font-black text-gray-400">{(rider.rating ?? 5).toFixed(1)}</span>
                                            </div>
                                         </div>
                                      </div>
                                   ))
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
