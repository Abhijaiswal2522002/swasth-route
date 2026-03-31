'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Pill, Clock, UserCircle, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/context/CartContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Medicines', href: '/app/medicines', icon: Pill },
    { name: 'Cart', href: '/app/cart', icon: ShoppingCart },
    { name: 'Orders', href: '/app/orders', icon: Clock },
    { name: 'Profile', href: '/app/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80 flex flex-col">
      
      {/* Desktop Top Navbar */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/app" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SwasthRoute App
              </Link>
              <nav className="flex space-x-4 border-l pl-8">
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
                      {item.name === 'Cart' && cartCount > 0 && (
                        <span className="ml-2 bg-destructive text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                <UserCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-20 md:pb-8 relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${isActive ? 'fill-primary/20 bg-primary/10 rounded-full p-1 w-7 h-7' : ''}`} />
                  {item.name === 'Cart' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-destructive text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
    </div>
  );
}
