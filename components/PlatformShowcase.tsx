'use client';

import {
   Pill, Building2, Bike,
   ChevronRight, BarChart3, ShieldCheck,
   Map as MapIcon, Timer, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PlatformShowcase() {
   return (
      <section className="py-24 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">

            {/* SECTION HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
               <div className="max-w-2xl space-y-4">
                  <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Ecosystem</h2>
                  <h3 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                     One Platform. <br />
                     <span className="text-gray-400 italic">Unlimited Possibilities.</span>
                  </h3>
               </div>
               <p className="text-lg text-gray-500 font-medium max-w-sm">
                  We've digitized the entire healthcare supply chain to ensure speed, safety, and transparency.
               </p>
            </div>

            {/* 3 PILLARS SHOWCASE */}
            <div className="grid lg:grid-cols-3 gap-12">

               {/* USER PILLAR */}
               <div className="group relative">
                  <div className="absolute -inset-4 bg-blue-50/50 rounded-[3rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="space-y-8">
                     <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20">
                        <Pill className="w-8 h-8" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-3xl font-black text-gray-900 tracking-tight">For Patients</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">
                           Find life-saving medicines in seconds. Our smart search scans all nearby verified pharmacies to find exact stock matches.
                        </p>
                     </div>
                     <ul className="space-y-3">
                        {['Sub-15m Delivery', 'Verified Local Stock', 'Real-time GPS Tracking', 'Emergency Priority'].map((f) => (
                           <li key={f} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> {f}
                           </li>
                        ))}
                     </ul>
                     <Link href="/auth/signup" className="inline-block pt-4">
                        <Button variant="ghost" className="text-blue-600 font-black uppercase tracking-widest text-xs p-0 h-auto hover:bg-transparent group-hover:translate-x-2 transition-transform">
                           Start Ordering <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                     </Link>
                  </div>
               </div>

               {/* PHARMACY PILLAR */}
               <div className="group relative">
                  <div className="absolute -inset-4 bg-teal-50/50 rounded-[3rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="space-y-8">
                     <div className="w-16 h-16 rounded-3xl bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-600/20">
                        <Building2 className="w-8 h-8" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-3xl font-black text-gray-900 tracking-tight">For Pharmacies</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">
                           A complete digital command center. Manage inventory, automate expiry alerts, and handle orders with a professional POS.
                        </p>
                     </div>
                     <ul className="space-y-3">
                        {['Advanced Batch Tracking', 'Automated Expiry Alerts', 'Professional POS & Billing', 'Subscription-based Growth'].map((f) => (
                           <li key={f} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-600" /> {f}
                           </li>
                        ))}
                     </ul>
                     <Link href="/auth/signup" className="inline-block pt-4">
                        <Button variant="ghost" className="text-teal-600 font-black uppercase tracking-widest text-xs p-0 h-auto hover:bg-transparent group-hover:translate-x-2 transition-transform">
                           Partner With Us <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                     </Link>
                  </div>
               </div>

               {/* RIDER PILLAR */}
               <div className="group relative">
                  <div className="absolute -inset-4 bg-orange-50/50 rounded-[3rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="space-y-8">
                     <div className="w-16 h-16 rounded-3xl bg-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-600/20">
                        <Bike className="w-8 h-8" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-3xl font-black text-gray-900 tracking-tight">For Riders</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">
                           Join the elite logistics squad. Enjoy flexible shifts, smart delivery routing, and transparent real-time earnings.
                        </p>
                     </div>
                     <ul className="space-y-3">
                        {['Flexible Duty Toggles', 'Live Satellite Map', 'Weekly Earning Reports', 'Hyper-local Focus'].map((f) => (
                           <li key={f} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-600" /> {f}
                           </li>
                        ))}
                     </ul>
                     <Link href="/auth/signup" className="inline-block pt-4">
                        <Button variant="ghost" className="text-orange-600 font-black uppercase tracking-widest text-xs p-0 h-auto hover:bg-transparent group-hover:translate-x-2 transition-transform">
                           Join The Fleet <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                     </Link>
                  </div>
               </div>

            </div>

            {/* BOTTOM FEATURE STRIP */}


         </div>
      </section>
   );
}
