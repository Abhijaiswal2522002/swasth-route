import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Package, Map as MapIcon, DollarSign, User } from 'lucide-react';

interface RiderNavbarProps {
  orderCount?: number;
}

const RiderNavbar: React.FC<RiderNavbarProps> = ({ orderCount = 0 }) => {
  const pathname = usePathname();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/rider/home' },
    { id: 'orders', label: 'Orders', icon: Package, badge: orderCount, href: '/rider/orders' },
    { id: 'map', label: 'Map', icon: MapIcon, href: '/rider/map' },
    { id: 'earnings', label: 'Earnings', icon: DollarSign, href: '/rider/earning' },
    { id: 'profile', label: 'Profile', icon: User, href: '/rider/profileview' },
  ];


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-xl border border-zinc-200/50 rounded-[2.5rem] px-8 py-3 shadow-2xl flex justify-between items-center pointer-events-auto">

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center gap-1 transition-all pointer-events-auto ${
              isActive ? 'text-primary' : 'text-zinc-400'
            }`}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </Link>
        );
      })}

      </div>
    </div>
  );
};


export default RiderNavbar;
