'use client';

import {
  Building2, Pill, ShoppingCart,
  Search, ShieldCheck, Zap,
  BarChart3, RefreshCw, Smartphone,
  Package, Clock, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mainFeatures = [
  {
    title: 'Smart Billing & POS',
    desc: 'GST-compliant billing with WhatsApp integration, barcode scanning, and instant invoice generation.',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'AI Inventory Mgmt',
    desc: 'Automated restocking alerts, multi-batch tracking, and intelligent expiry management systems.',
    icon: Package,
    color: 'text-teal-600',
    bg: 'bg-teal-50'
  },
  {
    title: 'Customer CRM',
    desc: 'Automated refill reminders, loyalty points, and personalized health notifications for your patients.',
    icon: RefreshCw,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    title: 'Live Delivery Map',
    desc: 'Connect with a dedicated fleet of riders for sub-15 minute emergency medicine delivery.',
    icon: Smartphone,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  }
];

export default function ProductOverview() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(var(--primary-rgb),0.02)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete Pharmacy Ecosystem</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Everything you need to <br />
            <span className="text-primary italic">Digitize your Pharmacy.</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Stop using legacy software. SwasthRoute provides an all-in-one cloud platform to manage sales, inventory, compliance, and delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mainFeatures.map((f, i) => (
            <div key={i} className="group p-8 rounded-[2.5rem] bg-gray-50/50 border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <f.icon className={`w-7 h-7 ${f.color}`} />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-4">{f.title}</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                {f.desc}
              </p>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-500">
                Explore More <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"><ChevronRight className="w-3 h-3" /></div>
              </div>
            </div>
          ))}
        </div>

        {/* MOCKUP PREVIEW SECTION */}
        <div className="mt-32 relative">
          <div className="absolute -inset-4 bg-primary/5 rounded-[3.5rem] blur-3xl -z-10" />
          <div className="bg-white rounded-[3rem] p-4 md:p-8 border border-gray-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-16 p-8 lg:p-12">
              <div className="flex-1 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                    A Unified Dashboard <br />
                    <span className="text-gray-400">for Data-Driven Growth.</span>
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    Get a bird's-eye view of your entire business. Track revenue trends, monitor inventory health, and manage emergency medicine requests from a single, intuitive interface.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-primary">₹12.5L+</div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly GTV</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-primary">99.8%</div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Accuracy</p>
                  </div>
                </div>

                <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                  Start Your 14-Day Free Trial
                </Button>
              </div>
              <div className="flex-1 w-full max-w-2xl relative min-h-[400px]">
                {/* Main Image (Revenue) */}
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl rotate-[-2deg] hover:rotate-0 transition-all duration-700">
                   <img 
                     src="/track revenue.png" 
                     alt="Revenue Analytics" 
                     className="w-full h-auto"
                   />
                </div>

                {/* Overlapping Image 1 (Invoice) */}
                <div className="absolute -top-10 -right-10 w-2/3 z-20 rounded-2xl overflow-hidden border-4 border-white shadow-2xl rotate-[3deg] hover:rotate-0 transition-all duration-700 hidden sm:block">
                   <img 
                     src="/track invoice.png" 
                     alt="Invoice Tracking" 
                     className="w-full h-auto"
                   />
                </div>

                {/* Overlapping Image 2 (Bill) */}
                <div className="absolute -bottom-10 -left-10 w-1/2 z-30 rounded-xl overflow-hidden border-4 border-white shadow-2xl rotate-[-5deg] hover:rotate-0 transition-all duration-700 hidden sm:block">
                   <img 
                     src="/print  bill.png" 
                     alt="Print Billing" 
                     className="w-full h-auto"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
