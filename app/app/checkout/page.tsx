'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/context/CartContext';
import ApiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  MapPin,
  User,
  Phone,
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  Plus,
  Info,
  Clock,
  CloudRain,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import MapBox from '@/components/MapBox';
import { reverseGeocode } from '@/lib/locationUtils';
import { useLocation } from '@/lib/context/LocationContext';

function PayPalCheckoutWrapper({
  amount,
  isDisabled,
  onSuccess,
  onError,
  onSimulate
}: {
  amount: number;
  isDisabled: boolean;
  onSuccess: (details: any) => Promise<void>;
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
          disabled={isDisabled}
          className="w-full rounded-2xl h-14 font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 border-0"
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
        style={{ layout: 'vertical', shape: 'pill', label: 'pay' }}
        disabled={isDisabled}
        createOrder={async (data, actions) => {
          const res = await ApiClient.createPayPalOrder(amount);
          if (res.data && res.data.id) return res.data.id;
          throw new Error(res.error || 'Failed to create PayPal order');
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            const details = await actions.order.capture();
            const res = await ApiClient.capturePayPalOrder(data.orderID);
            if (res.data && res.data.status === 'COMPLETED') {
              await onSuccess(details);
            } else {
              onError(res.error || 'PayPal capture failed');
            }
          }
        }}
        onError={(err) => {
          console.error('PayPal Button error:', err);
          onError('PayPal payment failed. Please try again.');
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart, isLoading: cartLoading } = useCart();
  const { selectedLocation } = useLocation();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isManualAddress, setIsManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    label: 'Custom Address',
    street: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0
  });

  const [orderForOthers, setOrderForOthers] = useState(false);
  const [recipient, setRecipient] = useState({
    name: '',
    phone: ''
  });

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Dynamic Pricing State
  const [feesBreakdown, setFeesBreakdown] = useState<{
    totalDeliveryFee: number;
    details: Record<string, any>;
    isLoading: boolean;
  }>({
    totalDeliveryFee: 0,
    details: {},
    isLoading: false
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'paypal'>('cod');
  
  // Simulated PayPal Modal states
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [payPalStep, setPayPalStep] = useState<1 | 2 | 3 | 4>(1);
  const [payPalEmail, setPayPalEmail] = useState('');
  const [payPalPassword, setPayPalPassword] = useState('');
  const [payPalLoading, setPayPalLoading] = useState(false);

  useEffect(() => {
    if (selectedLocation) {
      // Check if the global selected location matches any of the user's saved addresses
      const savedAddr = user?.addresses?.find((a: any) =>
        a.latitude === selectedLocation.latitude && a.longitude === selectedLocation.longitude
      );

      if (savedAddr) {
        setSelectedAddressId(savedAddr._id);
        setIsManualAddress(false);
      } else {
        // It's a custom or searched location from the dashboard
        setManualAddress({
          label: selectedLocation.label || 'Selected Location',
          street: selectedLocation.street || '',
          city: selectedLocation.city || '',
          state: selectedLocation.state || '',
          pincode: selectedLocation.pincode || '',
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        });
        setIsManualAddress(true);
      }
    } else if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [user, selectedLocation]);

  // Update Fees Effect
  useEffect(() => {
    const fetchFees = async () => {
      if (cartItems.length === 0) return;

      let deliveryAddress;
      if (isManualAddress) {
        if (!manualAddress.latitude || !manualAddress.longitude) return;
        deliveryAddress = manualAddress;
      } else {
        deliveryAddress = user?.addresses?.find((a: any) => a._id === selectedAddressId);
        if (!deliveryAddress) return;
      }

      setFeesBreakdown(prev => ({ ...prev, isLoading: true }));
      try {
        const pharmacyIds = Array.from(new Set(cartItems.map(item => item.pharmacyId)));
        let totalFee = 0;
        const details: Record<string, any> = {};

        for (const pId of pharmacyIds) {
          const { data, error } = await ApiClient.previewFees(pId, deliveryAddress, false); // isEmergency can be added as a switch
          if (data) {
            totalFee += data.deliveryFee;
            details[pId] = data;
          }
        }

        setFeesBreakdown({
          totalDeliveryFee: totalFee,
          details,
          isLoading: false
        });
      } catch (err) {
        console.error('Error fetching fees:', err);
        setFeesBreakdown(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchFees();
  }, [cartItems, selectedAddressId, isManualAddress, manualAddress.latitude, manualAddress.longitude, user]);

  const handlePlaceOrder = async (methodOverride?: string) => {
    if (cartItems.length === 0) return;

    setIsPlacingOrder(true);
    setError(null);

    const finalPaymentMethod = methodOverride || paymentMethod;

    try {
      // 1. Determine delivery address
      let deliveryAddress;
      if (isManualAddress) {
        if (!manualAddress.street || !manualAddress.city) {
          throw new Error('Please enter complete manual address details');
        }
        deliveryAddress = manualAddress;
      } else {
        deliveryAddress = user?.addresses?.find((a: any) => a._id === selectedAddressId);
        if (!deliveryAddress) {
          throw new Error('Please select a delivery address');
        }
      }

      // 2. Determine recipient details
      let notes = '';
      if (orderForOthers) {
        if (!recipient.name || !recipient.phone) {
          throw new Error('Please enter recipient details');
        }
        notes = `Order for: ${recipient.name} (${recipient.phone})`;
      }

      // 3. Group items by pharmacy to create multiple orders if needed
      const pharmacyGroups = cartItems.reduce((acc, item) => {
        if (!acc[item.pharmacyId]) acc[item.pharmacyId] = [];
        acc[item.pharmacyId].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      const pharmacyIds = Object.keys(pharmacyGroups);

      // Perform all orders
      for (const pId of pharmacyIds) {
        const items = pharmacyGroups[pId].map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }));

        await ApiClient.createOrder(
          pId,
          items,
          deliveryAddress,
          false, // Not emergency by default here
          finalPaymentMethod,
          notes
        );
      }

      // 4. Success handling
      await clearCart();
      router.push('/app/orders?success=true');
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const payPalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const handlePayPalPaymentSuccess = async (details: any) => {
    console.log('PayPal transaction completed:', details);
    await handlePlaceOrder('card');
  };

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
        await handlePlaceOrder('card');
      }, 2000);
    }
  };

  const onLocationSelect = async (lat: number, lng: number) => {
    setIsLocating(true);
    try {
      const address = await reverseGeocode(lat, lng);
      if (address) {
        setManualAddress({
          label: 'Manual Selection',
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          latitude: lat,
          longitude: lng
        });
      }
    } catch (err) {
      console.error('Error in selection:', err);
    } finally {
      setIsLocating(false);
    }
  };

  if (!user && !cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">

          {/* 1. Delivery Address Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Saved Addresses */}
              {user?.addresses?.map((addr: any) => (
                <div
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddressId(addr._id);
                    setIsManualAddress(false);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${!isManualAddress && selectedAddressId === addr._id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100 hover:border-primary/20 bg-white'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">{addr.label}</span>
                    {!isManualAddress && selectedAddressId === addr._id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="font-bold text-gray-900 mt-1">{addr.street}</p>
                  <p className="text-xs text-secondary-foreground/60">{addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
              ))}

              {/* Manual/New Address Card */}
              <div
                onClick={() => setIsManualAddress(true)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden ${isManualAddress
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 border-dashed hover:border-primary/40 bg-gray-50/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">New Address</span>
                  {isManualAddress && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                {isManualAddress && manualAddress.street ? (
                  <>
                    <p className="font-bold text-gray-900 mt-1 line-clamp-1">{manualAddress.street}</p>
                    <p className="text-xs text-secondary-foreground/60">{manualAddress.city} {manualAddress.pincode}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setIsMapModalOpen(true); }}
                      className="mt-2 h-7 text-[10px] font-bold uppercase tracking-widest gap-1 p-0 hover:bg-transparent text-primary"
                    >
                      Change on Map
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 gap-2 text-primary/60">
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-widest">Select on Map</span>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry Fields (if manual address selected) */}
            {isManualAddress && (
              <Card className="border-primary/10 bg-white shadow-sm rounded-2xl">
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Street / Area / House No.</Label>
                    <Input
                      value={manualAddress.street}
                      onChange={(e) => setManualAddress(p => ({ ...p, street: e.target.value }))}
                      placeholder="e.g. Flat 402, Sunshine Apts"
                      className="rounded-xl border-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">City</Label>
                    <Input
                      value={manualAddress.city}
                      onChange={(e) => setManualAddress(p => ({ ...p, city: e.target.value }))}
                      placeholder="City"
                      className="rounded-xl border-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Pincode</Label>
                    <Input
                      value={manualAddress.pincode}
                      onChange={(e) => setManualAddress(p => ({ ...p, pincode: e.target.value }))}
                      placeholder="123456"
                      maxLength={6}
                      className="rounded-xl border-gray-100"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* 2. Order for Others Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Recipient Details
              </h2>
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order for someone else?</span>
                <Switch
                  checked={orderForOthers}
                  onCheckedChange={setOrderForOthers}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            {orderForOthers && (
              <Card className="border-primary/10 bg-white shadow-sm rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Recipient Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={recipient.name}
                        onChange={(e) => setRecipient(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. John Doe"
                        className="rounded-xl border-gray-100 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Recipient Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={recipient.phone}
                        onChange={(e) => setRecipient(p => ({ ...p, phone: e.target.value }))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="rounded-xl border-gray-100 pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!orderForOthers && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 text-sm italic">
                Delivering to yourself ({user?.name || 'User'})
              </div>
            )}
          </section>

          {/* 3. Payment Method */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-100 hover:border-primary/20 bg-white shadow-sm'
                }`}
              >
                <div className={`h-10 w-10 flex items-center justify-center rounded-full font-black ${
                  paymentMethod === 'cod' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  ₹
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay at your doorstep with cash/UPI</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  paymentMethod === 'paypal'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-100 hover:border-primary/20 bg-white shadow-sm'
                }`}
              >
                <div className={`h-10 w-10 flex items-center justify-center rounded-full font-black ${
                  paymentMethod === 'paypal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  PP
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">PayPal / Card</p>
                  <p className="text-xs text-gray-500">Pay securely online with PayPal/Card</p>
                </div>
              </div>
            </div>

            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">Pay on Delivery</p>
                  <p className="text-xs text-emerald-600">Payment will be collected at your doorstep. Please keep change ready.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900">PayPal / Cards</p>
                  <p className="text-xs text-blue-600">
                    {payPalClientId 
                      ? 'Pay with PayPal (Official integration).' 
                      : 'Swasth Sandbox active. A simulated PayPal checkout will open.'}
                  </p>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-4">
          <Card className="border-primary/20 bg-white sticky top-24 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
              <h3 className="font-extrabold text-lg text-gray-900">Order Summary</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.medicineName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.price}</p>
                    </div>
                    <span className="font-bold text-sm text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 font-medium text-gray-600 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{cartTotal}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center group cursor-pointer" onClick={() => setShowBreakdown(!showBreakdown)}>
                    <div className="flex items-center gap-1.5">
                      <span>Delivery Fee</span>
                      <Info className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    {feesBreakdown.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-900">
                          {feesBreakdown.totalDeliveryFee > 0 ? `₹${feesBreakdown.totalDeliveryFee}` : 'Calculating...'}
                        </span>
                        {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown Detail */}
                  {showBreakdown && !feesBreakdown.isLoading && feesBreakdown.totalDeliveryFee > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      {Object.entries(feesBreakdown.details).map(([pId, detail]: [string, any]) => {
                        const pharmacyName = cartItems.find(i => i.pharmacyId === pId)?.pharmacyName || 'Pharmacy';
                        return (
                          <div key={pId} className="space-y-2 last:border-0 border-b border-gray-100 pb-2 last:pb-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{pharmacyName}</p>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-500">
                              <div className="flex justify-between">
                                <span>Base Fee</span>
                                <span className="font-medium text-gray-700">₹{detail.baseFee}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Distance ({detail.distanceKm} km)</span>
                                <span className="font-medium text-gray-700">₹{detail.distanceCharge + detail.fuelCharge}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span className="font-medium text-gray-700">₹{detail.platformFee}</span>
                              </div>

                              {detail.surgeMultiplier > 1 && (
                                <div className="col-span-2 mt-1 pt-1 border-t border-dashed border-gray-200">
                                  <p className="font-bold text-amber-600 flex items-center gap-1 mb-1">
                                    <Zap className="w-3 h-3" /> Surge Applied ({detail.surgeMultiplier}x)
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {detail.surgeFactors.isPeakHour && (
                                      <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                        <Clock className="w-2.5 h-2.5" /> PEAK HOURS
                                      </span>
                                    )}
                                    {detail.surgeFactors.isWeatherSurge && (
                                      <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                        <CloudRain className="w-2.5 h-2.5" /> {detail.surgeFactors.weatherCondition.toUpperCase()}
                                      </span>
                                    )}
                                    {detail.surgeFactors.isEmergency && (
                                      <span className="flex items-center gap-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                        <AlertCircle className="w-2.5 h-2.5" /> EMERGENCY
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
                <span className="font-extrabold text-gray-900 text-lg">Total</span>
                <span className="font-black text-3xl text-primary">₹{cartTotal + feesBreakdown.totalDeliveryFee}</span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {paymentMethod === 'cod' ? (
                <Button
                  onClick={() => handlePlaceOrder('cod')}
                  disabled={isPlacingOrder || cartItems.length === 0}
                  className="w-full rounded-2xl h-14 font-black text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order ₹{cartTotal + feesBreakdown.totalDeliveryFee}
                    </>
                  )}
                </Button>
              ) : (
                payPalClientId ? (
                  <PayPalScriptProvider options={{ clientId: payPalClientId, currency: 'USD' }}>
                    <PayPalCheckoutWrapper
                      amount={cartTotal + feesBreakdown.totalDeliveryFee}
                      isDisabled={isPlacingOrder || cartItems.length === 0}
                      onSuccess={handlePayPalPaymentSuccess}
                      onError={setError}
                      onSimulate={startPayPalSimulation}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <Button
                    onClick={startPayPalSimulation}
                    disabled={isPlacingOrder || cartItems.length === 0}
                    className="w-full rounded-2xl h-14 font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 border-0"
                  >
                    Pay with PayPal (Sandbox)
                  </Button>
                )
              )}

              <p className="text-[10px] text-center text-gray-400 font-medium px-4">
                By clicking "Place Order", you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MAP PICKER MODAL */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Navigation className="w-6 h-6" /> Select Location
            </DialogTitle>
            <DialogDescription className="text-white/70 font-medium pt-1">
              Drag the marker or click on the map to set your delivery location.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-[450px]">
            <MapBox
              isPicker={true}
              center={manualAddress.latitude ? { lat: manualAddress.latitude, lng: manualAddress.longitude } : { lat: 19.076, lng: 72.8777 }}
              onLocationSelect={onLocationSelect}
              height="450px"
            />

            {isLocating && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-bold text-gray-700">Detecting Address...</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-gray-50 flex flex-col md:flex-row gap-4 sm:justify-between border-t border-gray-100">
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Detected Area</p>
              <p className="text-sm font-bold text-gray-700 line-clamp-1">
                {manualAddress.street || 'Select a point on the map'}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button
                variant="ghost"
                className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400"
                onClick={() => setIsMapModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20"
                onClick={() => setIsMapModalOpen(false)}
                disabled={!manualAddress.street}
              >
                Confirm Location
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SIMULATED PAYPAL DIALOG */}
      <Dialog open={isPayPalModalOpen} onOpenChange={setIsPayPalModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>PayPal Sandbox Checkout</DialogTitle>
            <DialogDescription>Simulated sandbox billing gateway</DialogDescription>
          </DialogHeader>
          {/* Custom PayPal Styled Header */}
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
                      ₹{cartTotal + feesBreakdown.totalDeliveryFee}
                      <span className="text-xs font-bold text-slate-400 ml-1.5">
                        (~${((cartTotal + feesBreakdown.totalDeliveryFee) / 83).toFixed(2)} USD)
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
                        <p className="text-[10px] text-slate-400">Available: $250.00 USD</p>
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
                      <p className="text-sm font-bold text-slate-800">Processing PayPal Payment...</p>
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
                      <p className="text-xs text-slate-400 mt-1">Recording your order in SwasthRoute...</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
