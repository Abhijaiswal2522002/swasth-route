'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { MapPin, Clock, Heart, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { location, loading } = useGeolocation();
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    if (location) {
      setLocationText(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    }
  }, [location]);

  return (
    <div className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -left-[10%] w-[35%] h-[35%] bg-accent/10 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute bottom-[10%] right-[10%] w-[25%] h-[25%] bg-primary/5 rounded-full blur-[80px] animate-pulse delay-1000" />

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-6">


              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Your Health,{' '}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                  Our Priority.
                </span>
                <br />
                <span className="text-4xl md:text-5xl opacity-90">Delivered in Minutes.</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Experience the next generation of healthcare delivery. Connect with verified local pharmacies and get your emergency medicines when every second counts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/auth/signup" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:px-10 h-14 text-lg font-bold shadow-[0_10px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_15px_50px_-10px_rgba(var(--primary-rgb),0.6)] transition-all hover:-translate-y-1 group">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:px-10 h-14 text-lg font-semibold border-primary/20 hover:bg-primary/5 backdrop-blur-sm transition-all"
                >
                  Explore Local Pharmacies
                </Button>
              </Link>
            </div>

            {/* Trust Badges / Quick Stats */}
            <div className="pt-8 border-t border-primary/10">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-black text-primary tracking-tighter">5-15m</div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mt-1">Delivery Time</p>
                </div>
                <div>
                  <div className="text-3xl font-black text-primary tracking-tighter">1.2k+</div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mt-1">Pharmacies</p>
                </div>
                <div>
                  <div className="text-3xl font-black text-primary tracking-tighter">24/7</div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mt-1">Live Support</p>
                </div>
              </div>
            </div>

            {/* Location status - subtle integrated */}
            {location && (
              <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-primary/5 border border-primary/10 w-fit backdrop-blur-md">
                <div className="relative">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-75"></span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-primary/80">Active near you:</span>
                  <span className="ml-2 text-muted-foreground font-medium">{locationText}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Modern Visual Showcase */}
          <div className="relative mt-12 lg:mt-0">
            <div className="relative z-20 transform hover:rotate-[-1deg] transition-transform duration-500 max-w-lg mx-auto lg:max-w-none">
              {/* Main Hero Image with Glass Frame */}
              <div className="relative rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl group">
                <img
                  src="/0_UMAMxjWMV_eDSw6u.jpg"
                  alt="Modern Healthcare"
                  className="w-full h-auto aspect-video lg:aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent opacity-60" />

                {/* Floating Info Overlay - Simplified for mobile */}
                <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6 p-4 lg:p-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shrink-0">
                      <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm lg:text-lg">Instant Care</p>
                      <p className="text-white/80 text-xs lg:text-sm">Real-time prescription processing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Overlapping Image - Adjusted for mobile */}
              <div className="absolute -bottom-6 -right-4 lg:-bottom-10 lg:-right-10 w-32 h-32 lg:w-64 lg:h-64 rounded-2xl lg:rounded-3xl overflow-hidden border-4 lg:border-8 border-background shadow-2xl group hidden sm:block">
                <img
                  src="/7965271_3721745-1024x683.jpg"
                  alt="Delivery Service"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Decorative background circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-transparent to-accent/10 rounded-full blur-[60px] lg:blur-[100px] -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
