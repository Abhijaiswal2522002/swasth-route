'use client';

import React from 'react';
import { Truck, ShieldCheck, HeartPulse, Activity, Zap, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AmbulancePromo() {
  return (
    <section className="py-28 bg-[#0F172A] text-white relative overflow-hidden rounded-[3rem] mx-6 my-12 border border-slate-800 shadow-2xl">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_50%)]" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-650/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT CONTENT: Value Prop */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <span>10-Minute Response Time</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Direct Trauma <br />
              <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Ambulance Dispatch.</span>
            </h2>
            
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
              Partnered with nearby medical centers to ensure critical care vehicles reach you within minutes. Profit is not our motive—saving lives is.
            </p>

            {/* What's Inside the Ambulance Grid */}
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center shrink-0 text-rose-500">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Paramedic Staffed</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Trained paramedic and assistant inside every vehicle.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center shrink-0 text-rose-500">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">AED & Cardiac Monitors</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Equipped with external defibrillators and vitals monitors.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center shrink-0 text-rose-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Oxygen & Suction Units</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Continuous flow oxygen cylinders and advanced airway kits.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center shrink-0 text-rose-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Lifesaving Injections</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Stocked with essential trauma medicines and critical drugs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Pricing & Action Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full space-y-8">
              {/* Card visual elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />

              <div>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Affordable Care Rates</p>
                <h3 className="text-3xl font-black text-white">₹2,000 Flat Rate</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                  No surge pricing. Charges are standard across all Basic Life Support dispatches. In critical emergencies, dispatch is provided free of charge.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Coverage Area</span>
                  <span className="text-white">Active (Gurugram/Mumbai)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Response Target</span>
                  <span className="text-emerald-400 font-extrabold">Sub-10 Mins</span>
                </div>
              </div>

              <Link href="/auth/signup?redirect=/app" className="w-full">
                <Button className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-600/20 border-0 flex items-center justify-center gap-2 group">
                  Book Emergency Ambulance <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
