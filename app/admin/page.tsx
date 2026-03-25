'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Store, ShoppingCart, TrendingUp, LogOut, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await ApiClient.getAdminAnalytics();
        if (response.error) {
          setError(response.error);
        } else {
          setAnalytics(response.data as AdminAnalytics);
        }
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const handleLogout = () => {
    AuthManager.logout();
    window.location.href = '/admin/auth';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                <Users className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{analytics?.totalUsers || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Pharmacies</span>
                <Store className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{analytics?.activePharmacies || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {analytics?.pendingPharmacies || 0} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                <ShoppingCart className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{analytics?.totalOrders || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {analytics?.orderFulfillmentRate || '0%'} fulfilled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">₹{analytics?.totalRevenue || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Gross revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pharmacy Management */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Pharmacy Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Active Pharmacies</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.activePharmacies || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">{analytics?.pendingPharmacies || 0}</p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Review Pharmacies
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.totalUsers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Active This Month</p>
                <p className="text-2xl font-bold text-green-600">Coming soon</p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* Order Analytics */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Order Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.totalOrders || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fulfillment Rate</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.orderFulfillmentRate || '0%'}</p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                View Orders
              </Button>
            </CardContent>
          </Card>

          {/* Revenue & Commission */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue & Commission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">₹{analytics?.totalRevenue || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Commission</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{((analytics?.totalRevenue || 0) * 0.1).toFixed(0)}
                </p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Revenue Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
