'use client';

import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, TrendingUp, 
  Settings, LogOut, Building2, MessageSquare, 
  Receipt, History, ShoppingCart, Users,
  Menu, X, ChevronRight, Store, AlertTriangle, CreditCard,
  Bell, Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import ApiClient from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

const navItems = [
  { name: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
  { name: 'Billing', href: '/pharmacy/billing', icon: Receipt },
  { name: 'Invoices', href: '/pharmacy/invoices', icon: History },
  { name: 'Medicines', href: '/pharmacy/medicines', icon: Package },
  { name: 'User Requests', href: '/pharmacy/requests', icon: MessageSquare },
  { name: 'Orders', href: '/pharmacy/orders', icon: Package },
  { name: 'Purchases', href: '/pharmacy/purchases', icon: ShoppingCart },
  { name: 'Expiry', href: '/pharmacy/expiry', icon: AlertTriangle },
  { name: 'Suppliers', href: '/pharmacy/suppliers', icon: Users },
  { name: 'Earnings', href: '/pharmacy/earnings', icon: TrendingUp },
  { name: 'Subscription', href: '/pharmacy/subscription', icon: CreditCard },
  { name: 'Settings', href: '/pharmacy/settings', icon: Settings },
];

export default function PharmacySidebar({ isCollapsed, onToggle }: { isCollapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await ApiClient.getNotifications();
      if (res.data) setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    fetchNotifications();

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Sidebar connected to Socket.io');
      socket.emit('join-user', user.id);
    });

    socket.on('new-notification', (notif) => {
      console.log('New notification received:', notif);
      setNotifications(prev => [notif, ...prev]);
      toast(notif.title, {
        description: notif.message,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = '/pharmacy/expiry';
          }
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await ApiClient.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await ApiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ApiClient.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const renderNotificationsDropdown = (positionClasses: string) => {
    if (!showNotifications) return null;
    return (
      <div className={`absolute ${positionClasses} bg-[#1a1c1e] border border-white/10 text-white rounded-3xl p-5 shadow-2xl w-80 md:w-96 max-h-[450px] flex flex-col overflow-hidden z-[100] animate-in zoom-in-95 duration-200`}>
        <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-400" />
            <span className="font-extrabold text-sm tracking-tight text-white">Notification Center</span>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[10px] text-teal-400 hover:text-teal-300 font-black uppercase tracking-widest leading-none border border-teal-500/20 px-2 py-1.5 rounded-lg hover:bg-teal-500/10 transition-colors"
            >
              Mark Read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
          {notifications.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group/item ${
                  notif.isRead 
                    ? 'bg-white/5 border-white/5 opacity-60 hover:opacity-100' 
                    : 'bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/15'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 pr-4">
                    <p className="font-extrabold text-xs text-white tracking-tight leading-normal flex items-center gap-1.5">
                      {!notif.isRead && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 animate-pulse" />}
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{notif.message}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNotification(notif._id, e)}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-20' : 'w-72'} bg-[#1a1c1e] border-r border-white/5 z-50 hidden lg:flex flex-col transition-all duration-500 ease-in-out shadow-[20px_0_50px_rgba(0,0,0,0.1)]`}>
        <div className={`p-6 ${isCollapsed ? 'px-4' : 'p-8'} pb-10 flex items-center justify-between`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-teal-500/20 ring-1 ring-white/20 shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                <h1 className="text-xl font-black text-white tracking-tight">Swasth<span className="text-teal-400">Route</span></h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pharmacy Hub</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all relative ${showNotifications ? 'text-white bg-white/10' : ''}`}
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>
              {renderNotificationsDropdown("right-0 top-full mt-2")}
            </div>
            
            <button 
              onClick={onToggle}
              className={`p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-all ${isCollapsed ? 'hidden' : 'flex'}`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isCollapsed && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <button onClick={onToggle} className="p-3 bg-white/5 rounded-2xl text-teal-400 hover:bg-teal-500 hover:text-white transition-all shadow-lg">
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 bg-white/5 rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-all shadow-lg relative ${showNotifications ? 'text-white bg-white/10' : ''}`}
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>
              {renderNotificationsDropdown("left-full ml-3 top-0")}
            </div>
          </div>
        )}

        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-1.5 overflow-y-auto custom-scrollbar`}>
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 mt-2">Inventory & Sales</p>}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : ''}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} group ${isCollapsed ? 'px-0 h-14' : 'px-4 py-3.5'} rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5 z-10">
                  <item.icon className={`h-5 w-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:text-teal-400 group-hover:scale-110'}`} />
                  {!isCollapsed && <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>{item.name}</span>}
                </div>
                {!isCollapsed && isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />}
                {!isCollapsed && <ChevronRight className={`h-4 w-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />}
              </Link>
            );
          })}
        </nav>

        <div className={`p-6 mt-auto ${isCollapsed ? 'px-2' : ''}`}>
          {!isCollapsed ? (
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-6">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Shop Identity</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/10 shrink-0">
                  {user?.name?.substring(0, 2).toUpperCase() || 'PH'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name || 'Pharmacy'}</p>
                  <p className="text-[10px] text-gray-500 truncate font-medium uppercase tracking-wider">Verified Merchant</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.substring(0, 2).toUpperCase() || 'PH'}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 ${isCollapsed ? 'px-0 h-14' : 'px-4 py-4'} rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm group border border-transparent hover:border-red-400/20`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut className={`h-5 w-5 ${!isCollapsed ? 'group-hover:translate-x-1' : ''} transition-transform`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`
        lg:hidden fixed top-0 left-0 right-0 h-16 z-[60] flex items-center justify-between px-6 transition-all duration-300
        ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent'}
      `}>
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-xl">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-gray-900 tracking-tight">SwasthRoute</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-all relative ${showNotifications ? 'bg-gray-100' : ''}`}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>
            {renderNotificationsDropdown("right-0 top-full mt-2")}
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
        fixed top-0 left-0 bottom-0 w-80 bg-[#1a1c1e] text-white z-[80] lg:hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isOpen ? 'translate-x-0 shadow-[20px_0_100px_rgba(0,0,0,0.5)]' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <Building2 className="h-6 w-6 text-teal-400" />
             <span className="font-black tracking-tight">Pharmacy Console</span>
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
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20' : 'text-gray-400 hover:bg-white/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-black text-sm tracking-tight uppercase tracking-widest text-[10px]">{item.name}</span>
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
             Terminate Session
           </Button>
        </div>
      </aside>
    </>
  );
}
