'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import {
  MapPin, Clock, Zap, ShieldCheck,
  ArrowRight, Building2, Navigation,
  Package, Users
} from 'lucide-react';

export default function HeroSection() {
  const { location, loading } = useGeolocation();
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    if (location) {
      setLocationText(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    }
  }, [location]);

  return (
    <div className="relative min-h-screen flex items-center bg-[#F8FAFC] overflow-hidden pt-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-6 space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.05] text-[#0F172A]">
                Smart Pharmacy.<br />
                Faster Delivery.<br />
                <span className="text-primary italic">Better Health.</span>
              </h1>

              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                SwasthRoute connects pharmacies, customers and delivery partners on one intelligent platform.
              </p>
            </div>

            {/* Feature List (Matching the reference UI) */}
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Pharmacy ERP & Inventory</h4>
                  <p className="text-xs text-slate-400 font-medium">Manage stock, orders, billing & more</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0">
                  <Navigation className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Real-time Order Tracking</h4>
                  <p className="text-xs text-slate-400 font-medium">Live updates from pharmacy to doorstep</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">AI-Powered Smart System</h4>
                  <p className="text-xs text-slate-400 font-medium">Predict demand, optimize delivery</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Secure & Reliable</h4>
                  <p className="text-xs text-slate-400 font-medium">Data security, GST billing & analytics</p>
                </div>
              </div>
            </div>


          </div>

          {/* RIGHT VISUAL (Collage inspired by reference) */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group">
              <img
                src="/website ui.png"
                alt="SwasthRoute Platform"
                className="w-full h-auto scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
          </div>

        </div>

        {/* TRUST BAR (Matching reference exactly) */}
        <div className="mt-20 py-8 px-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-wrap justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">500+ Pharmacies</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">across India</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">1 Lakh+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orders Delivered</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">10,000+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Happy Customers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">24/7 Support</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Always here for you</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
