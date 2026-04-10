'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRider } from '@/lib/contexts/RiderContext';
import { Bike, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RiderDashboardRoot() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: riderLoading, isRegistering, handleRegister } = useRider();

  const [regData, setRegData] = useState({
    vehicleType: 'bike',
    vehicleNumber: ''
  });

  useEffect(() => {
    if (!authLoading && user && user.role === 'rider') {
      router.replace('/rider/home');
    }
  }, [user, authLoading, router]);

  if (authLoading || (riderLoading && user?.role === 'rider')) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Rider Module...</p>
      </div>
    );
  }

  // Registration View for non-riders
  if (user && user.role !== 'rider') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10">
        <Card className="max-w-md w-full rounded-[2.5rem] border-0 shadow-2xl overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-primary p-8 text-white flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Bike className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black">Become a Delivery Partner</h1>
              <p className="text-sm text-white/70 mt-1">Earn on every delivery, join the team!</p>
            </div>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-1">Select Vehicle</label>
                <div className="grid grid-cols-2 gap-3">
                  {['bike', 'scooter'].map(t => (
                    <button
                      key={t}
                      onClick={() => setRegData({ ...regData, vehicleType: t })}
                      className={`py-3 rounded-2xl border-2 font-bold text-sm capitalize transition-all ${
                        regData.vehicleType === t ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-100 text-zinc-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-1">Vehicle License Plate</label>
                <input
                  type="text"
                  placeholder="e.g. MH 01 AB 1234"
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                  value={regData.vehicleNumber}
                  onChange={(e) => setRegData({ ...regData, vehicleNumber: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => handleRegister(regData)}
              disabled={isRegistering}
              className="w-full h-14 rounded-[1.25rem] bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs border-0 shadow-xl"
            >
              {isRegistering ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Start Earning Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      <p className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Redirecting to Dashboard...</p>
    </div>
  );
}

