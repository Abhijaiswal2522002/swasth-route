'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, TrendingUp, Settings, LogOut, Building2, MessageSquare, Receipt, History, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import SupportChatWidget from '@/components/SupportChatWidget';

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['pharmacy']}>
      <div className="flex min-h-screen bg-gray-50">
        <PharmacySidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main className={`flex-1 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'} flex flex-col overflow-x-hidden min-h-screen transition-all duration-500 ease-in-out`}>
          <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 transition-all duration-700">
            {children}
          </div>
          
          <footer className="mt-auto px-10 py-8 border-t border-gray-100 bg-white/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
             <span>SwasthRoute Pharmacy Hub v2.1.0</span>
             <div className="flex items-center gap-4">
                <a href="#" className="hover:text-teal-600 transition-colors">Merchant Policy</a>
                <span className="opacity-20">/</span>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                  className="hover:text-teal-600 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  Emergency Support
                </button>
             </div>
          </footer>
        </main>
        <SupportChatWidget />
      </div>
    </ProtectedRoute>
  );
}
