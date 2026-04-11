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
  Plus
} from 'lucide-react';
import Link from 'next/link';
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

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart, isLoading: cartLoading } = useCart();

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

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    setIsPlacingOrder(true);
    setError(null);

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
          'Cash on Delivery',
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
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
                    !isManualAddress && selectedAddressId === addr._id 
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
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden ${
                  isManualAddress 
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

          {/* 3. Payment Method (Placeholder for now) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               Cash on Delivery
            </h2>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full shadow-sm text-emerald-600">
                ₹
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Pay on Delivery</p>
                <p className="text-xs text-emerald-600">Payment will be collected at your doorstep.</p>
              </div>
            </div>
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
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-green-600">Free</span>
                </div>
              </div>
              
              <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
                <span className="font-extrabold text-gray-900 text-lg">Total</span>
                <span className="font-black text-3xl text-primary">₹{cartTotal}</span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handlePlaceOrder}
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
                    Place Order ₹{cartTotal}
                  </>
                )}
              </Button>

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
    </div>
  );
}
