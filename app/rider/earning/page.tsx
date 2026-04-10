'use client';

import React from 'react';
import { useRider } from '@/lib/contexts/RiderContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package } from 'lucide-react';

export default function RiderEarningsPage() {
  const { profile, earningsHistory } = useRider();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <Card className="rounded-[2.5rem] border-0 bg-zinc-900 text-white p-8 overflow-hidden relative shadow-2xl">
        <DollarSign className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">Total Balance</p>
        <h3 className="text-5xl font-black tracking-tighter mb-8">₹{profile?.totalEarnings || 0}</h3>
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Deliveries</p>
            <p className="text-xl font-black">{earningsHistory.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Today</p>
            <p className="text-xl font-black">₹{earningsHistory.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).reduce((acc, curr) => acc + curr.amount, 0)}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest px-2">History</h3>
        {earningsHistory.length > 0 ? (
          <div className="space-y-3">
            {earningsHistory.map((e, idx) => (
              <div key={idx} className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between border border-zinc-50 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                    <Package className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-black text-zinc-800 text-sm">₹{e.amount}</p>
                    <p className="text-[9px] font-bold text-zinc-400 mt-0.5 uppercase tracking-widest">{new Date(e.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-0 rounded-lg text-[8px] font-black uppercase">Settled</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center opacity-30">
            <p className="font-black text-[10px] uppercase tracking-widest">No Earnings yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

