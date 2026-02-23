import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - SwasthRoute',
  description: 'Manage pharmacies and platform analytics',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
