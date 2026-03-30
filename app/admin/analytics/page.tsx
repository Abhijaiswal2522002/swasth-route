'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import ApiClient from '@/lib/api';

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activePharmacies: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await ApiClient.getAdminAnalytics();

        if (res.error) {
          console.error(res.error);
        } else {
          const d = res.data as any;

          setData({
            totalUsers: d.totalUsers,
            totalOrders: d.totalOrders,
            totalRevenue: d.totalRevenue,
            activePharmacies: d.activePharmacies,
          });

          // Fake monthly breakdown from totals (until backend supports real analytics)
          setChartData([
            { name: 'Users', value: d.totalUsers },
            { name: 'Orders', value: d.totalOrders },
            { name: 'Revenue', value: d.totalRevenue },
          ]);
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
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{data?.totalUsers}</p>
            </div>
            <Users className="w-6 h-6 text-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold">{data?.totalOrders}</p>
            </div>
            <ShoppingCart className="w-6 h-6 text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">₹{data?.totalRevenue}</p>
            </div>
            <DollarSign className="w-6 h-6 text-yellow-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pharmacies</p>
              <p className="text-2xl font-bold">{data?.activePharmacies}</p>
            </div>
            <BarChart3 className="w-6 h-6 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
