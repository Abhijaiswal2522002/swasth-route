'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  Loader2,
  Truck,
  Activity,
  CheckCircle,
  MapPin,
  Clock,
  Shield,
  Phone,
  Compass
} from 'lucide-react';
import ApiClient from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import MapBox from './MapBox';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Seeded local hospitals for selection
const SEED_HOSPITALS = [
  { name: 'Metro Trauma Center', latitude: 19.0760, longitude: 72.8777, address: 'Bandra East' },
  { name: 'City General Hospital', latitude: 19.0820, longitude: 72.8820, address: 'Kurla West' },
  { name: 'St. Jude Hospital', latitude: 19.0680, longitude: 72.8650, address: 'Santacruz' },
  { name: 'Apollo Emergency Clinic', latitude: 19.0950, longitude: 72.8550, address: 'Andheri East' }
];

interface AmbulanceBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type TripStep = 'select' | 'broadcasting' | 'active' | 'arrived';

export default function AmbulanceBookingDialog({ isOpen, onOpenChange }: AmbulanceBookingDialogProps) {
  const { user } = useAuth();
  const { location } = useGeolocation();

  const [step, setStep] = useState<TripStep>('select');
  const [ambulanceType, setAmbulanceType] = useState<'basic' | 'advanced' | 'icu'>('basic');
  const [selectedHospital, setSelectedHospital] = useState(SEED_HOSPITALS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(false);

  // Booking states
  const [booking, setBooking] = useState<any>(null);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<string>('pending');

  useEffect(() => {
    if (location) {
      setGpsLocked(true);
    } else {
      setGpsLocked(false);
    }
  }, [location]);

  // Check for active booking on open
  useEffect(() => {
    if (isOpen && user) {
      checkActiveBooking();
    }
  }, [isOpen, user]);

  const checkActiveBooking = async () => {
    try {
      const res = await ApiClient.getActiveAmbulanceBooking();
      if (res.data) {
        setBooking(res.data);
        setTripStatus(res.data.status);
        if (res.data.driverId) {
          setDriverInfo({
            name: res.data.driverId.userId?.name || 'Emergency Dispatcher',
            phone: res.data.driverId.userId?.phone || 'Verified',
            vehicleNumber: res.data.driverId.vehicleNumber
          });
        }
        if (res.data.status === 'pending') {
          setStep('broadcasting');
        } else {
          setStep('active');
        }
      } else {
        setStep('select');
        setBooking(null);
        setDriverInfo(null);
        setTripStatus('pending');
      }
    } catch (err) {
      console.error('Error checking active ambulance booking:', err);
    }
  };

  // Live Socket connection for booking status updates
  useEffect(() => {
    if (user && isOpen && (step === 'broadcasting' || step === 'active')) {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('[Ambulance Socket] Connected for user:', user.id);
      });

      socket.on(`ambulance-booking-updated-${user.id}`, (data: any) => {
        console.log('[Ambulance Socket] Booking status updated:', data);
        setTripStatus(data.status);
        if (data.driver) {
          setDriverInfo(data.driver);
        }

        if (data.status === 'accepted') {
          toast.success('🚑 Ambulance dispatch accepted! Driver is en route.');
          setStep('active');
        } else if (data.status === 'en_route') {
          toast.info('Ambulance driver is driving to your location.');
          setStep('active');
        } else if (data.status === 'picked_up') {
          toast.info('Patient picked up. Driving to hospital.');
          setStep('active');
        } else if (data.status === 'completed') {
          toast.success('🏥 Arrived safely at the hospital.');
          setStep('arrived');
        } else if (data.status === 'cancelled') {
          toast.error('Emergency dispatch request was cancelled.');
          setStep('select');
          setBooking(null);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, step, isOpen]);

  // Request Ambulance
  const handleRequestAmbulance = async () => {
    if (!location) {
      toast.error('GPS Lock is required to direct emergency dispatch.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ApiClient.createAmbulanceBooking({
        latitude: location.latitude,
        longitude: location.longitude,
        pickupAddress: 'Live GPS SOS Coordinate',
        ambulanceType,
        hospital: {
          name: selectedHospital.name,
          latitude: selectedHospital.latitude,
          longitude: selectedHospital.longitude
        }
      });

      if (res.data) {
        setBooking(res.data.booking);
        setTripStatus('pending');
        setStep('broadcasting');
        toast.success('Ambulance dispatch broadcast launched!');
      } else {
        toast.error(res.error || 'Failed to dispatch ambulance');
      }
    } catch (err) {
      console.error('Request ambulance error:', err);
      toast.error('No active ambulances available of this type in your area.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!booking) return;

    try {
      await ApiClient.cancelAmbulanceBooking(booking._id);
      toast.info('Ambulance emergency request cancelled.');
      setStep('select');
      setBooking(null);
      setDriverInfo(null);
    } catch (err) {
      console.error('Cancel booking error:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-3xl border-0 shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-200">
        
        {/* Red Alert Emergency Header */}
        <div className="bg-gradient-to-r from-red-700 to-rose-600 px-6 py-5 text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase">Ambulance Dispatch</h2>
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Fastest Direct Trauma Logistics</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {step === 'select' && (
            <div className="space-y-5">
              
              {/* Geolocation status */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                gpsLocked ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'bg-rose-50/50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30'
              }`}>
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${gpsLocked ? 'text-emerald-500' : 'text-rose-500 animate-bounce'}`} />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-zinc-800 dark:text-zinc-200">
                      {gpsLocked ? 'GPS Tracking Active' : 'Acquiring GPS Signal...'}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {gpsLocked && location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Securing accurate dispatch lock'}
                    </span>
                  </div>
                </div>
                {gpsLocked ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">Locked</span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-100/50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full animate-pulse">Wait</span>
                )}
              </div>

              {/* Ambulance type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block px-1">Select Care Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'basic', label: 'BLS', price: '₹500', desc: 'Oxygen/Splints' },
                    { type: 'advanced', label: 'ALS', price: '₹1500', desc: 'IVs/Paramedics' },
                    { type: 'icu', label: 'ICU/Cardiac', price: '₹2500', desc: 'Defib/Ventilator' }
                  ].map((amb) => (
                    <button
                      key={amb.type}
                      onClick={() => setAmbulanceType(amb.type as any)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                        ambulanceType === amb.type ? 'border-rose-600 bg-rose-50/20 text-rose-600 dark:bg-rose-950/10' : 'border-zinc-150 text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">{amb.label}</span>
                      <span className="text-[10px] font-bold mt-1 text-zinc-900 dark:text-zinc-200">{amb.price}</span>
                      <span className="text-[8px] font-medium text-zinc-400 mt-0.5 leading-tight">{amb.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Hospital selection */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block px-1">Destination Trauma Hospital</Label>
                <select
                  className="w-full bg-zinc-50 border-2 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold text-black dark:text-white outline-none focus:border-rose-500/50 transition-all"
                  value={selectedHospital.name}
                  onChange={(e) => {
                    const h = SEED_HOSPITALS.find(hos => hos.name === e.target.value);
                    if (h) setSelectedHospital(h);
                  }}
                >
                  {SEED_HOSPITALS.map((hos) => (
                    <option key={hos.name} value={hos.name}>
                      {hos.name} ({hos.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 dark:bg-amber-950/10 dark:border-amber-900/30">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <p className="text-[10px] font-medium leading-relaxed">
                  Trauma bookings auto-surges route optimization. Payment is handled under standard hospital check-ins via COD.
                </p>
              </div>

              {/* Dispatch Action */}
              <Button
                onClick={handleRequestAmbulance}
                disabled={isSubmitting || !gpsLocked}
                className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20 border-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Matching...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" /> Dispatch Ambulance
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'broadcasting' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping duration-1000"></div>
                <div className="absolute w-28 h-28 bg-rose-500/20 rounded-full animate-ping duration-1500 delay-300"></div>
                <div className="absolute w-16 h-16 bg-rose-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                  <Compass className="w-6 h-6 text-white animate-spin duration-3000" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Searching Nearest Ambulance</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-xs leading-relaxed">
                  Broadcasting medical dispatch command to available {ambulanceType} vehicles within 15km. Standing by...
                </p>
              </div>

              <Button
                onClick={handleCancelTrip}
                variant="outline"
                className="h-12 px-6 rounded-xl border-zinc-200 hover:bg-rose-50 hover:text-rose-600 text-xs font-black uppercase tracking-widest"
              >
                Cancel Dispatch Request
              </Button>
            </div>
          )}

          {step === 'active' && (
            <div className="space-y-5">
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-rose-600 tracking-wider">Trip Status</span>
                  <h4 className="text-sm font-black text-zinc-800 uppercase mt-0.5">
                    {tripStatus.replace('_', ' ')}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Emergency Fare</span>
                  <p className="text-base font-black text-zinc-900 dark:text-white">₹{booking?.price}</p>
                </div>
              </div>

              {/* Mini Mapbox */}
              {location && booking && (
                <div className="rounded-2xl overflow-hidden border border-zinc-150 shadow-inner">
                  <MapBox
                    center={{ lat: location.latitude, lng: location.longitude }}
                    zoom={12}
                    height="180px"
                    interactive={false}
                    markers={[
                      { id: 'pickup', name: 'Pickup Point', lat: location.latitude, lng: location.longitude, color: 'text-rose-600' },
                      { id: 'hospital', name: booking.destinationHospital.name, lat: booking.destinationHospital.latitude, lng: booking.destinationHospital.longitude, color: 'text-blue-600' }
                    ]}
                  />
                </div>
              )}

              {/* Driver Details Card */}
              {driverInfo && (
                <div className="p-4 rounded-2xl border border-zinc-150 bg-white flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-800 leading-tight">{driverInfo.name}</h4>
                      <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Plate: {driverInfo.vehicleNumber}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${driverInfo.phone}`}
                    className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-white shrink-0 shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="pt-2 flex justify-between gap-4">
                {tripStatus === 'pending' || tripStatus === 'accepted' || tripStatus === 'en_route' ? (
                  <Button
                    onClick={handleCancelTrip}
                    variant="outline"
                    className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-500 border-zinc-200"
                  >
                    Cancel Ambulance
                  </Button>
                ) : (
                  <div className="w-full text-center py-3 bg-zinc-100 rounded-xl text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                    In Transit — Cannot Cancel
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'arrived' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Arrived at Hospital</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-semibold">
                  You have been successfully delivered to **{booking?.destinationHospital?.name || 'Trauma Center'}**.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl w-full border border-zinc-100 space-y-1.5 text-left">
                <div className="flex justify-between text-xs font-bold text-zinc-600">
                  <span>Hospital</span>
                  <span className="text-zinc-900">{booking?.destinationHospital?.name}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-zinc-600">
                  <span>Type</span>
                  <span className="text-zinc-900 uppercase">{booking?.ambulanceType} Care</span>
                </div>
                <div className="flex justify-between text-xs font-black text-zinc-800 border-t border-zinc-250/20 pt-1.5">
                  <span>Total Fare</span>
                  <span>₹{booking?.price}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  onOpenChange(false);
                  setStep('select');
                  setBooking(null);
                  setDriverInfo(null);
                }}
                className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest"
              >
                Close Summary
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
