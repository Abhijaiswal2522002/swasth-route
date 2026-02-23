'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setLocalError('Name is required');
      return false;
    }

    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setLocalError('Enter a valid Indian phone number');
      return false;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
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
      await signup(formData.name, formData.phone.replace(/\D/g, ''), formData.password);
      router.push('/');
    } catch (err) {
      console.error('[v0] Signup failed:', err);
    }
  };

  return (
    <Card className="backdrop-blur-sm border-primary/10 bg-card/80">
      <div className="p-8 space-y-8">
        <div className="space-y-2 text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SwasthRoute
          </div>
          <p className="text-muted-foreground text-sm">Create your account for emergency medicine delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="bg-input/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-input/50 border border-primary/20 rounded-md text-muted-foreground text-sm">
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
                maxLength={10}
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
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-card/80 text-muted-foreground">Already have an account?</span>
          </div>
        </div>

        <Link href="/auth/login">
          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/40"
          >
            Log In
          </Button>
        </Link>
      </div>
    </Card>
  );
}
