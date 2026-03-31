'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ApiClient from '@/lib/api';
import MapBox from '@/components/MapBox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Store, 
  ArrowLeft, 
  Navigation, 
  Phone, 
  Clock, 
  Star,
  ChevronRight,
  TrendingUp,
  Search,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { reverseGeocode, getCurrentLocation } from '@/lib/locationUtils';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function PharmaciesContent() {
  const { user } = useAuth();
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 19.0760, lng: 72.8777 });
  const [currentAddress, setCurrentAddress] = useState('Mumbai, Maharashtra');

  const searchParams = useSearchParams();
  const initialSelectedId = searchParams.get('selected');

  useEffect(() => {
    initLocation();
  }, [user]);

  useEffect(() => {
    if (initialSelectedId && pharmacies.length > 0) {
      const pharm = pharmacies.find(p => p._id === initialSelectedId);
      if (pharm) {
        setSelectedPharmacy(pharm);
        setUserLocation({
          lat: pharm.location?.coordinates?.[1] || 19.0760,
          lng: pharm.location?.coordinates?.[0] || 72.8777
        });
      }
    }
  }, [initialSelectedId, pharmacies]);

  const initLocation = async () => {
    setIsLoading(true);
    try {
      const profileRes = await ApiClient.getUserProfile();
      let lat = 19.0760, lng = 72.8777;
      
      if (profileRes.data) {
        const profile = profileRes.data as any;
        const defAddr = profile.addresses?.find((a: any) => a.isDefault) || profile.addresses?.[0];
        if (defAddr) {
          lat = defAddr.latitude;
          lng = defAddr.longitude;
          setCurrentAddress(defAddr.street || defAddr.label);
        }
      }
      
      setUserLocation({ lat, lng });
      fetchPharmacies(lat, lng);
    } catch (error) {
      console.error('Error initializing location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPharmacies = async (lat: number, lng: number) => {
    try {
      const res = await ApiClient.getNearbyPharmacies(lat, lng);
      if (res.data) {
        setPharmacies(res.data as any[]);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    fetchPharmacies(lat, lng);
    const address = await reverseGeocode(lat, lng);
    if (address) {
      setCurrentAddress(address.street);
    }
  };

  const mapMarkers = pharmacies.map(p => ({
    id: p._id,
    lat: p.location?.coordinates?.[1] || 0,
    lng: p.location?.coordinates?.[0] || 0,
    name: p.name,
    status: p.status,
    rating: p.rating,
    color: p.status === 'active' ? 'text-green-500' : 'text-gray-400'
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:flex-row overflow-hidden bg-white">
      {/* SIDEBAR */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r h-1/2 md:h-full bg-white z-10 shadow-xl">
        <div className="p-6 border-b space-y-4">
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="ghost" size="icon" className="rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Nearby Shops</h1>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <MapPin className="w-3 h-3" /> Delivery Point
            </div>
            <p className="text-sm font-bold text-gray-900 line-clamp-1">{currentAddress}</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name or street..." 
              className="pl-11 h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-sm focus-visible:ring-primary/10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{pharmacies.length} Discovery Results</p>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                onClick={async () => {
                    const loc = await getCurrentLocation();
                    handleLocationChange(loc.lat, loc.lng);
                }}
            >
              Sync GPS
            </Button>
          </div>

          {pharmacies.map((pharm) => (
            <Card 
              key={pharm._id}
              onClick={() => setSelectedPharmacy(pharm)}
              className={`cursor-pointer transition-all border-2 rounded-[1.5rem] overflow-hidden ${
                selectedPharmacy?._id === pharm._id 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                  : 'border-gray-50 bg-white hover:border-primary/20 hover:shadow-md'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${selectedPharmacy?._id === pharm._id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{pharm.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                           <Navigation className="w-3 h-3" /> {(pharm.distance / 1000).toFixed(1)} km
                         </span>
                         <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                           <Star className="w-3 h-3 fill-amber-500" /> {pharm.rating?.toFixed(1) || '5.0'}
                         </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`rounded-lg px-2 h-max font-black text-[9px] uppercase tracking-widest border-none ${
                    pharm.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {pharm.status === 'active' ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                
                {selectedPharmacy?._id === pharm._id && (
                  <div className="mt-5 pt-4 border-t border-primary/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
                      <Clock className="w-4 h-4 text-primary/40" />
                      <span>{pharm.businessHours?.monday?.open} - {pharm.businessHours?.monday?.close}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
                      <Phone className="w-4 h-4 text-primary/40" />
                      <span>{pharm.phone}</span>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Link href={`/app/medicines?pharmacy=${pharm._id}`} className="flex-1">
                        <Button className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                          Browse Inventory <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${pharm.location?.coordinates?.[1]},${pharm.location?.coordinates?.[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 rounded-xl text-gray-500 hover:text-primary transition-all flex items-center justify-center shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 h-1/2 md:h-full relative">
        <MapBox 
          markers={mapMarkers}
          center={userLocation}
          zoom={14}
          isPicker={true}
          onLocationSelect={handleLocationChange}
          height="100%"
          className="rounded-none border-none"
        />
      </div>
    </div>
  );
}

export default function NearbyPharmaciesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-white flex-col gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning nearby shops...</p>
      </div>
    }>
      <PharmaciesContent />
    </Suspense>
  );
}
