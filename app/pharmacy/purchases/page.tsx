'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Plus, Search, Filter, 
  Calendar, FileText, CheckCircle2, 
  Clock, IndianRupee, ArrowUpRight, 
  PackageCheck, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import ApiClient from '@/lib/api';
import { format } from 'date-fns';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPurchases();
  }, [filter]);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.getPurchases(filter !== 'all' ? { status: filter } : undefined);
      if (res.data) setPurchases(res.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceive = async (id: string) => {
    if (!confirm('Mark this order as received and update inventory?')) return;
    try {
      await ApiClient.receivePurchase(id);
      fetchPurchases();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to receive order');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3">Received</Badge>;
      case 'ordered':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3">Ordered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-3">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Fully Paid</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Partial Payment</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Payment Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Management</h1>
          <p className="text-gray-500">Track inventory orders, manage restocking, and handle supplier payments.</p>
        </div>
        <Link href="/pharmacy/purchases/new">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Create Purchase Order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Orders</p>
                <p className="text-2xl font-bold">{purchases.filter(p => p.status === 'ordered').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
                <p className="text-2xl font-bold">₹{purchases.reduce((sum, p) => sum + p.balanceAmount, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Stock Received</p>
                <p className="text-2xl font-bold">{purchases.filter(p => p.status === 'received').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
        <Button 
          variant={filter === 'all' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setFilter('all')}
          className="rounded-xl px-6"
        >
          All History
        </Button>
        <Button 
          variant={filter === 'ordered' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setFilter('ordered')}
          className="rounded-xl px-6"
        >
          In Transit
        </Button>
        <Button 
          variant={filter === 'received' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setFilter('received')}
          className="rounded-xl px-6"
        >
          Received
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Supplier</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Items</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Financials</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchases.map((purchase) => (
                <tr key={purchase._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{purchase.purchaseId}</span>
                      <span className="text-xs text-gray-500 font-medium">{format(new Date(purchase.orderDate), 'dd MMM yyyy, hh:mm a')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{purchase.supplierId?.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-500 font-medium">{purchase.supplierId?.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{purchase.items.length} Medicines</span>
                      <span className="text-xs text-gray-500 font-medium max-w-[150px] truncate">
                        {purchase.items.map((i: any) => i.medicineName).join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <p className="font-black text-gray-900">₹{purchase.totalAmount.toLocaleString()}</p>
                      {getPaymentBadge(purchase.paymentStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(purchase.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {purchase.status === 'ordered' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleReceive(purchase._id)}
                        className="rounded-xl border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 font-bold"
                      >
                        Receive Stock
                      </Button>
                    )}
                    {purchase.status === 'received' && (
                       <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {purchases.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No purchase history found</p>
          </div>
        )}
      </div>
    </div>
  );
}
