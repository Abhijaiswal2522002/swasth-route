'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface GuestRouteProps {
  children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Already authenticated, redirect to appropriate dashboard
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'pharmacy') {
        router.push('/pharmacy');
      } else if (user.role === 'rider') {
        router.push('/rider');
      } else {
        router.push('/app');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Restoring Session...</p>
      </div>
    );
  }

  // If authenticated, we return null to avoid flashing the guest content while redirecting
  if (isAuthenticated) return null;

  return <>{children}</>;
}
