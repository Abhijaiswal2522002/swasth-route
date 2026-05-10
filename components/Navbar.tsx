'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LogOut, User, Menu, X,
  Home, ShoppingCart, Pill,
  Settings, BarChart3, Users,
  Clock, ArrowRight, Shield,
  Zap, MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/app') || pathname?.startsWith('/admin') || pathname?.startsWith('/pharmacy') || pathname?.startsWith('/rider') || pathname?.startsWith('/auth')) {
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
        const offset = 100; // Account for fixed navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    setIsOpen(false);
  };

  const navLinks = user?.role === 'pharmacy'
    ? [
      { label: 'Dashboard', icon: BarChart3, action: () => router.push('/') },
      { label: 'Orders', icon: ShoppingCart, action: () => router.push('/app/orders') },
      { label: 'Inventory', icon: Pill, action: () => router.push('/app/inventory') },
    ]
    : [
      { label: 'How It Works', action: () => scrollToSection('how-it-works') },
      { label: 'For Pharmacies', action: () => scrollToSection('for-pharmacies') },
      { label: 'Contact', action: () => scrollToSection('contact') },
    ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
        ? 'py-4'
        : 'py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div
          className={`relative flex items-center justify-between h-16 md:h-20 px-6 md:px-8 transition-all duration-500 rounded-[2rem] border ${scrolled
            ? 'bg-white/80 backdrop-blur-xl border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'
            : 'bg-transparent border-transparent'
            }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="text-2xl font-black italic text-white">S</span>
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 lowercase">
              swasth<span className="text-primary">route</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary rounded-xl hover:bg-primary/5 transition-all duration-300 lowercase"
              >
                {link.label}
              </button>
            ))}

            <div className="w-px h-6 bg-slate-200 mx-4" />

            {user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/app/profile')}
                  className="rounded-full pl-2 pr-4 h-11 bg-slate-50 border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Welcome</p>
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                  </div>
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-11 h-11 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-sm font-bold rounded-xl px-6">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            <Button
              onClick={() => scrollToSection('emergency')}
              className="ml-4 bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl shadow-xl shadow-destructive/20 animate-pulse hover:animate-none flex items-center gap-2 group lowercase"
            >
              emergency <Zap className="w-3.5 h-3.5 fill-white" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              size="sm"
              onClick={() => scrollToSection('emergency')}
              className="bg-destructive text-white text-[9px] font-bold h-8 px-3 rounded-lg shadow-sm"
            >
              sos <Zap className="w-2.5 h-2.5 fill-white ml-1" />
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${isOpen ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                }`}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div
          className={`lg:hidden fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`lg:hidden fixed top-[80px] left-4 right-4 z-[95] bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
            }`}
        >
          <div className="p-6 space-y-6">
            {/* Quick Links Group */}
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-slate-400 ml-4 mb-2">navigation</p>
              <div className="grid grid-cols-1 gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="flex items-center justify-between px-5 py-3 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-primary/5 hover:text-primary transition-all group"
                  >
                    <span className="text-sm lowercase">{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Account Section */}
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 leading-none mb-1">active account</p>
                      <p className="text-sm font-bold text-slate-900 leading-none lowercase">{user.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/app/orders" onClick={() => setIsOpen(false)} className="flex items-center justify-center h-10 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 lowercase">my orders</Link>
                    <Link href="/app/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-center h-10 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 lowercase">profile</Link>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full h-10 rounded-xl text-destructive font-medium text-xs hover:bg-destructive/5 lowercase"
                  >
                    sign out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-11 rounded-xl text-xs font-bold border-slate-200 lowercase">sign in</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-11 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-lg shadow-slate-900/10 lowercase">join us</Button>
                  </Link>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
    </nav>
  );
}
