'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bike, LayoutDashboard, Package, Map as MapIcon, 
  TrendingUp, Settings, LogOut, User, RefreshCw, Power
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRider, RiderProvider } from '@/lib/contexts/RiderContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import ActiveOrderIndicator from '@/components/rider/ActiveOrderIndicator';

import RiderSidebar from '@/components/rider/RiderSidebar';

function RiderLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, activeOrder } = useRider();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-orange-600 animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse text-sm uppercase tracking-widest">Synchronizing Fleet Systems...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RiderSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className={`flex-1 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'} flex flex-col overflow-x-hidden min-h-screen transition-all duration-500 ease-in-out`}>
        <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 transition-all duration-700">
          <ActiveOrderIndicator order={activeOrder} onClick={() => router.push('/rider/home')} />
          {children}
        </div>
        
        <footer className="mt-auto px-10 py-8 border-t border-gray-100 bg-white/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
           <span>SwasthRoute Logistics Engine v4.2.1</span>
           <div className="flex items-center gap-4">
              <a href="#" className="hover:text-orange-600 transition-colors">Safety Protocol</a>
              <span className="opacity-20">/</span>
              <a href="#" className="hover:text-orange-600 transition-colors">Fleet Support</a>
           </div>
        </footer>
      </main>
    </div>
  );
}

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['rider', 'user']}>
      <RiderProvider>
        <RiderLayoutContent>{children}</RiderLayoutContent>
      </RiderProvider>
    </ProtectedRoute>
  );
}

