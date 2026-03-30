'use client';

import { Button } from '@/components/ui/button';
import { Search, MoreVertical } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ApiClient from '@/lib/api';

interface Order {
  _id: string;
  userId: { name: string; phone: string };
  pharmacyId: { name: string; phone: string };
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ApiClient.getAllOrders();

        if (res.error) {
          console.error(res.error);
        } else {
          setOrders(res.data as Order[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pharmacyId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Monitor all platform orders</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Pharmacy</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{order.userId?.name}</p>
                    <p className="text-xs text-gray-500">{order.userId?.phone}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-medium">{order.pharmacyId?.name}</p>
                    <p className="text-xs text-gray-500">{order.pharmacyId?.phone}</p>
                  </td>

                  <td className="p-4 font-semibold">₹{order.total}</td>

                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
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
