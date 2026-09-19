'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import ApiClient from '@/lib/api';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Check, Crown, ShieldCheck, Zap, 
  CreditCard, Info, ArrowUpRight, CheckCircle2,
  TrendingUp, Calculator, Sliders, XCircle, ArrowRight, Loader2
} from 'lucide-react';

function PayPalSubscriptionPaymentWrapper({
  amount,
  onSuccess,
  onError,
  onSimulate
}: {
  amount: number;
  onSuccess: () => Promise<void>;
  onError: (msg: string) => void;
  onSimulate: () => void;
}) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <div className="space-y-4 w-full">
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold text-center">
          <p className="font-bold mb-1">Failed to load PayPal SDK</p>
          <p className="text-slate-500 font-medium leading-relaxed">Check your internet connection or Client ID. You can still complete this transaction using simulated sandbox mode.</p>
        </div>
        <Button
          onClick={onSimulate}
          type="button"
          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 border-0"
        >
          Pay with Simulated PayPal
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[150px] w-full z-10">
      {isPending && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 gap-3 z-20">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading PayPal Buttons...</p>
        </div>
      )}
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'pill', label: 'subscribe' }}
        createOrder={async (data, actions) => {
          const res = await ApiClient.createPayPalOrder(amount);
          if (res.data && res.data.id) return res.data.id;
          throw new Error(res.error || 'PayPal initialization failed');
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            await actions.order.capture();
            const res = await ApiClient.capturePayPalOrder(data.orderID);
            if (res.data && res.data.status === 'COMPLETED') {
              await onSuccess();
            } else {
              onError(res.error || 'PayPal verification failed');
            }
          }
        }}
        onError={(err) => {
          console.error('PayPal upgrade error:', err);
          onError('PayPal failed. Please try again.');
        }}
      />
    </div>
  );
}

const basePlans = [
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'Basic Digital Presence',
    monthlyPrice: 0,
    commissionRate: 10,
    description: 'Perfect for small pharmacies starting their digital journey.',
    features: [
      '10% Platform Commission',
      'Basic Medicine Listing',
      'Manual Order Management',
      'Standard Search Visibility',
      '30-Day Analytics History'
    ],
    color: 'bg-gray-100',
    textColor: 'text-gray-900',
    icon: Zap
  },
  {
    id: 'plus',
    name: 'Growth Plus',
    tagline: 'Scale Your Business',
    monthlyPrice: 999,
    commissionRate: 5,
    description: 'Advanced tools to boost your sales and efficiency.',
    features: [
      '5% Platform Commission',
      'Priority Search Results',
      'Automated Restock Alerts',
      'Unlimited Analytics History',
      'Direct WhatsApp Support',
      'Custom Delivery Zones'
    ],
    popular: true,
    color: 'bg-teal-600',
    textColor: 'text-white',
    icon: ShieldCheck
  },
  {
    id: 'elite',
    name: 'Elite Enterprise',
    tagline: 'Ultimate Performance',
    monthlyPrice: 2499,
    commissionRate: 2,
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
    color: 'bg-[#0f172a]',
    textColor: 'text-white',
    icon: Crown
  }
];

export default function PharmacySubscriptionPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [estimatedSales, setEstimatedSales] = useState<number>(200000); // Default ₹2,00,000 monthly sales
  
  // Modal states
  const [activeModalPlan, setActiveModalPlan] = useState<any | null>(null);
  const [isUpgradeSuccess, setIsUpgradeSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // PayPal Client ID
  const payPalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // PayPal Simulation state
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [payPalStep, setPayPalStep] = useState<1 | 2 | 3 | 4>(1);
  const [payPalEmail, setPayPalEmail] = useState('');
  const [payPalPassword, setPayPalPassword] = useState('');
  const [payPalLoading, setPayPalLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await ApiClient.getPharmacyProfile();
      if (res.data) setProfile(res.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getPlanPrice = (monthlyPrice: number) => {
    if (billingCycle === 'yearly') {
      // 20% discount
      return Math.round(monthlyPrice * 0.8);
    }
    return monthlyPrice;
  };

  const getPlanStatus = (planName: string) => {
    if (!profile) return { isCurrent: planName === 'Standard', isDisabled: planName === 'Standard' };
    
    const rate = profile.commissionRate || 10;
    if (rate === 2) {
      return { isCurrent: planName === 'Elite Enterprise', isDisabled: true };
    }
    if (rate === 5) {
      return { 
        isCurrent: planName === 'Growth Plus', 
        isDisabled: planName === 'Standard' || planName === 'Growth Plus' 
      };
    }
    return { 
      isCurrent: planName === 'Standard', 
      isDisabled: planName === 'Standard' 
    };
  };

  // Commission Savings Calculations
  const calculateCommissionCost = (sales: number, rate: number, monthlySubscription: number) => {
    const commission = Math.round(sales * (rate / 100));
    const subCost = billingCycle === 'yearly' ? Math.round(monthlySubscription * 0.8) : monthlySubscription;
    return commission + subCost;
  };

  const getBestPlanRecommendation = () => {
    const standardCost = calculateCommissionCost(estimatedSales, 10, 0);
    const plusCost = calculateCommissionCost(estimatedSales, 5, 999);
    const eliteCost = calculateCommissionCost(estimatedSales, 2, 2499);

    if (eliteCost < plusCost && eliteCost < standardCost) {
      return {
        plan: 'Elite Enterprise',
        savings: standardCost - eliteCost,
        details: 'With high sales volume, the 2% commission shields your profit.'
      };
    } else if (plusCost < standardCost) {
      return {
        plan: 'Growth Plus',
        savings: standardCost - plusCost,
        details: 'Perfect balance of lower commission and subscription affordability.'
      };
    }
    return {
      plan: 'Standard',
      savings: 0,
      details: 'With your current sales volume, the standard free tier is fine, but you miss out on premium rankings.'
    };
  };

  const recommendation = getBestPlanRecommendation();

  const startPayPalSimulation = () => {
    setPayPalStep(1);
    setPayPalEmail(user?.email || '');
    setPayPalPassword('');
    setIsPayPalModalOpen(true);
  };

  const handlePayPalSimulationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payPalStep === 1) {
      if (!payPalEmail) return;
      setPayPalStep(2);
    } else if (payPalStep === 2) {
      if (!payPalPassword) return;
      setPayPalStep(3);
    } else if (payPalStep === 3) {
      setPayPalStep(4);
      setPayPalLoading(true);
      setTimeout(async () => {
        setPayPalLoading(false);
        setIsPayPalModalOpen(false);
        await completeUpgrade();
      }, 2000);
    }
  };

  const completeUpgrade = async () => {
    if (!activeModalPlan) return;
    
    let targetCommission = 10;
    if (activeModalPlan.name === 'Growth Plus') targetCommission = 5;
    if (activeModalPlan.name === 'Elite Enterprise') targetCommission = 2;

    try {
      const res = await ApiClient.upgradePharmacyPlan(targetCommission);
      if (res.data) {
        setIsUpgradeSuccess(true);
        setActiveModalPlan(null);
        await fetchProfile();
      } else {
        setPaymentError(res.error || 'Failed to update subscription plan.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to update plan.');
    }
  };

  const handleUpgradeClick = (plan: any) => {
    const finalPrice = getPlanPrice(plan.monthlyPrice);
    setActiveModalPlan({
      ...plan,
      price: finalPrice
    });
    setIsUpgradeSuccess(false);
    setPaymentError(null);
  };

  const getActivePlanName = () => {
    if (!profile) return 'Standard Free';
    const rate = profile.commissionRate || 10;
    if (rate === 2) return 'Elite Enterprise';
    if (rate === 5) return 'Growth Plus';
    return 'Standard Free';
  };

  return (
    <div className="space-y-10 p-1 pb-20 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Subscription & Plans</h1>
          <p className="text-slate-500 font-medium max-w-xl">Scale your pharmacy, lower your commissions, and gain priority visibility in search results.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border shadow-sm shrink-0">
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Your Active Plan</p>
            <p className="font-extrabold text-lg text-slate-800 leading-none">{getActivePlanName()}</p>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC SAVINGS CALCULATOR */}
      <Card className="border-0 shadow-xl shadow-slate-100 bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl font-extrabold text-slate-900">Commission Savings Calculator</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Slider */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-400" /> Estimated Monthly Sales
                </span>
                <span className="text-2xl font-black text-teal-600 bg-teal-50/50 px-4 py-1.5 rounded-2xl">
                  ₹{estimatedSales.toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <input 
                  type="range" 
                  min="20000" 
                  max="1000000" 
                  step="10000"
                  value={estimatedSales} 
                  onChange={(e) => setEstimatedSales(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>₹20,000</span>
                  <span>₹500,000</span>
                  <span>₹1,000,000+</span>
                </div>
              </div>
            </div>

            {/* Recommendation Result */}
            <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-lg">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <TrendingUp className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <Badge className="bg-teal-500 text-white border-0 py-0.5 px-2.5 rounded-full font-black text-[9px] uppercase tracking-wider mb-2">
                  Smart Advice
                </Badge>
                {recommendation.savings > 0 ? (
                  <>
                    <h3 className="text-lg font-bold text-slate-100">
                      Upgrade to <span className="text-teal-400 font-extrabold">{recommendation.plan}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{recommendation.details}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-100">Stay on Standard Free Plan</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">At your current sales level, standard is cost-effective, but keep in mind that upgrades give 5x search ranking boost.</p>
                  </>
                )}
              </div>
              {recommendation.savings > 0 && (
                <div className="relative z-10 border-t border-white/10 pt-3 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Estimated Monthly Savings</span>
                  <span className="text-xl font-black text-green-400">₹{recommendation.savings.toLocaleString()} / mo</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. BILLING SWITCH */}
      <div className="flex flex-col items-center justify-center gap-3 pt-4">
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border shadow-sm">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Yearly Billing
            <span className="text-[10px] bg-amber-400 text-slate-900 font-black px-1.5 py-0.5 rounded-md leading-none">
              Save 20%
            </span>
          </button>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {billingCycle === 'yearly' ? 'Billed annually • Cancel anytime' : 'Pay month-to-month • Flex control'}
        </p>
      </div>

      {/* 4. PLANS COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {basePlans.map((plan) => {
          const { isCurrent, isDisabled } = getPlanStatus(plan.name);
          const currentPrice = getPlanPrice(plan.monthlyPrice);
          const hasSavings = billingCycle === 'yearly' && plan.monthlyPrice > 0;
          
          return (
            <Card 
              key={plan.name} 
              className={`relative overflow-hidden flex flex-col rounded-[2.5rem] transition-all duration-500 border-2 ${
                plan.popular ? 'border-teal-500 shadow-2xl shadow-teal-500/10 scale-[1.02]' : 'border-slate-100 shadow-sm'
              } ${isCurrent ? 'bg-teal-50/20 border-teal-500/40 shadow-md' : 'bg-white'}`}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6">
                  <Badge className="bg-teal-500 text-white border-0 py-1.5 px-2.5 rounded-full font-black text-[9px] uppercase tracking-widest">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="p-10 pb-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
                  isCurrent ? 'bg-white border-2 border-teal-100 text-teal-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  <plan.icon className="w-7 h-7" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 mb-1">{plan.name}</CardTitle>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.tagline}</p>
              </CardHeader>

              <CardContent className="p-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">₹{currentPrice}</span>
                    <span className="text-slate-400 font-bold text-sm">/month</span>
                  </div>
                  {hasSavings && (
                    <p className="text-xs text-green-600 font-bold mt-1">
                      Save ₹{(plan.monthlyPrice - currentPrice) * 12} billed yearly (₹{currentPrice * 12}/yr)
                    </p>
                  )}
                  <p className="mt-4 text-xs text-slate-500 font-semibold leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10 border-t border-slate-50 pt-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                        <Check className="w-3 h-3 text-green-600" strokeWidth={4} />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50">
                  <Button 
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg ${
                      isCurrent 
                        ? 'bg-white border-2 border-teal-100 text-teal-600 shadow-none hover:bg-slate-50' 
                        : `${plan.color} ${plan.textColor} hover:scale-[1.02] shadow-xl border-0`
                    }`}
                    disabled={isCurrent || isDisabled}
                    onClick={() => handleUpgradeClick(plan)}
                  >
                    {isCurrent ? 'Current Plan' : ((plan as any).buttonText || 'Select Plan')}
                    {!isCurrent && <ArrowUpRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 5. SIDE-BY-SIDE FEATURE COMPARISON */}
      <Card className="border-0 shadow-lg shadow-slate-100 bg-white rounded-3xl overflow-hidden mt-10">
        <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
          <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-teal-600" /> Plan Features Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-8 py-4">Features</th>
                  <th className="px-6 py-4">Standard</th>
                  <th className="px-6 py-4">Growth Plus</th>
                  <th className="px-6 py-4">Elite Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                <tr className="hover:bg-slate-50/20">
                  <td className="px-8 py-4 font-bold text-slate-800">Platform Commission</td>
                  <td className="px-6 py-4">10%</td>
                  <td className="px-6 py-4 text-teal-600 font-extrabold">5%</td>
                  <td className="px-6 py-4 text-teal-600 font-extrabold">2%</td>
                </tr>
                <tr className="hover:bg-slate-50/20">
                  <td className="px-8 py-4 font-bold text-slate-800">Search Visibility</td>
                  <td className="px-6 py-4">Standard</td>
                  <td className="px-6 py-4 text-slate-800 font-bold">Priority (2x Boost)</td>
                  <td className="px-6 py-4 text-teal-600 font-extrabold">Top-Tier (5x Boost)</td>
                </tr>
                <tr className="hover:bg-slate-50/20">
                  <td className="px-8 py-4 font-bold text-slate-800">Analytics History</td>
                  <td className="px-6 py-4">30 Days</td>
                  <td className="px-6 py-4">Unlimited</td>
                  <td className="px-6 py-4">Unlimited + Forecasts</td>
                </tr>
                <tr className="hover:bg-slate-50/20">
                  <td className="px-8 py-4 font-bold text-slate-800">Support</td>
                  <td className="px-6 py-4">Email</td>
                  <td className="px-6 py-4">WhatsApp Support</td>
                  <td className="px-6 py-4 text-teal-600 font-extrabold">Dedicated Manager 24/7</td>
                </tr>
                <tr className="hover:bg-slate-50/20">
                  <td className="px-8 py-4 font-bold text-slate-800">Store Badge</td>
                  <td className="px-6 py-4 text-slate-300">None</td>
                  <td className="px-6 py-4 text-slate-300">None</td>
                  <td className="px-6 py-4"><span className="text-teal-600 font-extrabold flex items-center gap-1">✓ Elite Badge</span></td>
                </tr>
                <tr className="hover:bg-slate-50/20">
                  <td className="px-8 py-4 font-bold text-slate-800">Custom Delivery Zones</td>
                  <td className="px-6 py-4 text-slate-300">❌</td>
                  <td className="px-6 py-4 text-teal-600">✓ Included</td>
                  <td className="px-6 py-4 text-teal-600">✓ Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* PLAN CHECKOUT DIALOG */}
      <Dialog open={activeModalPlan !== null} onOpenChange={(open) => !open && setActiveModalPlan(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800">
              Upgrade to {activeModalPlan?.name}
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-400">
              Complete payment for your subscription using PayPal.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Plan</span>
                <span>Billing Period</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-slate-800">
                <span>{activeModalPlan?.name}</span>
                <span className="capitalize">{billingCycle}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</p>
                  <p className="text-2xl font-black text-teal-600 mt-0.5">
                    ₹{activeModalPlan?.price}
                    <span className="text-xs text-slate-400 font-bold"> / mo</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bill</p>
                  <p className="text-lg font-black text-slate-800 mt-0.5">
                    ₹{billingCycle === 'yearly' ? activeModalPlan?.price * 12 : activeModalPlan?.price}
                    <span className="text-xs font-bold text-slate-400"> {billingCycle === 'yearly' ? '/ yr' : '/ mo'}</span>
                  </p>
                </div>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                {paymentError}
              </div>
            )}

            <div className="space-y-4">
              {payPalClientId ? (
                <PayPalScriptProvider options={{ clientId: payPalClientId, currency: 'USD' }}>
                  <PayPalSubscriptionPaymentWrapper
                    amount={billingCycle === 'yearly' ? activeModalPlan?.price * 12 : activeModalPlan?.price}
                    onSuccess={completeUpgrade}
                    onError={setPaymentError}
                    onSimulate={startPayPalSimulation}
                  />
                </PayPalScriptProvider>
              ) : (
                <Button
                  onClick={startPayPalSimulation}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 border-0"
                >
                  Pay with PayPal (Sandbox)
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPayPalModalOpen} onOpenChange={setIsPayPalModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>PayPal Sandbox Checkout</DialogTitle>
            <DialogDescription>Simulated sandbox billing gateway</DialogDescription>
          </DialogHeader>
          <div className="bg-[#003087] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black italic tracking-tighter text-[#0070ba]">
                Pay<span className="text-[#00c5ff]">Pal</span>
              </span>
              <span className="text-xs text-white/50 border border-white/20 rounded-md px-1.5 py-0.5 ml-2 font-bold uppercase tracking-wider">Sandbox</span>
            </div>
            <div className="text-[10px] font-bold text-white/60 flex items-center gap-1">
              🔒 Secure Connection
            </div>
          </div>

          <form onSubmit={handlePayPalSimulationSubmit} className="p-8 space-y-6">
            {payPalStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Pay with PayPal</h3>
                  <p className="text-xs text-slate-400">Enter your email or mobile number to get started.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email or Mobile Number</Label>
                  <Input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={payPalEmail}
                    onChange={(e) => setPayPalEmail(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-full h-12 font-bold text-sm shadow-md border-0"
                >
                  Next
                </Button>
              </div>
            )}

            {payPalStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPayPalStep(1)}
                    className="text-xs text-blue-600 font-bold hover:underline mb-1"
                  >
                    ← Back ({payPalEmail})
                  </button>
                  <h3 className="text-xl font-bold text-slate-800">Enter your password</h3>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</Label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={payPalPassword}
                    onChange={(e) => setPayPalPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-full h-12 font-bold text-sm shadow-md border-0"
                >
                  Log In
                </Button>
              </div>
            )}

            {payPalStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Purchase Amount</h3>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      ₹{billingCycle === 'yearly' ? activeModalPlan?.price * 12 : activeModalPlan?.price}
                      <span className="text-xs font-bold text-slate-400 ml-1.5">
                        (~${(((billingCycle === 'yearly' ? activeModalPlan?.price * 12 : activeModalPlan?.price) || 0) / 83).toFixed(2)} USD)
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-3 py-1 font-bold">
                    {payPalEmail}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Choose funding source</Label>
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-white border rounded-lg flex items-center justify-center font-bold text-[10px] text-blue-600 shadow-sm">
                        Bank
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">PayPal Wallet Balance</p>
                        <p className="text-[10px] text-slate-400">Available: $500.00 USD</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ffc439] hover:bg-[#f4b31a] text-slate-900 rounded-full h-12 font-black text-sm shadow-md border-0 uppercase tracking-widest"
                >
                  Complete Purchase
                </Button>
              </div>
            )}

            {payPalStep === 4 && (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                {payPalLoading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-[#0070ba] animate-spin" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Processing Subscription Payment...</p>
                      <p className="text-xs text-slate-400 mt-1">Please do not close this window</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 bg-green-50 rounded-full border border-green-200 flex items-center justify-center text-green-600 animate-bounce">
                      ✓
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-800">Payment Authorized!</p>
                      <p className="text-xs text-slate-400 mt-1">Upgrading your pharmacy subscription...</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* UPGRADE SUCCESS BANNER DIALOG */}
      <Dialog open={isUpgradeSuccess} onOpenChange={setIsUpgradeSuccess}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 bg-white border-none shadow-2xl text-center flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-300">
          <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="text-2xl font-black text-slate-800 leading-tight">
              Subscription Activated!
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-sm mt-2">
              Congratulations! Your pharmacy plan has been successfully upgraded. Your commission rate has been reduced in our system.
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => setIsUpgradeSuccess(false)}
            className="w-full h-12 rounded-xl mt-4 font-bold shadow-md shadow-primary/20"
          >
            Go back to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
