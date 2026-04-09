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

  if (pathname?.startsWith('/app') || pathname?.startsWith('/admin') || pathname?.startsWith('/pharmacy') || pathname?.startsWith('/rider')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      router.push(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const navLinks = user?.role === 'pharmacy'
    ? [
      { label: 'Dashboard', action: () => router.push('/') },
      { label: 'Orders', action: () => router.push('/app/orders') },
      { label: 'Inventory', action: () => router.push('/app/inventory') },
    ]
    : [
      { label: 'Home', action: () => router.push('/') },
      { label: 'How It Works', action: () => scrollToSection('how-it-works') },
      { label: 'For Pharmacies', action: () => scrollToSection('for-pharmacies') },
      { label: 'Contact', action: () => scrollToSection('contact') },
    ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            SwasthRoute
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}

            <Button
              onClick={() => scrollToSection('emergency')}
              className="bg-destructive hover:bg-destructive/90 text-white font-bold animate-pulse hover:animate-none flex items-center gap-2"
            >
              Emergency Order 🚑
            </Button>
          </div>

          {/* Auth / User Menu */}
          <div className="hidden md:flex items-center gap-4 border-l border-primary/10 pl-6">
            {user ? (
              <>
                <Link
                  href="/app/orders"
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  My Orders
                </Link>
                <Link
                  href="/app/profile"
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Profile
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold">{user.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-sm font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-4">
            <Button
              size="sm"
              onClick={() => scrollToSection('emergency')}
              className="bg-destructive text-white text-[10px] h-8 px-2"
            >
              Emergency 🚑
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-6 space-y-4 border-t border-primary/10 pt-4 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="px-4 py-4 border-t border-primary/10 mt-2 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary">
                    <User className="w-6 h-6" />
                    <span className="font-bold">{user.name}</span>
                  </div>
                  <Link href="/app/orders" onClick={() => setIsOpen(false)} className="block p-3 hover:bg-primary/5 rounded-xl text-muted-foreground font-medium">My Orders</Link>
                  <Link href="/app/profile" onClick={() => setIsOpen(false)} className="block p-3 hover:bg-primary/5 rounded-xl text-muted-foreground font-medium">Profile</Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-center border-destructive/20 text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
