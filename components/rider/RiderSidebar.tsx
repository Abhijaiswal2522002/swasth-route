'use client';

import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, Map as MapIcon, 
  TrendingUp, LogOut, User, Menu, X, 
  ChevronRight, Bike, Power
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRider } from '@/lib/contexts/RiderContext';
import Link from 'next/link';

export default function RiderSidebar({ isCollapsed, onToggle }: { isCollapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { 
    profile, isOnline, handleToggleOnline, 
    nearbyOrders 
  } = useRider();
  
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/rider/home', icon: LayoutDashboard },
    { name: 'Orders', href: '/rider/orders', icon: Package, badge: nearbyOrders.length },
    { name: 'Live Map', href: '/rider/map', icon: MapIcon },
    { name: 'Earnings', href: '/rider/earning', icon: TrendingUp },
    { name: 'Profile', href: '/rider/profileview', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-20' : 'w-72'} bg-[#0f1113] border-r border-white/5 z-50 hidden lg:flex flex-col transition-all duration-500 ease-in-out shadow-[20px_0_50px_rgba(0,0,0,0.3)]`}>
        <div className={`p-6 ${isCollapsed ? 'px-4' : 'p-8'} pb-10 flex items-center justify-between`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2.5 rounded-2xl shadow-lg ring-1 ring-white/20 transition-all duration-500 shrink-0 ${isOnline ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20' : 'bg-gray-800 shadow-none grayscale'}`}>
              <Bike className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                <h1 className="text-xl font-black text-white tracking-tight">Swasth<span className="text-orange-400">Rider</span></h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={onToggle}
            className={`p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-all ${isCollapsed ? 'hidden' : 'flex'}`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {isCollapsed && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <button onClick={onToggle} className="p-3 bg-white/5 rounded-2xl text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-lg">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center gap-1">
               <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className="scale-75" />
            </div>
          </div>
        )}

        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-1.5 overflow-y-auto custom-scrollbar`}>
          {!isCollapsed && (
            <div className="px-4 mb-6">
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duty Status</span>
                      <span className={`text-xs font-bold ${isOnline ? 'text-emerald-400' : 'text-gray-400'}`}>{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <Switch
                    checked={isOnline}
                    onCheckedChange={handleToggleOnline}
                    className="data-[state=checked]:bg-emerald-500"
                  />
               </div>
            </div>
          )}

          {!isCollapsed && <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 mt-2">Logistics Control</p>}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : ''}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} group ${isCollapsed ? 'px-0 h-14' : 'px-4 py-3.5'} rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5 z-10">
                  <div className="relative">
                    <item.icon className={`h-5 w-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:text-orange-400 group-hover:scale-110'}`} />
                    {item.badge !== undefined && item.badge > 0 && !isActive && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>{item.name}</span>}
                </div>
                {item.badge !== undefined && item.badge > 0 && isActive && !isCollapsed && (
                  <span className="bg-white/20 text-white text-[10px] font-black rounded-full px-2 py-0.5 z-10">
                    {item.badge}
                  </span>
                )}
                {!item.badge && !isCollapsed && <ChevronRight className={`h-4 w-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />}
              </Link>
            );
          })}
        </nav>

        <div className={`p-6 mt-auto ${isCollapsed ? 'px-2' : ''}`}>
          {!isCollapsed ? (
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-6">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Rider Profile</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/10 shrink-0">
                  {profile?.userId?.name?.substring(0, 2).toUpperCase() || 'RD'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{profile?.userId?.name || 'Rider'}</p>
                  <p className="text-[10px] text-gray-500 truncate font-medium uppercase tracking-wider">Fleet Captain</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
               <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                {profile?.userId?.name?.substring(0, 2).toUpperCase() || 'RD'}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 ${isCollapsed ? 'px-0 h-14' : 'px-4 py-4'} rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm group border border-transparent hover:border-red-400/20`}
            title={isCollapsed ? 'End Shift' : ''}
          >
            <LogOut className={`h-5 w-5 ${!isCollapsed ? 'group-hover:translate-x-1' : ''} transition-transform`} />
            {!isCollapsed && <span>End Shift</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`
        lg:hidden fixed top-0 left-0 right-0 h-16 z-[60] flex items-center justify-between px-6 transition-all duration-300
        ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors ${isOnline ? 'bg-orange-600' : 'bg-gray-400'}`}>
            <Bike className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-gray-900 tracking-tight">SwasthRider</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className={`text-[8px] font-black uppercase ${isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>{isOnline ? 'ON' : 'OFF'}</span>
                <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className="scale-75" />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(true)}
                className="rounded-xl hover:bg-gray-100"
            >
                <Menu className="h-6 w-6 text-gray-900" />
            </Button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-80 bg-[#0f1113] text-white z-[80] lg:hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isOpen ? 'translate-x-0 shadow-[20px_0_100px_rgba(0,0,0,0.5)]' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <Bike className="h-6 w-6 text-orange-400" />
             <span className="font-black tracking-tight text-xl text-white">Rider Console</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-2xl transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="p-6 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
                  isActive ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-gray-400 hover:bg-white/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-4">
                    <item.icon className="h-5 w-5" />
                    <span className="font-black text-sm tracking-tight uppercase tracking-widest text-[10px]">{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                    </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-8 right-8">
           <Button 
            className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 py-7 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] gap-3"
            onClick={handleLogout}
           >
             <LogOut className="h-5 w-5" />
             Logout
           </Button>
        </div>
      </aside>
    </>
  );
}
