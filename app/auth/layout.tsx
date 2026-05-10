'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'user'; // default to user

  const isPharmacy = role === 'pharmacy';
  const isRider = role === 'rider';

  const backgroundImage = isRider
    ? '/OIP.webp'
    : '/medicine.svg';

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex flex-col relative bg-slate-900 overflow-hidden group">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt="Healthcare and Technology"
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-black italic">S</span>
            </div>
            <span className="text-2xl font-black tracking-tight">SwasthRoute</span>
          </div>

          <div className="space-y-10">
            {isPharmacy ? (
              <>
                <div className="space-y-4">
                  <h2 className="text-6xl font-black leading-tight tracking-tighter animate-in fade-in slide-in-from-left duration-700">
                    Join <br />
                    <span className="text-primary">SwasthRoute.</span>
                  </h2>
                  <p className="text-2xl text-slate-300 font-medium max-w-lg leading-relaxed animate-in fade-in slide-in-from-left duration-700 delay-100">
                    Grow your pharmacy business with us.
                  </p>
                </div>

                {/* Features List for Pharmacy */}
                <div className="space-y-8 max-w-md">
                  {[
                    { num: "1", title: "Manage Inventory", desc: "Track medicines, stock, and expiry with ease." },
                    { num: "2", title: "Smart Billing", desc: "Fast billing with GST invoices and reports." },
                    { num: "3", title: "Fast Delivery", desc: "Connect with delivery partners and serve more customers." },
                    { num: "4", title: "Business Insights", desc: "Analytics and reports to grow your business." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-6 group animate-in fade-in slide-in-from-left duration-700" style={{ animationDelay: `${(i + 2) * 100}ms` }}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-500">
                        <span className="text-xl font-black text-primary">{f.num}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{f.title}</h4>
                        <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                <div className="space-y-6">
                  <h2 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tighter text-white">
                    Fast. Reliable. <br />
                    <span className="text-primary">Medicines Delivered</span> <br />
                    to Your Doorstep.
                  </h2>
                  <p className="text-2xl text-slate-300 font-medium max-w-xl leading-relaxed">
                    Your trusted partner for medicine delivery and pharmacy management.
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-primary flex items-center justify-center text-xs font-black">
                      10k+
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Trusted by 10,000+ customers
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm font-medium text-slate-500">
            © 2026 SwasthRoute Technologies. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
  );
}
