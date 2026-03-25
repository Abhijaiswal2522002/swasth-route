'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, TrendingUp, Settings, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
    { name: 'Orders',    href: '/pharmacy/orders', icon: Package },
    { name: 'Earnings',  href: '/pharmacy/earnings', icon: TrendingUp },
    { name: 'Settings',  href: '/pharmacy/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Desktop Top Navbar */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/pharmacy" className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SwasthRoute <span className="text-gray-400 font-normal">| Pharmacy</span>
                </span>
              </Link>
              <nav className="flex space-x-1 border-l pl-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4 text-primary" />
                {user?.name || 'Pharmacy'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-20 md:pb-8 px-0 md:px-4 lg:px-8 md:py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'fill-primary/15' : ''}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
