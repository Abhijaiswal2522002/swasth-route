import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard - SwasthRoute',
  description: 'Manage pharmacies and platform analytics',
};

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </ProtectedRoute>
  );
}
