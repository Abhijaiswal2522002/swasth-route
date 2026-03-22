'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ApiClient from '@/lib/api';

export default function ForgotPasswordPage() {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) {
      setError('Email or phone is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: apiError } = await ApiClient.forgotPassword(contact);
      if (apiError) {
        setError(apiError);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm border-primary/10 bg-card/80">
      <div className="p-8 space-y-8">
        <div className="space-y-2 text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forgot Password
          </div>
          <p className="text-muted-foreground text-sm">
            Enter your email or phone number to receive a reset link
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
              If an account exists, a reset link has been sent to your email.
            </div>
            <Link href="/auth/login" className="block">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="contact" className="text-sm font-medium">
                Email or Phone Number
              </label>
              <Input
                id="contact"
                type="text"
                placeholder="email@example.com or 9876543210"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={loading}
                className="bg-input/50 border-primary/20 focus:border-primary"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
