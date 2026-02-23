'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jan', users: 400, orders: 240, revenue: 24000 },
  { month: 'Feb', users: 620, orders: 420, revenue: 42000 },
  { month: 'Mar', users: 890, orders: 580, revenue: 58000 },
  { month: 'Apr', users: 1200, orders: 750, revenue: 75000 },
  { month: 'May', users: 1600, orders: 920, revenue: 92000 },
  { month: 'Jun', users: 2000, orders: 1200, revenue: 120000 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-primary mt-2">2,450</p>
                <p className="text-xs text-green-600 mt-2">+15% this month</p>
              </div>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-primary mt-2">4,850</p>
                <p className="text-xs text-green-600 mt-2">+22% this month</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-primary mt-2">₹24.5L</p>
                <p className="text-xs text-green-600 mt-2">+18% this month</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Pharmacies</p>
                <p className="text-3xl font-bold text-primary mt-2">156</p>
                <p className="text-xs text-green-600 mt-2">+8 this month</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="users" fill="var(--primary)" name="Users" />
              <Bar dataKey="orders" fill="var(--accent)" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Pharmacies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Apollo Pharmacy', orders: 450 },
                { name: 'MedPlus', orders: 380 },
                { name: 'Guardian', orders: 320 },
              ].map((pharmacy, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
                  <p className="font-medium">{pharmacy.name}</p>
                  <p className="text-primary font-semibold">{pharmacy.orders} orders</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Paracetamol', count: 1250 },
                { name: 'Aspirin', count: 980 },
                { name: 'Vitamin D', count: 850 },
              ].map((medicine, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
                  <p className="font-medium">{medicine.name}</p>
                  <p className="text-primary font-semibold">{medicine.count} sold</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
