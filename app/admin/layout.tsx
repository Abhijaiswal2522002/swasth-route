'use client';

import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/admin/auth';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </ProtectedRoute>
  );
}
