'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const orders = [
    { id: 'ORD001', user: 'John Doe', pharmacy: 'Apollo', amount: 450, status: 'delivered', date: '2024-02-20' },
    { id: 'ORD002', user: 'Jane Smith', pharmacy: 'MedPlus', amount: 320, status: 'pending', date: '2024-02-21' },
    { id: 'ORD003', user: 'Mike Johnson', pharmacy: 'Guardian', amount: 580, status: 'delivered', date: '2024-02-21' },
    { id: 'ORD004', user: 'Sarah Williams', pharmacy: 'Apollo', amount: 275, status: 'cancelled', date: '2024-02-20' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Monitor all platform orders</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left p-4 font-semibold">Order ID</th>
              <th className="text-left p-4 font-semibold">User</th>
              <th className="text-left p-4 font-semibold">Pharmacy</th>
              <th className="text-left p-4 font-semibold">Amount</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Date</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-primary/5 hover:bg-primary/5">
                <td className="p-4 font-medium">{order.id}</td>
                <td className="p-4">{order.user}</td>
                <td className="p-4">{order.pharmacy}</td>
                <td className="p-4 font-semibold">₹{order.amount}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                <td className="p-4">
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
