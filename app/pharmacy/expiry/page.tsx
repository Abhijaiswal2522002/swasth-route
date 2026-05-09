'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, Calendar, Package, 
  Trash2, ArrowRight, Clock, 
  CheckCircle2, RefreshCw, FileWarning 
} from 'lucide-react';
import ApiClient from '@/lib/api';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export default function ExpiryManagementPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExpiryData();
  }, []);

  const fetchExpiryData = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.getExpiryAlerts();
      if (res.data) setData(res.data);
    } catch (error) {
      console.error('Error fetching expiry data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryStatus = (date: string) => {
    const expiryDate = new Date(date);
    if (isPast(expiryDate)) {
      return { label: 'Expired', color: 'bg-red-100 text-red-700', icon: Trash2 };
    }
    return { label: 'Near Expiry', color: 'bg-amber-100 text-amber-700', icon: Clock };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expiry Management</h1>
          <p className="text-gray-500 font-medium mt-1">Monitor stock shelf life and prevent dispensing expired medicines.</p>
        </div>
        <Button onClick={fetchExpiryData} variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold border-gray-200">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl shadow-red-500/5 bg-red-50/30 overflow-hidden rounded-[2.5rem]">
          <CardHeader className="p-8 pb-0">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-black text-red-900">Expired Stock</CardTitle>
            <p className="text-red-600/60 text-sm font-bold uppercase tracking-widest mt-1">Requires immediate disposal</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-5xl font-black text-red-700 mb-2">{data?.summary?.expiredCount || 0}</div>
            <p className="text-sm text-red-600/70 font-medium">Unique medicine batches found that have passed their expiry date.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-amber-500/5 bg-amber-50/30 overflow-hidden rounded-[2.5rem]">
          <CardHeader className="p-8 pb-0">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-black text-amber-900">Near Expiry</CardTitle>
            <p className="text-amber-600/60 text-sm font-bold uppercase tracking-widest mt-1">Expiring within 30 days</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-5xl font-black text-amber-700 mb-2">{data?.summary?.nearExpiryCount || 0}</div>
            <p className="text-sm text-amber-600/70 font-medium">Critical items that should be sold first or marked for return.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" /> Comprehensive Audit Report
          </h2>
          <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest bg-white border-gray-100">
            Total { (data?.expired?.length || 0) + (data?.nearExpiry?.length || 0) } Items
          </Badge>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Medicine & Batch</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Expiry Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Time Remaining</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inventory</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...(data?.expired || []), ...(data?.nearExpiry || [])].map((item, idx) => {
                  const status = getExpiryStatus(item.expiryDate);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 text-base">{item.medicineName}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Batch: {item.batchNumber}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-gray-700">{format(new Date(item.expiryDate), 'dd MMM yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={`${status.color} border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {isPast(new Date(item.expiryDate)) ? 'Expired' : formatDistanceToNow(new Date(item.expiryDate), { addSuffix: true })}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900">{item.quantity} Units</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Stock</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                          {isPast(new Date(item.expiryDate)) ? 'Remove Stock' : 'Discount Batch'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          { (!data?.expired?.length && !data?.nearExpiry?.length) && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Shelf Life Optimal</h3>
              <p className="text-gray-500 font-medium">All stocked medicine batches are within their safe utilization period.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-primary/5 rounded-[3rem] p-10 border border-primary/10 flex flex-col md:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-primary/10 flex items-center justify-center text-primary shrink-0">
          <FileWarning className="w-10 h-10" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-black text-gray-900 mb-2">Automated Compliance Monitoring</h3>
          <p className="text-gray-500 font-medium leading-relaxed">
            SwasthRoute automatically scans your batch inventory every 24 hours. Medicines nearing their expiry will be flagged here and notified to the store manager.
          </p>
        </div>
        <Button className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
          Generate Full Report
        </Button>
      </div>
    </div>
  );
}
