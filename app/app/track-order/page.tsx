'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeneralTrackOrderPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to orders page where user can pick an order to track
    router.replace('/app/orders');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse text-muted-foreground font-medium">Redirecting to your orders...</div>
    </div>
  );
}
