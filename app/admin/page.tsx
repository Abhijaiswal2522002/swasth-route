'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Users, Store, ShoppingCart,
  TrendingUp, LogOut, AlertCircle, RefreshCcw,
  ChevronRight, ArrowUpRight, Wallet, Clock,
  Activity, Plus, Search, Settings, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiClient from '@/lib/api';
import AuthManager from '@/lib/auth';

interface AdminAnalytics {
  totalUsers: number;
  totalPharmacies: number;
  activePharmacies: number;
  totalOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  pendingPharmacies: number;
  orderFulfillmentRate: string;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiClient.getAdminAnalytics();
      if (response.error) {
        setError(response.error);
      } else {
        setAnalytics(response.data as AdminAnalytics);
      }
    } catch (err) {
      setError('Failed to load real-time analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleLogout = () => {
    AuthManager.logout();
    window.location.href = '/admin/auth';
  };

  if (isLoading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-none">Admin Console</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">SwasthRoute Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAnalytics}
                className="hidden sm:flex items-center gap-2 border-slate-200 hover:bg-slate-50 rounded-full px-4"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
              >

              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
            <p className="text-lg text-slate-500 mt-1">Real-time platform performance and management metrics.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <Clock className="h-4 w-4" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-900">System Sync Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={analytics?.totalUsers || 0}
            icon={<Users className="h-6 w-6" />}
            trend="+12% from last month"
            color="blue"
          />
          <StatCard
            title="Pharmacies"
            value={analytics?.activePharmacies || 0}
            icon={<Store className="h-6 w-6" />}
            trend={`${analytics?.pendingPharmacies || 0} pending registration`}
            color="indigo"
          />
          <StatCard
            title="Processed Orders"
            value={analytics?.totalOrders || 0}
            icon={<ShoppingCart className="h-6 w-6" />}
            trend={`${analytics?.orderFulfillmentRate || '0%'} Success Rate`}
            color="emerald"
          />
          <StatCard
            title="Gross Revenue"
            value={`₹${analytics?.totalRevenue?.toLocaleString() || 0}`}
            icon={<Wallet className="h-6 w-6" />}
            trend="+8.4% since yesterday"
            color="violet"
          />
        </div>

        {/* Management Interface */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Primary Actions Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <ManagementCard
                title="Pharmacy Network"
                description="Onboard, verify, and monitor pharmacy partners."
                count={analytics?.activePharmacies || 0}
                subText={`${analytics?.pendingPharmacies || 0} requests awaiting review`}
                href="/admin/pharmacies"
                icon={<Store className="h-10 w-10 text-blue-600" />}
                buttonText="Manage Network"
                color="blue"
              />
              <ManagementCard
                title="Patient Directory"
                description="Monitor user activity and manage patient accounts."
                count={analytics?.totalUsers || 0}
                subText="98.2% account health score"
                href="/admin/users"
                icon={<Users className="h-10 w-10 text-emerald-600" />}
                buttonText="User Database"
                color="emerald"
              />
            </div>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 px-8 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Platform Performance
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50 rounded-full">
                    Full Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-8 py-8">
                <div className="h-[200px] w-full flex items-end justify-between gap-2 px-2">
                  {[35, 45, 30, 60, 48, 70, 55, 80, 65, 90, 75, 85].map((h, i) => (
                    <div key={i} className="flex-1 space-y-2">
                      <div
                        className="w-full bg-blue-100 rounded-lg hover:bg-blue-500 transition-all duration-500 cursor-pointer"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between text-xs font-bold text-slate-400 px-2 uppercase tracking-tighter">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Nov</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Info Column */}
          <div className="space-y-8">
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="bg-white/10 p-3 rounded-2xl w-fit mb-6">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Revenue Growth</h3>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Platform commissions and transaction fees for the current billing cycle.
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-medium opacity-80">Platform Share</span>
                    <span className="text-3xl font-black">₹{((analytics?.totalRevenue || 0) * 0.1).toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[65%]" />
                  </div>
                  <p className="text-xs font-bold opacity-60">Goal: ₹1,00,000 this month</p>
                </div>
                <Button className="w-full mt-8 bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 rounded-2xl">
                  Financial Insights
                </Button>
              </CardContent>
            </Card>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-slate-800">Quick Actions</h4>
                <Activity className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-3">
                <QuickActionItem icon="plus" label="Add New Pharmacy" />
                <QuickActionItem icon="search" label="Lookup Order" />
                <QuickActionItem icon="settings" label="Configure Rates" />
                <QuickActionItem icon="mail" label="Broadcast Alert" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${colors[color]} border`}>
            {icon}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
            Realtime
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
          <p className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-2">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ManagementCard({ title, description, count, subText, icon, buttonText, color, href }: any) {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
      <CardContent className="p-8">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{description}</p>

        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-3xl font-black text-slate-900">{count}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subText}</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Button
          className="w-full bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white font-bold py-6 rounded-2xl transition-all border-none"
          onClick={() => window.location.href = href}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

function QuickActionItem({ icon, label }: any) {
  const IconComponent = () => {
    switch (icon) {
      case 'plus': return <Plus className="h-4 w-4" />;
      case 'search': return <Search className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      case 'mail': return <Mail className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
      <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
          <IconComponent />
        </div>
        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900" />
    </button>
  );
}

