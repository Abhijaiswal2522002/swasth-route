'use client';

import React from 'react';
import { useRider } from '@/lib/contexts/RiderContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, ShieldCheck, LogOut } from 'lucide-react';

export default function RiderProfilePage() {
  const { profile } = useRider();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-500">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 flex items-center justify-center border-8 border-white shadow-2xl relative">
          <User className="w-10 h-10 text-primary" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-emerald-500 border-4 border-white flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-zinc-900 leading-none">{profile?.userId?.name}</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-2">{profile?.userId?.phone}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vehicle</span>
            <span className="text-sm font-black text-zinc-900 uppercase">{profile?.vehicleType || 'Bike'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Plate Number</span>
            <span className="text-sm font-black text-zinc-900 uppercase">{profile?.vehicleNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Join Date</span>
            <span className="text-sm font-black text-zinc-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-14 rounded-[1.5rem] border-2 border-zinc-100 bg-white text-destructive font-black uppercase tracking-widest text-[10px] hover:bg-destructive/5 hover:border-destructive/20 mt-4"
        >
          Logout Account <LogOut className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

