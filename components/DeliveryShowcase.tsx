'use client';

import { 
  Bike, MapPin, Navigation, 
  Smartphone, ShieldCheck, Zap,
  ArrowRight, Timer, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DeliveryShowcase() {
  return (
    <section className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2 -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* LEFT CONTENT: Logistics & Rider Focus */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em]">
                <Bike className="w-3.5 h-3.5" />
                <span>Lightning Logistics</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                Medicine Delivery <br/>
                <span className="text-orange-500 italic">Redefined.</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
                We've built a hyper-local logistics engine that ensures your emergency medicines are picked up and delivered within 15 minutes of order acceptance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-orange-500">
                     <Navigation className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-gray-900">Live GPS Routing</h4>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                     Our smart algorithms find the fastest route through local traffic to your doorstep.
                  </p>
               </div>
               <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-orange-500">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-gray-900">Contactless Safety</h4>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                     Every delivery partner follows strict hygiene and contactless protocols for your safety.
                  </p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link href="/auth/signup">
                 <Button className="h-16 px-10 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20">
                    Become a Delivery Partner
                    <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </Link>
              <div className="flex items-center gap-4 px-6 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Fleet</span>
                    <span className="text-sm font-black text-gray-900">1,240+ Active Riders</span>
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: The Visual Element */}
          <div className="relative">
             <div className="absolute -inset-10 bg-orange-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
             
             <div className="relative z-10 space-y-6">
                {/* Main Illustration Container */}
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Timer className="w-40 h-40 text-orange-600" />
                   </div>
                   
                   <div className="relative z-10 text-center space-y-8">
                      <div className="max-w-[280px] mx-auto relative rounded-[3rem] border-[12px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden bg-slate-900 group-hover:rotate-[-2deg] transition-all duration-700">
                         <img 
                           src="/phone.png" 
                           alt="Mobile App Interface" 
                           className="w-full h-auto" 
                         />
                      </div>
                      
                      <div className="space-y-4">
                         <h3 className="text-2xl font-black text-gray-900">Safety First Protocol</h3>
                         <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
                            Our "Safe Delivery" initiative ensures all riders are background-verified and trained for medical handling through our specialized mobile app.
                         </p>
                      </div>
                   </div>
                </div>

                {/* Floating Real-time Stats */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-4 group hover:-translate-y-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                         <Timer className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Time</p>
                         <p className="text-lg font-black text-gray-900">14.2 mins</p>
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-4 group hover:-translate-y-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                         <History className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking</p>
                         <p className="text-lg font-black text-gray-900">Live Satellite</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
