'use client';

import React, { useState, useEffect } from 'react';
import { useRider } from '@/lib/contexts/RiderContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Power, Navigation, Package, ShieldAlert, Truck, Phone, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import ApiClient from '@/lib/api';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

export default function RiderHomePage() {
  const { user } = useAuth();
  const { profile, isOnline, activeOrder, handleToggleOnline, offeredOrder, offerTimer, handleAcceptOrder, handleRejectOrder } = useRider();
  const [activeAmbulanceTrip, setActiveAmbulanceTrip] = useState<any>(null);
  const [offeredAmbulanceTrip, setOfferedAmbulanceTrip] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.vehicleType?.startsWith('ambulance_')) {
      fetchActiveAmbulanceTrip();
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile?.vehicleType?.startsWith('ambulance_')) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('[Ambulance Driver Socket] Connected:', user.id);
      });

      socket.on(`new-ambulance-broadcast-${user.id}`, (data: any) => {
        toast.error('🚨 EMERGENCY AMBULANCE TRIP BROADCASTED TO YOU!');
        setOfferedAmbulanceTrip(data);
      });

      socket.on(`ambulance-booking-cancelled-${user.id}`, (data: any) => {
        toast.info('Emergency booking was cancelled by the patient.');
        setOfferedAmbulanceTrip(null);
        setActiveAmbulanceTrip(null);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, profile]);

  const fetchActiveAmbulanceTrip = async () => {
    try {
      const res = await ApiClient.getActiveDriverAmbulanceTrip();
      if (res.data) {
        setActiveAmbulanceTrip(res.data);
      } else {
        setActiveAmbulanceTrip(null);
      }
    } catch (err) {
      console.error('Error fetching active ambulance trip:', err);
    }
  };

  const handleAcceptAmbulance = async (bookingId: string) => {
    setIsActionLoading(true);
    try {
      const res = await ApiClient.acceptAmbulanceBooking(bookingId);
      if (res.data) {
        toast.success('Ambulance emergency accepted! Proceeding to pickup.');
        setOfferedAmbulanceTrip(null);
        fetchActiveAmbulanceTrip();
      } else {
        toast.error(res.error || 'Failed to accept trip');
      }
    } catch (err) {
      console.error('Accept trip error:', err);
      toast.error('Trip no longer available.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateTripStatus = async (bookingId: string, status: string) => {
    setIsActionLoading(true);
    try {
      const res = await ApiClient.updateAmbulanceTripStatus(bookingId, status);
      if (res.data) {
        toast.success(`Trip status updated to ${status}`);
        fetchActiveAmbulanceTrip();
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const router = useRouter();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-[2rem] border-0 bg-white shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Earnings</p>
          <h3 className="text-2xl font-black text-zinc-900">₹{profile?.totalEarnings || 0}</h3>
        </Card>
        <Card className="rounded-[2rem] border-0 bg-white shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Rating</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-zinc-900">{profile?.rating?.toFixed(1) || '5.0'}</h3>
            <Award className="w-4 h-4 text-primary" />
          </div>
        </Card>
      </div>

      {/* AMBULANCE DRIVER CONTROL PANEL */}
      {profile?.vehicleType?.startsWith('ambulance_') ? (
        <div className="space-y-6">
          {/* Active Ambulance Trip */}
          {activeAmbulanceTrip ? (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest px-2">Active Emergency Dispatch</h3>
              <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden border-2 border-red-500/20 bg-white">
                <div className="bg-red-600 px-6 py-3 flex justify-between items-center text-white animate-pulse">
                  <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Emergency Call
                  </span>
                  <Badge className="bg-white/20 text-white border-0 rounded-lg text-[8px] uppercase">
                    {activeAmbulanceTrip.status}
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shrink-0 text-red-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-zinc-900">Hospital: {activeAmbulanceTrip.destinationHospital?.name}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">Pickup: {activeAmbulanceTrip.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-2xl space-y-2 border border-zinc-100 text-left">
                    <div className="flex justify-between text-xs font-bold text-zinc-600">
                      <span>Total Payout</span>
                      <span className="text-zinc-900 font-black">₹{activeAmbulanceTrip.price}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-zinc-600">
                      <span>Client Contact</span>
                      <span className="text-zinc-900">{activeAmbulanceTrip.userId?.phone}</span>
                    </div>
                  </div>

                  {/* Status update transitions */}
                  <div className="space-y-3">
                    {activeAmbulanceTrip.status === 'accepted' && (
                      <Button
                        onClick={() => handleUpdateTripStatus(activeAmbulanceTrip._id, 'en_route')}
                        disabled={isActionLoading}
                        className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] border-0"
                      >
                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Driving to Patient'}
                      </Button>
                    )}
                    {activeAmbulanceTrip.status === 'en_route' && (
                      <Button
                        onClick={() => handleUpdateTripStatus(activeAmbulanceTrip._id, 'picked_up')}
                        disabled={isActionLoading}
                        className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[10px] border-0"
                      >
                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Patient Boarded / En Route to Hospital'}
                      </Button>
                    )}
                    {activeAmbulanceTrip.status === 'picked_up' && (
                      <Button
                        onClick={() => handleUpdateTripStatus(activeAmbulanceTrip._id, 'completed')}
                        disabled={isActionLoading}
                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] border-0"
                      >
                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Arrived at Hospital / Complete Trip'}
                      </Button>
                    )}

                    <div className="flex gap-3">
                      <a
                        href={`tel:${activeAmbulanceTrip.userId?.phone}`}
                        className="flex-1 h-12 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-800 text-[9px] font-black uppercase tracking-widest"
                      >
                        <Phone className="w-3.5 h-3.5 mr-2" /> Call Patient
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-emerald-100">
                <Navigation className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-zinc-900">Ambulance Standby</h3>
              <p className="text-xs font-bold text-zinc-500 max-w-xs mx-auto">You are active on the network. Awaiting direct hospital emergency coordinates.</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Dispatch zone</span>
              </div>
            </div>
          )}

          {/* Incoming Ambulance Broadcast Overlay */}
          {offeredAmbulanceTrip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <Card className="w-full max-w-sm rounded-[2.5rem] border-0 bg-white shadow-2xl overflow-hidden border-2 border-red-500 animate-in zoom-in-95 duration-300">
                <div className="bg-red-600 px-6 py-4 text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                  <span className="text-xs font-black uppercase tracking-wider">Emergency Dispatch offer</span>
                </div>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-600 border border-red-100 animate-pulse">
                    <Truck className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 block">Emergency Ride Request</span>
                    <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">₹{offeredAmbulanceTrip.price}</h3>
                    <p className="text-xs font-bold text-zinc-500 mt-1">To Hospital: {offeredAmbulanceTrip.hospitalName}</p>
                    <p className="text-[9px] font-medium text-zinc-400 mt-0.5">Pickup: {offeredAmbulanceTrip.pickupAddress} ({offeredAmbulanceTrip.distanceKm} km away)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setOfferedAmbulanceTrip(null)}
                      className="rounded-2xl h-14 border-zinc-100 text-zinc-400 hover:bg-zinc-50 font-black uppercase tracking-widest text-[10px]"
                    >
                      Ignore
                    </Button>
                    <Button 
                      onClick={() => handleAcceptAmbulance(offeredAmbulanceTrip.bookingId)}
                      disabled={isActionLoading}
                      className="rounded-2xl h-14 bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 font-black uppercase tracking-widest text-[10px]"
                    >
                      Accept Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* QUICK ACTIONS / STATUS */}
          {!isOnline && (
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-primary/10">
                <Power className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-zinc-900">Ready to earn?</h3>
              <p className="text-xs font-bold text-zinc-500 max-w-xs mx-auto">Switch to online to start receiving medicine delivery requests in your area.</p>
              <Button
                onClick={() => handleToggleOnline(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]"
              >
                Go Online Now
              </Button>
            </div>
          )}

          {isOnline && !activeOrder && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-emerald-100">
                <Navigation className="w-8 h-8 text-emerald-500 " />
              </div>
              <h3 className="text-xl font-black text-zinc-900">Scanning for Orders</h3>
              <p className="text-xs font-bold text-zinc-500 max-w-xs mx-auto">Stay near pharmacy hotspots to increase your chances of getting a request.</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Search Zone</span>
              </div>
            </div>
          )}

          {/* ACTIVE ORDER (Condensed version on Home) */}
          {activeOrder && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest px-2">Current Task</h3>
              <Card className="rounded-[2rem] border-0 shadow-lg shadow-primary/5 overflow-hidden">
                <div className="bg-zinc-900 px-6 py-3 flex justify-between items-center text-white">
                  <span className="text-[8px] font-black uppercase tracking-widest">Live Delivery</span>
                  <Badge className="bg-primary/20 text-primary border-0 rounded-lg text-[8px]">{activeOrder.status.replace('_', ' ')}</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0">
                      <Package className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div>
                      <h4 className="font-black text-zinc-900">{activeOrder.pharmacyId?.name}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">{activeOrder.pharmacyId?.address?.street}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/rider/map')}
                    className="w-full mt-6 h-12 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[9px]"
                  >
                    Navigate on Map
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* NEW ORDER ASSIGNMENT OVERLAY */}
          {offeredOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <Card className="w-full max-w-sm rounded-[2.5rem] border-0 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-primary h-2 w-full">
                  <div 
                    className="bg-zinc-900 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((offerTimer || 0) / 180) * 100}%` }}
                  ></div>
                </div>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                    <Package className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">New Delivery Offer</p>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tighter">₹{offeredOrder.payout}</h3>
                    <p className="text-xs font-bold text-zinc-500 mt-1">From {offeredOrder.pharmacyName}</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 py-2">
                    <div className="text-center">
                       <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Time Left</p>
                       <p className="text-xl font-black text-zinc-900">{offerTimer}s</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleRejectOrder(offeredOrder.dbId)}
                      className="rounded-2xl h-14 border-zinc-100 text-zinc-400 hover:bg-zinc-50 font-black uppercase tracking-widest text-[10px]"
                    >
                      Decline
                    </Button>
                    <Button 
                      onClick={() => handleAcceptOrder(offeredOrder.dbId)}
                      className="rounded-2xl h-14 bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 font-black uppercase tracking-widest text-[10px]"
                    >
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
