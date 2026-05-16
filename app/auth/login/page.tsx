'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useEffect, Suspense } from 'react';


function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error, clearError } = useAuth();

  const msg = searchParams.get('msg');
  const verified = searchParams.get('verified');
  const registered = searchParams.get('registered');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const validateForm = () => {
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setLocalError('Password is required');
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'pharmacy') {
        router.push('/pharmacy');
      } else if (user.role === 'rider') {
        router.push('/rider');
      } else {
        router.push('/app');
      }
    } catch (err) {
      console.error('[v0] Login failed:', err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="backdrop-blur-xl border-white/10 bg-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="p-8 space-y-8">
          <div className="space-y-3 text-center">

            <h1 className="text-3xl font-black tracking-tight text-black">
              Welcome <span className="text-primary">Back.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Log in to your SwasthRoute account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-black placeholder:text-slate-600 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="text-sm font-bold text-slate-300">
                  Password
                </label>
                <Link href="/auth/forgot-password">
                  <span className="text-xs text-primary hover:underline font-bold">
                    Forgot Password?
                  </span>
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-black placeholder:text-slate-600 rounded-xl transition-all"
                />
              </div>
            </div>

            {(msg || verified || registered) && !error && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {verified ? 'Email verified! You can now log in.' :
                  registered ? 'Account created! Please verify your email.' :
                    msg}
              </div>
            )}

            {(localError || error) && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {localError || error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-600">
              <span className="px-4 shadow-sm">New to SwasthRoute?</span>
            </div>
          </div>

          <Link href="/auth/signup">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 rounded-xl border-black/10 hover:bg-primary/90 text-black font-bold transition-all"
            >
              Create New Account
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

import GuestRoute from '@/components/auth/GuestRoute';

export default function LoginPage() {
  return (
    <GuestRoute>
      <Suspense fallback={
        <Card className="backdrop-blur-sm border-primary/10 bg-card/80">
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      }>
        <LoginContent />
      </Suspense>
    </GuestRoute>
  );
}
