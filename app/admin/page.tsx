'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingCart, DollarSign, Activity, 
  Bike, TrendingUp, Package, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, LayoutDashboard,
  Building2, MapPin, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';

interface DashboardData {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalPharmacies: number;
    totalRiders: number;
    activeRiders: number;
    orderFulfillmentRate: string;
    pendingPharmacies: number;
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

    const chartData = [
      { name: 'Mon', revenue: 4000, orders: 24 },
      { name: 'Tue', revenue: 3000, orders: 18 },
      { name: 'Wed', revenue: 2000, orders: 29 },
      { name: 'Thu', revenue: 2780, orders: 20 },
      { name: 'Fri', revenue: 1890, orders: 15 },
      { name: 'Sat', revenue: 2390, orders: 25 },
      { name: 'Sun', revenue: 3490, orders: 32 },
    ];

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
        value: `₹${data?.totalRevenue?.toLocaleString()}`, 
        icon: DollarSign, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50',
        trend: '+12.5%',
        up: true
      },
      { 
        title: 'Total Orders', 
        value: data?.totalOrders, 
        icon: ShoppingCart, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        trend: '+8.2%',
        up: true
      },
      { 
        title: 'Active Riders', 
        value: `${data?.activeRiders}/${data?.totalRiders}`, 
        icon: Bike, 
        color: 'text-primary', 
        bg: 'bg-primary/5',
        trend: '94% Active',
        up: true
      },
      { 
        title: 'Active Shops', 
        value: data?.totalPharmacies, 
        icon: Building2, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        trend: `${data?.pendingPharmacies} Pending`,
        up: false
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
                               <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg ${kpi.up ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                  {kpi.trend}
                               </div>
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
                           <div className="flex gap-2">
                              {['7D', '1M', '1Y'].map(t => (
                                <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${t === '7D' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{t}</button>
                              ))}
                           </div>
                        </div>
                        <div className="h-[350px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
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
                                 />
                                 <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* RIGHT PANEL: Stats & Recent */}
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
                                 <div className="h-full bg-primary" style={{width: data?.orderFulfillmentRate}}></div>
                              </div>
                           </div>
                        </Card>

                        <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm overflow-hidden">
                           <CardHeader className="px-8 pt-8 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                              <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-3">
                                 <Users className="w-5 h-5 text-primary" /> Recent Riders
                              </CardTitle>
                              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-[9px]">View All</Badge>
                           </CardHeader>
                           <CardContent className="p-0">
                              <div className="divide-y divide-gray-50">
                                 {[1,2,3].map((_, i) => (
                                    <div key={i} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                       <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                          <Bike className="w-5 h-5 text-gray-400" />
                                       </div>
                                       <div>
                                          <p className="font-bold text-gray-900 text-sm">Rahul Sharma</p>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mumbai Central • Active</p>
                                       </div>
                                       <div className="ml-auto text-right">
                                          <p className="text-xs font-black text-emerald-600">₹850</p>
                                          <div className="flex gap-0.5 mt-1">
                                             {[1,2,3,4,5].map(s => <div key={s} className="w-1 h-1 rounded-full bg-amber-400" />)}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>

                    </div>

                </div>
            </div>
        </div>
    );
}
