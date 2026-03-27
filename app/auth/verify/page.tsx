'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { verifyEmail } from '@/lib/api';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        // Redirect after a short delay to show success state
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };

    performVerification();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center space-y-6 backdrop-blur-sm border-primary/10 bg-card/80">
        <div className="space-y-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            SwasthRoute
          </div>
          
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <RefreshCw className="w-12 h-12 text-primary animate-spin" />
              <p className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Verifying your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <h2 className="text-xl font-black text-gray-900 uppercase">Verification Successful!</h2>
              <p className="text-gray-500 text-sm">Your account has been activated. Redirecting you to login...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-500">
              <XCircle className="w-16 h-16 text-red-500" />
              <h2 className="text-xl font-black text-gray-900 uppercase">Verification Failed</h2>
              <p className="text-red-500/80 text-sm font-medium">{message}</p>
              <div className="pt-4 w-full space-y-3">
                <Button 
                  onClick={() => router.push('/auth/signup')}
                  className="w-full bg-primary hover:bg-primary/90 rounded-xl py-6 font-black uppercase tracking-widest text-[10px]"
                >
                  Try Signing Up Again
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="w-full text-gray-400 font-bold uppercase tracking-widest text-[10px]"
                >
                  Return Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full p-8 text-center backdrop-blur-sm border-primary/10 bg-card/80">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
        </Card>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
