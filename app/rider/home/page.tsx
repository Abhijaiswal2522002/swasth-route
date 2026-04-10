'use client';

import React from 'react';
import { useRider } from '@/lib/contexts/RiderContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Power, Navigation, Package } from 'lucide-react';

export default function RiderHomePage() {
  const { profile, isOnline, activeOrder, handleToggleOnline } = useRider();
  const router = useRouter();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-[2rem] border-0 bg-white shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Earnings</p>
          <h3 className="text-2xl font-black text-zinc-900">₹{profile?.totalEarnings || 0}</h3>
        </Card>
        <Card className="rounded-[2rem] border-0 bg-white shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Rating</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-zinc-900">{profile?.rating?.toFixed(1) || '5.0'}</h3>
            <Award className="w-4 h-4 text-primary" />
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS / STATUS */}
      {!isOnline && (
        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-primary/10">
            <Power className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-zinc-900">Ready to earn?</h3>
          <p className="text-xs font-bold text-zinc-500 max-w-xs mx-auto">Switch to online to start receiving medicine delivery requests in your area.</p>
          <Button
            onClick={() => handleToggleOnline(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]"
          >
            Go Online Now
          </Button>
        </div>
      )}

      {isOnline && !activeOrder && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-emerald-100">
            <Navigation className="w-8 h-8 text-emerald-500 " />
          </div>
          <h3 className="text-xl font-black text-zinc-900">Scanning for Orders</h3>
          <p className="text-xs font-bold text-zinc-500 max-w-xs mx-auto">Stay near pharmacy hotspots to increase your chances of getting a request.</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Search Zone</span>
          </div>
        </div>
      )}

      {/* ACTIVE ORDER (Condensed version on Home) */}
      {activeOrder && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest px-2">Current Task</h3>
          <Card className="rounded-[2rem] border-0 shadow-lg shadow-primary/5 overflow-hidden">
            <div className="bg-zinc-900 px-6 py-3 flex justify-between items-center text-white">
              <span className="text-[8px] font-black uppercase tracking-widest">Live Delivery</span>
              <Badge className="bg-primary/20 text-primary border-0 rounded-lg text-[8px]">{activeOrder.status.replace('_', ' ')}</Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0">
                  <Package className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-black text-zinc-900">{activeOrder.pharmacyId?.name}</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">{activeOrder.pharmacyId?.address?.street}</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/rider/map')}
                className="w-full mt-6 h-12 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[9px]"
              >
                Navigate on Map
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
