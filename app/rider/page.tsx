'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Bike, MapPin, Navigation, Package, CheckCircle2, 
  Power, ShieldCheck, AlertCircle, RefreshCw, ChevronRight,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ApiClient from '@/lib/api';
import MapBox from '@/components/MapBox';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RiderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [nearbyOrders, setNearbyOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Registration Form State
  const [regData, setRegData] = useState({
    vehicleType: 'bike',
    vehicleNumber: ''
  });

  useEffect(() => {
    if (user && user.role === 'rider') {
      fetchRiderData();
      initSocket();
    } else if (user && user.role !== 'rider') {
      setIsLoading(false);
    }
  }, [user]);

  const initSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
      console.log('Socket initialized');
    }
  };

  const fetchRiderData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await ApiClient.getRiderProfile();
      if (profileRes.data) {
        setProfile(profileRes.data);
        setIsOnline(profileRes.data.status !== 'offline');
        
        if (profileRes.data.activeOrder) {
          const orderRes = await ApiClient.getOrderDetails(profileRes.data.activeOrder);
          if (orderRes.data) setActiveOrder(orderRes.data);
        }
      }

      const ordersRes = await ApiClient.getNearbyOrders();
      if (ordersRes.data) setNearbyOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching rider data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Track location when online
  useEffect(() => {
    if (isOnline && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Update backend
          ApiClient.updateRiderLocation(latitude, longitude);
          
          // Emit via socket if there's an active order
          if (activeOrder && socketRef.current) {
            socketRef.current.emit('update-location', {
              orderId: activeOrder._id,
              riderId: user?.id,
              latitude,
              longitude
            });
          }
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    } else {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isOnline, activeOrder]);

  const handleToggleOnline = async (checked: boolean) => {
    try {
      const status = checked ? 'available' : 'offline';
      const res = await ApiClient.updateRiderStatus(status as any);
      if (!res.error) {
        setIsOnline(checked);
        toast.success(checked ? "You're now online and available!" : "You're now offline.");
      }
    } catch (error) {
       toast.error("Failed to update status");
    }
  };

  const handleRegister = async () => {
    if (!regData.vehicleNumber) return toast.error("Vehicle number is required");
    
    setIsRegistering(true);
    try {
      // Get initial location
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await ApiClient.registerRider({
          ...regData,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        
        if (!res.error) {
          toast.success("Welcome aboard! Your rider profile is ready.");
          window.location.reload(); // Refresh to update role
        } else {
          toast.error(res.error);
        }
      });
    } catch (error) {
      toast.error("Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await ApiClient.acceptRiderOrder(orderId);
      if (!res.error) {
        toast.success("Order accepted! Head to the pharmacy.");
        fetchRiderData();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to accept order");
    }
  };

  const handlePickup = async () => {
    if (!activeOrder) return;
    try {
      const res = await ApiClient.pickupOrder(activeOrder._id);
      if (!res.error) {
        toast.success("Order picked up! Navigate to customer.");
        fetchRiderData();
      }
    } catch (error) {
      toast.error("Pickup failed");
    }
  };

  const handleDeliver = async () => {
    if (!activeOrder) return;
    try {
      const res = await ApiClient.deliverOrder(activeOrder._id);
      if (!res.error) {
        toast.success("Delivery completed! Great job.");
        fetchRiderData();
        setActiveOrder(null);
      }
    } catch (error) {
      toast.error("Delivery completion failed");
    }
  };

  if (authLoading || (isLoading && user?.role === 'rider')) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Rider Module...</p>
      </div>
    );
  }

  // Registration View for non-riders
  if (user && user.role !== 'rider') {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full rounded-[2.5rem] border-0 shadow-2xl overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-primary p-8 text-white flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Bike className="w-10 h-10 text-white" />
             </div>
             <div className="text-center">
                <h1 className="text-2xl font-black">Become a Delivery Partner</h1>
                <p className="text-sm text-white/70 mt-1">Earn on every delivery, join the team!</p>
             </div>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-1">Select Vehicle</label>
                  <div className="grid grid-cols-2 gap-3">
                     {['bike', 'scooter'].map(t => (
                       <button 
                        key={t}
                        onClick={() => setRegData({...regData, vehicleType: t})}
                        className={`py-3 rounded-2xl border-2 font-bold text-sm capitalize transition-all ${
                          regData.vehicleType === t ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-100 text-zinc-400'
                        }`}
                       >
                         {t}
                       </button>
                     ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-1">Vehicle License Plate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MH 01 AB 1234"
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                    value={regData.vehicleNumber}
                    onChange={(e) => setRegData({...regData, vehicleNumber: e.target.value})}
                  />
               </div>
            </div>
            <Button 
              onClick={handleRegister} 
              disabled={isRegistering}
              className="w-full h-14 rounded-[1.25rem] bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs border-0 shadow-xl"
            >
              {isRegistering ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Start Earning Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      
      {/* HEADER SECTION */}
      <div className="bg-white px-6 py-8 border-b border-zinc-100 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center shrink-0 border-4 border-zinc-50 shadow-xl">
               <Bike className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                {profile?.userId?.name}
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2 py-0.5 text-[9px] font-black">CERTIFIED RIDER</Badge>
              </h1>
              <div className="flex items-center gap-4 mt-1.5 font-bold text-zinc-400 text-xs uppercase tracking-widest">
                 <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Rating {profile?.rating?.toFixed(1) || '5.0'}</span>
                 <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> 100% Efficiency</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-[2rem] border border-zinc-100 shadow-inner">
             <div className={`flex items-center gap-2 px-6 py-2 rounded-[1.5rem] transition-all ${isOnline ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-zinc-200 text-zinc-500'}`}>
                {isOnline ? <Power className="w-4 h-4 font-bold" /> : <Power className="w-4 h-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
             </div>
             <Switch 
               checked={isOnline} 
               onCheckedChange={handleToggleOnline}
               className="data-[state=checked]:bg-emerald-500"
             />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Map & Active Order */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* MAP DISPLAY */}
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white h-[400px] relative group">
            <MapBox 
              center={currentLocation || {lat: 19.076, lng: 72.8777}} 
              zoom={14}
              markers={nearbyOrders.map(o => ({
                lat: o.pharmacyId?.location?.coordinates[1] || 0,
                lng: o.pharmacyId?.location?.coordinates[0] || 0,
                name: o.pharmacyId?.name,
                color: 'text-amber-500'
              }))}
            />
            {!isOnline && (
              <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center text-white z-10 transition-opacity">
                 <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-6">
                    <Power className="w-10 h-10 text-white animate-pulse" />
                 </div>
                 <h3 className="text-2xl font-black mb-2">You are Currently Offline</h3>
                 <p className="text-sm font-medium text-white/70 max-w-xs">Switch to online status to start receiving nearby delivery requests.</p>
                 <Button onClick={() => handleToggleOnline(true)} className="mt-8 bg-primary hover:bg-primary-hover text-white rounded-2xl h-12 px-10 font-black uppercase tracking-widest text-[10px]">Go Online</Button>
              </div>
            )}
          </div>

          {/* ACTIVE ORDER CARD */}
          {activeOrder && (
            <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-primary/10 overflow-hidden animate-in slide-in-from-bottom duration-500">
              <div className="bg-zinc-900 px-8 py-4 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Live Delivery in Progress</span>
                 </div>
                 <Badge className="bg-primary/20 text-primary border-primary/30 rounded-lg px-2 py-0.5 text-[9px] font-black">{activeOrder.status.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="flex gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                            <Package className="w-6 h-6 text-zinc-900" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pick up from</p>
                            <h4 className="font-black text-lg text-zinc-900 leading-tight">{activeOrder.pharmacyId?.name}</h4>
                            <p className="text-xs font-bold text-zinc-500 mt-1">{activeOrder.pharmacyId?.address?.street}</p>
                         </div>
                      </div>
                      <div className="flex gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                            <MapPin className="w-6 h-6 text-amber-600" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Deliver to</p>
                            <h4 className="font-black text-lg text-zinc-900 leading-tight">{activeOrder.deliveryAddress?.street}</h4>
                            <p className="text-xs font-bold text-zinc-500 mt-1">{activeOrder.deliveryAddress?.city}</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col justify-between items-end border-l border-zinc-100 pl-8">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Delivery Fee</p>
                         <div className="text-4xl font-black text-zinc-900">₹{activeOrder.deliveryFee || 50}</div>
                      </div>
                      <div className="space-y-3 w-full mt-8">
                        {activeOrder.status === 'assigned' && (
                          <Button onClick={handlePickup} className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] border-0 shadow-xl">
                             Confirm Pick Up <CheckCircle2 className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                        {activeOrder.status === 'picked_up' && (
                          <Button onClick={handleDeliver} className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] border-0 shadow-xl shadow-emerald-100">
                             Mark as Delivered <CheckCircle2 className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN: Nearby Requests */}
        <div className="lg:col-span-4 space-y-6">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black text-zinc-900 flex items-center gap-3">
                 Nearby Requests
              </h2>
              <Badge className="bg-zinc-900 text-white rounded-full px-3 py-1 font-black text-[9px]">{nearbyOrders.length}</Badge>
           </div>
           
           <div className="space-y-4">
              {nearbyOrders.length > 0 ? nearbyOrders.filter(o => o.status === 'accepted').map(order => (
                <Card key={order._id} className="rounded-3xl border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                   <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                           <Navigation className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">Earning</p>
                           <p className="text-xl font-black text-zinc-900">₹{order.deliveryFee || 50}</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-zinc-900 leading-tight mb-1">{order.pharmacyId?.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase truncate">{order.pharmacyId?.address?.street}</p>
                      
                      <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-zinc-500 text-xs font-black">
                            <Clock className="w-4 h-4 text-primary" /> 5-8 min
                         </div>
                         <Button onClick={() => handleAcceptOrder(order._id)} className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white px-5 font-black uppercase tracking-widest text-[9px]">Accept Order</Button>
                      </div>
                   </CardContent>
                </Card>
              )) : (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-zinc-100">
                   <div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-6 h-6 text-zinc-300" />
                   </div>
                   <p className="text-zinc-400 font-black text-[10px] uppercase tracking-widest">Scanning for requests...</p>
                </div>
              )}
           </div>

           {/* EARNINGS SUMMARY */}
           <Card className="rounded-[2rem] border-0 bg-gradient-to-br from-zinc-800 to-zinc-900 text-white p-8 shadow-2xl relative overflow-hidden mt-8">
              <Award className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Today's Earnings</p>
                <h3 className="text-5xl font-black mb-6 tracking-tighter">₹{profile?.totalEarnings || 0}</h3>
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                   <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Deliveries</p>
                      <p className="font-black text-xl">12</p>
                   </div>
                   <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Bonus</p>
                      <p className="font-black text-xl text-primary">₹150</p>
                   </div>
                </div>
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
}
