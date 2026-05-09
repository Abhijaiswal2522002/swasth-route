'use client';

import {
   Zap, Package, CreditCard,
   Share2, ArrowRight, CheckCircle2,
   Sparkles, MessageSquare, HandCoins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const sections = [
   {
      tag: 'Inventory Magic',
      title: 'Inventory so simple, it feels like magic',
      desc: 'Add items, track stock, and manage everything in seconds. No training needed. It’s that easy.',
      features: ['Instant Item Addition', 'Live Stock Alerts', 'Batch-wise Tracking'],
      image: '/inventory.png',
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
   },
   {
      tag: 'Effortless Payments',
      title: 'Record payments effortlessly',
      desc: 'Track every payment, every time — without lifting a finger. While others make it complicated, we make it simple.',
      features: ['One-tap Invoicing', 'GST Ready Reports', 'Digital Ledger'],
      image: '/billing.png',
      icon: HandCoins,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      reverse: true
   },
   {
      tag: 'Smart Sharing',
      title: 'Share anywhere. Get paid faster.',
      desc: 'Send invoices instantly via WhatsApp, email, or SMS. And with smart auto-reminders, you don’t have to chase anyone.',
      features: ['WhatsApp Integration', 'Auto-payment Reminders', 'Professional PDF Invoices'],
      image: '/genrate invoice.png',
      icon: Share2,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
   }
];

export default function PharmacyMagic() {
   return (
      <section className="py-32 bg-white">
         <div className="max-w-7xl mx-auto px-6 space-y-32">

            {sections.map((s, i) => (
               <div key={i} className={`flex flex-col ${s.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24`}>

                  {/* TEXT CONTENT */}
                  <div className="flex-1 space-y-8">
                     <div className="space-y-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${s.bg} border border-transparent text-[10px] font-black uppercase tracking-[0.2em] ${s.color}`}>
                           <s.icon className="w-3.5 h-3.5" />
                           <span>{s.tag}</span>
                        </div>
                        <h3 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                           {s.title}
                        </h3>
                        <p className="text-xl text-gray-500 font-medium leading-relaxed">
                           {s.desc}
                        </p>
                     </div>

                     <div className="space-y-4">
                        {s.features.map((f, idx) => (
                           <div key={idx} className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full ${s.bg} flex items-center justify-center`}>
                                 <CheckCircle2 className={`w-3 h-3 ${s.color}`} strokeWidth={4} />
                              </div>
                              <span className="text-sm font-bold text-gray-700">{f}</span>
                           </div>
                        ))}
                     </div>

                     <div className="flex flex-wrap items-center gap-6 pt-4">
                        <Link href="/auth/signup">
                           <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200">
                              Try for free
                           </Button>
                        </Link>
                        <Link href="/contact" className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-900 hover:text-primary transition-colors">
                           Request a demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                     </div>
                  </div>

                  {/* VISUAL CONTENT */}
                  <div className="flex-1 w-full relative">
                     <div className={`absolute -inset-10 ${s.bg} rounded-full blur-[100px] -z-10 opacity-50`} />
                     <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-gray-200 to-gray-50 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000" />
                        <div className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] bg-white">
                           <img
                              src={s.image}
                              alt={s.title}
                              className="w-full h-auto"
                           />
                        </div>
                     </div>
                  </div>

               </div>
            ))}

            {/* BOTTOM CALLOUT */}
            <div className="bg-primary p-12 md:p-20 rounded-[3rem] text-center space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-20 opacity-10">
                  <Zap className="w-64 h-64 text-white" />
               </div>
               <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                  <h4 className="text-white text-3xl md:text-5xl font-black tracking-tight leading-tight">
                     Ready to attract more <span className="text-teal-300">Pharmacy Shop</span> owners?
                  </h4>
                  <p className="text-white/70 text-lg font-medium leading-relaxed">
                     Join the 1,200+ pharmacies that have already digitized their operations with SwasthRoute. No complex setups, no hidden fees.
                  </p>
               </div>
               <div className="flex justify-center relative z-10">
                  <Link href="/auth/signup">
                     <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-primary hover:bg-gray-100 font-black uppercase tracking-widest text-sm shadow-2xl">
                        Get Started Instantly
                     </Button>
                  </Link>
               </div>
            </div>

         </div>
      </section>
   );
}
