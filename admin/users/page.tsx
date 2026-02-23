'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, Block, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 1, name: 'John Doe', phone: '9876543210', orders: 5, status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', phone: '9876543211', orders: 12, status: 'active', joined: '2024-01-10' },
    { id: 3, name: 'Mike Johnson', phone: '9876543212', orders: 0, status: 'inactive', joined: '2024-02-01' },
    { id: 4, name: 'Sarah Williams', phone: '9876543213', orders: 8, status: 'active', joined: '2023-12-20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage app users</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Phone</th>
              <th className="text-left p-4 font-semibold">Orders</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Joined</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-primary/5 hover:bg-primary/5">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4">{user.phone}</td>
                <td className="p-4">{user.orders}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{user.joined}</td>
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
