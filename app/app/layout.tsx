'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Pill, Clock, UserCircle, LogOut, ShoppingCart, ClipboardList } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/context/CartContext';

import UserSidebar from '@/components/user/UserSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <UserSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className={`flex-1 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'} flex flex-col overflow-x-hidden min-h-screen transition-all duration-500 ease-in-out`}>
        <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 transition-all duration-700">
          {children}
        </div>
        
        <footer className="mt-auto px-10 py-8 border-t border-gray-100 bg-white/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
           <span>SwasthRoute Digital Health v3.0.2</span>
           <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Protocol</a>
              <span className="opacity-20">/</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Emergency Guide</a>
           </div>
        </footer>
      </main>
    </div>
  );
}
