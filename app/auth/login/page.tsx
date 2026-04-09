'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
    <Card className="backdrop-blur-sm border-primary/10 bg-card/80">
      <div className="p-8 space-y-8">
        <div className="space-y-2 text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SwasthRoute
          </div>
          <p className="text-muted-foreground text-sm">Log in to access emergency medicine delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="bg-input/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="bg-input/50 border-primary/20 focus:border-primary"
            />
            <div className="flex justify-end">
              <Link href="/auth/forgot-password">
                <span className="text-xs text-primary hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </Link>
            </div>
          </div>

          {(msg || verified || registered) && !error && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {verified ? 'Email verified successfully! You can now log in.' :
                registered ? 'Account created! Please check your email to verify before logging in.' :
                  msg}
            </div>
          )}

          {(localError || error) && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {localError || error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>


        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-card/80 text-muted-foreground">New to SwasthRoute?</span>
          </div>
        </div>

        <Link href="/auth/signup">
          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/40"
          >
            Create Account
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="backdrop-blur-sm border-primary/10 bg-card/80">
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    }>
      <LoginContent />
    </Suspense>
  );
}
