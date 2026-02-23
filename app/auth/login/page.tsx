'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const validateForm = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setLocalError('Enter a valid Indian phone number');
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
      await login(formData.phone.replace(/\D/g, ''), formData.password);
      router.push('/');
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
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-input/50 border border-primary/20 rounded-md text-muted-foreground text-sm font-medium">
                +91
              </div>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                maxLength="10"
                className="bg-input/50 border-primary/20 focus:border-primary"
              />
            </div>
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
          </div>

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

        <div className="space-y-2 text-center text-sm">
          <p className="text-muted-foreground">
            Demo credentials: Phone: 9876543210, Password: test123
          </p>
        </div>

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
