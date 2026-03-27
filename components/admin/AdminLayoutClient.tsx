'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide sidebar on the auth page
  const isAuthPage = pathname?.includes('/admin/auth');

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-950 flex flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 lg:pl-72 flex flex-col overflow-x-hidden min-h-screen">
        {/* Dynamic transition for children */}
        <div className="flex-1 transition-all duration-700">
          {children}
        </div>
        
        {/* Subtle page footer for admin */}
        <footer className="mt-auto px-10 py-8 border-t border-slate-100 bg-white/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
           <span>SwasthRoute Control Systems v1.0.4</span>
           <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
              <span className="opacity-20">/</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Support Portal</a>
           </div>
        </footer>
      </main>
    </div>
  );
}
