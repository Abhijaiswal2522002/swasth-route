'use client';

import { useState } from 'react';
import { Lock, Shield, AlertCircle, Eye, EyeOff, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminAuthPage() {
  const { adminLogin } = useAuth();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await adminLogin(adminId, password);
      window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 mb-4 shadow-2xl">
            <Shield className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Swasth<span className="text-blue-500">Route</span>
          </h1>
          <p className="text-slate-400 font-medium">Internal Administration Portal</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
          <CardContent className="p-8 pt-10">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Admin Identity</label>
                <div className="relative group">
                  <Activity className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Enter admin ID or email"
                    className="h-12 pl-12 bg-black/20 border-white/5 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="h-12 pl-12 pr-12 bg-black/20 border-white/5 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                Protected Administrative Environment
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <a href="/" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2">
            Return to Public Website
          </a>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

