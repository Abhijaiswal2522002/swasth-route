'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Package, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mon', earnings: 1200 },
  { date: 'Tue', earnings: 1900 },
  { date: 'Wed', earnings: 1600 },
  { date: 'Thu', earnings: 2100 },
  { date: 'Fri', earnings: 2400 },
  { date: 'Sat', earnings: 3200 },
  { date: 'Sun', earnings: 2800 },
];

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your revenue and commission</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Earnings</p>
                <p className="text-3xl font-bold text-primary mt-2">₹2,800</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold text-primary mt-2">₹45,600</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-3xl font-bold text-primary mt-2">156</p>
              </div>
              <Package className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-3xl font-bold text-primary mt-2">4.8/5</p>
              </div>
              <Award className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-primary/5 last:border-0">
                <div>
                  <p className="font-medium">Order #{1001 + i}</p>
                  <p className="text-sm text-muted-foreground">2 medicines</p>
                </div>
                <p className="font-bold text-primary">+₹450</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
