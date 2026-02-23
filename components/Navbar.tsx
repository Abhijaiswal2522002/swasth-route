'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X, Home, ShoppingCart, Pill, Settings, BarChart3, Users, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  const isPharmacyPath = pathname.startsWith('/pharmacy');
  const isAdminPath = pathname.startsWith('/admin');

  // User navigation links
  const userLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'My Orders', href: '/app/orders', icon: ShoppingCart },
    { label: 'Medicines', href: '/app/medicines', icon: Pill },
    { label: 'Track Order', href: '/app/track-order', icon: Clock },
    { label: 'Profile', href: '/app/profile', icon: User },
  ];

  // Pharmacy navigation links
  const pharmacyLinks = [
    { label: 'Dashboard', href: '/pharmacy', icon: BarChart3 },
    { label: 'Orders', href: '/pharmacy/orders', icon: ShoppingCart },
    { label: 'Medicines', href: '/pharmacy/medicines', icon: Pill },
    { label: 'Earnings', href: '/pharmacy/earnings', icon: BarChart3 },
    { label: 'Settings', href: '/pharmacy/settings', icon: Settings },
  ];

  // Admin navigation links
  const adminLinks = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { label: 'Pharmacies', href: '/admin/pharmacies', icon: Users },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const navigationLinks = isPharmacyPath ? pharmacyLinks : isAdminPath ? adminLinks : userLinks;

  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            SwasthRoute
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-primary/5">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">{user.name}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="hidden sm:flex border-primary/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden md:inline">Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-primary/10 pt-4">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            <div className="px-4 pt-2 border-t border-primary/10 mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-primary/5">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">{user.name}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start border-primary/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
