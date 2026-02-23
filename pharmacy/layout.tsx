import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pharmacy Dashboard - SwasthRoute',
  description: 'Manage your pharmacy orders and inventory',
};

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
