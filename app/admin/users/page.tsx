'use client';

import { Button } from '@/components/ui/button';
import { Search, MoreVertical } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ApiClient from '@/lib/api';

// ✅ Type for User
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  totalOrders?: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ✅ Using ApiClient instead of axios
        const response = await ApiClient.getAllUsers();

        if (response.error) {
          console.error(response.error);
        } else {
          const filtered = (response.data as User[]).filter(
            (u) => u.role === 'user'
          );
          setUsers(filtered);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    const orders = users.reduce((sum, u) => sum + (u.totalOrders || 0), 0);
    return { total, active, inactive, orders };
  }, [users]);

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      // ✅ Using ApiClient
      const response = isActive
        ? await ApiClient.deactivateUser(id)
        : await ApiClient.reactivateUser(id);

      if (response.error) {
        console.error(response.error);
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, isActive: !isActive } : u
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white shadow">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white shadow">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white shadow">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white shadow">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{stats.orders}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No users found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Orders</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>

                  <td className="p-4">{user.phone}</td>

                  <td className="p-4 font-medium">{user.totalOrders || 0}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="p-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={user.isActive ? 'destructive' : 'default'}
                      onClick={() => toggleStatus(user._id, user.isActive)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>

                    <Button size="icon" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
