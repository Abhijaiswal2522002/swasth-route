'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, Crown, ShieldCheck, Zap, 
  CreditCard, Info, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

const plans = [
  {
    name: 'Standard',
    tagline: 'Basic Digital Presence',
    price: '0',
    duration: '/month',
    description: 'Perfect for small pharmacies starting their digital journey.',
    features: [
      '10% Platform Commission',
      'Basic Medicine Listing',
      'Manual Order Management',
      'Standard Search Visibility',
      '30-Day Analytics History'
    ],
    buttonText: 'Current Plan',
    current: true,
    color: 'bg-gray-100',
    textColor: 'text-gray-900',
    icon: Zap
  },
  {
    name: 'Growth Plus',
    tagline: 'Scale Your Business',
    price: '999',
    duration: '/month',
    description: 'Advanced tools to boost your sales and efficiency.',
    features: [
      '5% Platform Commission',
      'Priority Search Results',
      'Automated Restock Alerts',
      'Unlimited Analytics History',
      'Direct WhatsApp Support',
      'Custom Delivery Zones'
    ],
    buttonText: 'Upgrade to Plus',
    current: false,
    popular: true,
    color: 'bg-teal-600',
    textColor: 'text-white',
    icon: ShieldCheck
  },
  {
    name: 'Elite Enterprise',
    tagline: 'Ultimate Performance',
    price: '2499',
    duration: '/month',
    description: 'The complete command center for high-volume pharmacies.',
    features: [
      '2% Platform Commission',
      'Top-Tier Search Ranking',
      'Advanced Inventory Prediction',
      'Loyalty Program Integration',
      'Multi-Staff Access Control',
      'Dedicated Account Manager',
      'Featured Shop Badge'
    ],
    buttonText: 'Upgrade to Elite',
    current: false,
    color: 'bg-[#0f172a]',
    textColor: 'text-white',
    icon: Crown
  }
];

export default function PharmacySubscriptionPage() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = (planName: string) => {
    setLoadingPlan(planName);
    // Simulate payment flow
    setTimeout(() => {
      setLoadingPlan(null);
      alert(`Subscription process for ${planName} would start here. (Stripe/Razorpay Integration needed)`);
    }, 1500);
  };

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Subscription & Plans</h1>
          <p className="text-gray-500 font-medium max-w-xl">Choose a plan that fits your pharmacy's growth scale. Lower your commission and unlock premium features.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
           <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active Plan</p>
              <p className="font-bold text-gray-900 leading-none">Standard Free</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative overflow-hidden flex flex-col rounded-[2.5rem] transition-all duration-500 border-2 ${
              plan.popular ? 'border-teal-500 shadow-2xl shadow-teal-500/10 scale-[1.02]' : 'border-gray-100'
            } ${plan.current ? 'bg-gray-50/30' : 'bg-white'}`}
          >
            {plan.popular && (
              <div className="absolute top-6 right-6">
                <Badge className="bg-teal-500 text-white border-0 py-1 px-3 rounded-full font-black text-[10px] uppercase tracking-widest">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="p-10 pb-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.current ? 'bg-white border-2 border-gray-100 shadow-sm' : 'bg-gray-100'}`}>
                <plan.icon className={`w-7 h-7 ${plan.current ? 'text-gray-400' : 'text-gray-900'}`} />
              </div>
              <CardTitle className="text-3xl font-black text-gray-900 mb-1">{plan.name}</CardTitle>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{plan.tagline}</p>
            </CardHeader>

            <CardContent className="p-10 flex-1 flex flex-col">
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-400 font-bold">{plan.duration}</span>
                </div>
                <p className="mt-4 text-sm text-gray-500 font-medium leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" strokeWidth={4} />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <Button 
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg ${
                    plan.current 
                      ? 'bg-white border-2 border-gray-100 text-gray-400 shadow-none hover:bg-gray-50' 
                      : `${plan.color} ${plan.textColor} hover:scale-[1.02] shadow-xl`
                  }`}
                  disabled={plan.current || loadingPlan !== null}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {loadingPlan === plan.name ? 'Processing...' : plan.buttonText}
                  {!plan.current && loadingPlan !== plan.name && <ArrowUpRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-[#0f172a] rounded-[2rem] p-10 mt-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Info className="w-40 h-40 text-white" />
        </div>
        <div className="max-w-3xl relative z-10">
          <h3 className="text-white text-2xl font-black mb-4">Why upgrade your pharmacy plan?</h3>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            Our premium plans are designed to help you dominate your local area. By reducing platform commissions, you keep more profit from every sale. Elite members also get priority indexing, meaning when a user searches for a medicine, your shop appears at the top.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
               <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-teal-400" />
                  <h4 className="text-white font-bold">Priority Orders</h4>
               </div>
               <p className="text-slate-500 text-sm font-medium">Get access to high-priority emergency order requests before anyone else in your zone.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
               <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-teal-400" />
                  <h4 className="text-white font-bold">Commission Shield</h4>
               </div>
               <p className="text-slate-500 text-sm font-medium">Standard shops pay 10%. Plus shops pay 5%. Elite shops pay only 2%. The savings pay for the plan!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
