'use client';

import { usePathname } from 'next/navigation';
import { 
  Users, BarChart3, ShoppingCart, 
  Store, Settings, Shield, LayoutDashboard,
  Menu, X, LogOut, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthManager from '@/lib/auth';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Portal Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Order History', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Pharmacy Network', href: '/admin/pharmacies', icon: Store },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    AuthManager.logout();
    window.location.href = '/admin/auth';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#0f172a] border-r border-white/5 z-50 hidden lg:flex flex-col transition-all duration-300 shadow-[20px_0_50px_rgba(0,0,0,0.2)]">
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Swasth<span className="text-blue-400">Route</span></h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Core</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 mt-2">Enterprise Navigation</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5 z-10">
                  <item.icon className={`h-5 w-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:text-blue-400 group-hover:scale-110'}`} />
                  <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                </div>
                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />}
                <ChevronRight className={`h-4 w-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </a>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Identity</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Administrator</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">Global Controller</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm group border border-transparent hover:border-red-400/20"
          >
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header / Navigation */}
      <header className={`
        lg:hidden fixed top-0 left-0 right-0 h-16 z-[60] flex items-center justify-between px-6 transition-all duration-300
        ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm' : 'bg-transparent'}
      `}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-slate-900 tracking-tight">SwasthRoute</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(true)}
          className="rounded-xl hover:bg-slate-100"
        >
          <Menu className="h-6 w-6 text-slate-900" />
        </Button>
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
        fixed top-0 left-0 bottom-0 w-80 bg-[#0f172a] text-white z-[80] lg:hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isOpen ? 'translate-x-0 shadow-[20px_0_100px_rgba(0,0,0,0.5)]' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <Shield className="h-6 w-6 text-blue-400" />
             <span className="font-black tracking-tight">Admin Console</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-2xl transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-8 right-8">
           <Button 
            className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 py-7 rounded-2xl transition-all font-bold gap-3"
            onClick={handleLogout}
           >
             <LogOut className="h-5 w-5" />
             Exit Administration
           </Button>
        </div>
      </aside>
    </>
  );
}
