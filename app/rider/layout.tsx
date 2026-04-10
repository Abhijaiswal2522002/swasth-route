'use client';

import React from 'react';
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

function RiderLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { 
    profile, isOnline, isLoading, handleToggleOnline, 
    activeOrder, nearbyOrders 
  } = useRider();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Rider Module...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/rider/home', icon: LayoutDashboard },
    { name: 'Orders', href: '/rider/orders', icon: Package, badge: nearbyOrders.length },
    { name: 'Map', href: '/rider/map', icon: MapIcon },
    { name: 'Earnings', href: '/rider/earning', icon: TrendingUp },
    { name: 'Profile', href: '/rider/profileview', icon: User },
  ];

  // Handle registration view if not a rider
  if (user && user.role !== 'rider') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Top Navbar */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/rider/home" className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SwasthRoute <span className="text-gray-400 font-normal">| Rider</span>
                </span>
              </Link>
              <nav className="flex space-x-1 border-l pl-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                        isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-6">
              {/* Online/Offline Toggle */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleToggleOnline}
                  className="data-[state=checked]:bg-emerald-500 scale-90"
                />
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                <User className="w-4 h-4 text-primary" />
                {profile?.userId?.name || 'Rider'}
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
      <nav className="md:hidden fixed bottom-16 left-0 right-0 z-[49]">
         <ActiveOrderIndicator order={activeOrder} onClick={() => router.push('/rider/home')} />
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${isActive ? 'fill-primary/15' : ''}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
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

