'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, MapPin, AlertCircle, Clock,
  ChevronRight, FileText, HeadphonesIcon,
  RefreshCw, Store, Truck, LogOut, Navigation, Users
} from 'lucide-react';
import ApiClient from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { reverseGeocode, getCurrentLocation, forwardGeocode, type GeocodedResult } from '@/lib/locationUtils';
import MapBox from '@/components/MapBox';

export default function AppHomeDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // "Order for someone else" state
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<GeocodedResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [orderForOther, setOrderForOther] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const profileRes = await ApiClient.getUserProfile();
      if (profileRes.data) {
        const profileData = profileRes.data as any;
        setProfile(profileData);

        // Set initial selected location from default address
        const defAddr = profileData.addresses?.find((a: any) => a.isDefault) || profileData.addresses?.[0];
        if (defAddr) {
          setSelectedLocation(defAddr);
          fetchNearbyPharmacies(defAddr.latitude, defAddr.longitude);
        } else {
          // Default to Mumbai if no address
          fetchNearbyPharmacies(19.0760, 72.8777);
        }
      }

      // Fetch orders
      const ordersRes = await ApiClient.getUserOrders();
      if (ordersRes.data) {
        const allOrders = ordersRes.data as any[];
        const active = allOrders.find((o: any) => !['delivered', 'cancelled'].includes(o.status));
        setActiveOrder(active);
        const recent = allOrders.filter((o: any) => ['delivered', 'cancelled'].includes(o.status)).slice(0, 2);
        setRecentOrders(recent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNearbyPharmacies = async (lat: number, lon: number) => {
    try {
      const pharmaciesRes = await ApiClient.getNearbyPharmacies(lat, lon);
      if (pharmaciesRes.data) {
        setNearbyPharmacies((pharmaciesRes.data as any[]).slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentLocation();
      const address = await reverseGeocode(coords.lat, coords.lng);
      if (address) {
        const newLocation = {
          label: 'Current Location',
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          latitude: coords.lat,
          longitude: coords.lng
        };
        setSelectedLocation(newLocation);
        fetchNearbyPharmacies(coords.lat, coords.lng);
        setIsLocationModalOpen(false);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleManualLocationSelect = async (lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    if (address) {
      const newLocation = {
        label: 'Selected Location',
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: lat,
        longitude: lng
      };
      setSelectedLocation(newLocation);
      fetchNearbyPharmacies(lat, lng);
    }
  };

  // Debounced address search for "Order for someone else"
  const handleAddressSearch = useCallback((query: string) => {
    setAddressQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim().length < 3) {
      setAddressResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const results = await forwardGeocode(query.trim());
        setAddressResults(results);
      } catch (e) {
        console.error('Address search error:', e);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 400);
  }, []);

  const handleSelectSearchedAddress = (result: GeocodedResult) => {
    const newLocation = {
      label: 'For Someone Else',
      street: result.displayName,
      city: result.address.city,
      state: result.address.state,
      pincode: result.address.pincode,
      latitude: result.lat,
      longitude: result.lng
    };
    setSelectedLocation(newLocation);
    fetchNearbyPharmacies(result.lat, result.lng);
    setAddressQuery('');
    setAddressResults([]);
    setOrderForOther(false);
    setIsLocationModalOpen(false);
  };

  const currentAddress = selectedLocation || profile?.addresses?.find((a: any) => a.isDefault) || profile?.addresses?.[0] || {
    label: 'Home',
    street: 'Select a location to see nearby pharmacies'
  };

  if (isLoading && !profile) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-500 font-medium">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 px-4 sm:px-6 lg:px-8 py-6">

      {/* Top Section Header / Hero */}
      <div className="bg-[#0b8a4f] text-white px-6 py-8 md:py-10 rounded-2xl md:rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Decorative background circle */}
        <div className="absolute top-[-50px] right-[-50px] md:-right-20 md:-top-20 w-40 h-40 md:w-80 md:h-80 bg-white/10 rounded-full blur-2xl md:blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 md:gap-6 relative z-10 w-full md:w-1/2">
          <div className="flex justify-between items-start md:block">
            <div>
              <p className="text-white/80 text-sm md:text-base font-medium mb-1">Hello {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'},</p>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Need Medicines <br className="hidden md:block" />Fast? 👋</h1>
            </div>

            {/* Mobile-only Logout/User (Hidden on desktop since layout has it) */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all shadow-sm"
              >
                <LogOut size={18} className="translate-x-[-1px]" />
              </button>
            </div>
          </div>

          {/* Location Bar */}
          <div
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center w-max max-w-full gap-2 text-sm md:text-base font-medium bg-black/15 px-4 py-2 border border-white/10 rounded-full backdrop-blur-md cursor-pointer hover:bg-black/25 transition-colors"
          >
            <MapPin className="w-4 h-4 md:w-5 md:h-5 fill-white/40 shrink-0" />
            <span className="truncate text-white/95">{currentAddress.label} • {currentAddress.street?.split(',')[0]}</span>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 opacity-70 text-white shrink-0" />
          </div>
        </div>

        {/* Search Bar & Action - Desktop Right Side */}
        <div className="relative z-10 w-full md:w-1/2 lg:w-[40%]">
          <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/20 shadow-xl space-y-4">
            <h3 className="text-base font-semibold hidden md:block">Search inventory across nearby pharmacies</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <Input
                placeholder="Search medicines, health products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchQuery.trim()) {
                      window.location.href = `/app/medicines?query=${encodeURIComponent(searchQuery.trim())}`;
                    } else {
                      window.location.href = '/app/medicines';
                    }
                  }
                }}
                className="w-full bg-white text-gray-900 pl-12 pr-4 border-0 h-14 md:h-16 rounded-xl shadow-inner focus-visible:ring-4 focus-visible:ring-[#0b8a4f] transition-all text-base focus-visible:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 min-h-max">

        {/* LEFT COLUMN: Emergency & Active Orders */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">

          {/* EMERGENCY ORDER BUTTON */}
          <button className="w-full relative overflow-hidden group rounded-2xl md:rounded-3xl bg-red-600 text-white p-5 md:p-6 shadow-[0_8px_30px_rgb(239,68,68,0.3)] hover:shadow-[0_12px_40px_rgb(239,68,68,0.4)] transition-all active:scale-[0.98]">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -right-4 -top-4 w-32 h-32 md:w-48 md:h-48 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 animate-pulse"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-sm">
                  <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="text-left space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white uppercase">Emergency</h2>
                  <p className="text-white/90 text-[11px] md:text-xs font-semibold uppercase tracking-wider">Order Medicine Fast</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white opacity-90 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* ACTIVE ORDER WIDGET */}
          {activeOrder && (
            <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden md:rounded-2xl">
              <div className="bg-primary/10 px-5 pt-4 pb-3 flex justify-between items-center border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Active Order</span>
                </div>
                <span className="text-xs font-bold">{activeOrder.estimatedDeliveryTime} mins</span>
              </div>
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100 shrink-0">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-base capitalize">{activeOrder.status}</p>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                      {activeOrder.items?.map((it: any) => it.medicineName).join(', ')}
                    </p>
                  </div>
                </div>
                <Link href={`/app/track-order/${activeOrder._id}`}>
                  <Button
                    size="sm"
                    className="w-full rounded-xl h-10 font-semibold shadow-sm tracking-wide"
                  >
                    Track Live Location
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Button variant="outline" className="h-20 md:h-24 py-4 flex-col gap-2 items-center bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded-xl shadow-sm">
              <FileText className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-xs md:text-sm font-semibold">Upload Rx</span>
            </Button>
            <Button variant="outline" className="h-20 md:h-24 py-4 flex-col gap-2 items-center bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded-xl shadow-sm">
              <HeadphonesIcon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-xs md:text-sm font-semibold">Support Chat</span>
            </Button>
          </div>

        </div>

        {/* RIGHT COLUMN: Pharmacies & History */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6 lg:gap-8">

          {/* NEARBY PHARMACIES */}
          <div className="space-y-4 bg-white p-5 md:p-6 lg:p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex-1">
            <div className="flex justify-between items-end border-b pb-3 mb-2">
              <h3 className="font-bold text-xl text-gray-900">Nearby Pharmacies</h3>
              <Link href="/app/pharmacies" className="text-sm text-primary font-semibold hover:underline cursor-pointer">View Map</Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyPharmacies.length > 0 ? nearbyPharmacies.map((pharm, i) => (
                <Link
                  key={i}
                  href={`/app/medicines?pharmacy=${pharm._id || pharm.id}`}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-5 cursor-pointer hover:border-primary/40 hover:shadow-xl hover:bg-white transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Store className="w-12 h-12" />
                  </div>

                  <div className="p-3 bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 group-hover:border-primary/20">
                    <Store className="w-8 h-8 text-primary" />
                  </div>

                  <h4 className="font-extrabold text-sm md:text-base text-gray-900 truncate mb-1" title={pharm.name}>{pharm.name}</h4>

                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Navigation className="w-3 h-3" /> {(pharm.distance / 1000).toFixed(1)} km
                      </span>
                      {pharm.distance < 1000 && (
                        <Badge className="bg-primary/10 text-primary text-[8px] h-4 font-black uppercase tracking-widest border-none px-1.5">Nearby</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${pharm.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${pharm.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                        {pharm.status === 'active' ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-widest">Details <ChevronRight className="w-3 h-3" /></span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${pharm.location?.coordinates?.[1]},${pharm.location?.coordinates?.[0]}`, '_blank');
                      }}
                      className="p-1.5 bg-gray-100 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Link>
              )) : (
                <div className="col-span-full py-8 text-center text-gray-500 border-2 border-dashed border-gray-100 rounded-2xl">
                  No pharmacies found nearby
                </div>
              )}
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="space-y-4 bg-white p-5 md:p-6 lg:p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="flex justify-between items-end border-b pb-3 mb-2">
              <h3 className="font-bold text-xl text-gray-900">Recent Orders</h3>
              <Link href="/app/orders" className="text-sm text-primary font-semibold hover:underline cursor-pointer">View All</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                <div key={i} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 transition-colors">
                      <Clock className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 truncate max-w-[150px] md:max-w-[200px]" title={order.items?.map((it: any) => it.medicineName).join(', ')}>
                        {order.items?.map((it: any) => it.medicineName).join(', ')}
                      </h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} •
                        <span className="text-gray-900 font-bold ml-1">₹{order.total}</span>
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-9 gap-2 text-primary border-primary/20 hover:bg-primary hover:text-white rounded-lg px-4 hidden sm:flex">
                    <RefreshCw className="w-3.5 h-3.5" /> <span className="text-xs font-bold">Reorder</span>
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary hover:text-white rounded-lg sm:hidden flex shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              )) : (
                <div className="col-span-full py-6 text-center text-gray-400 text-sm">
                  No recent orders found
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* LOCATION SELECTION DIALOG */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <MapPin className="w-6 h-6" /> Change Delivery Location
            </DialogTitle>
            <DialogDescription className="text-white/70 font-medium pt-1">
              Select or pick a custom location to see nearby pharmacies.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {/* CURRENT LOCATION BUTTON */}
            <Button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border-none font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all"
            >
              {isLocating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {isLocating ? 'Detecting Location...' : 'Use My Current Location'}
            </Button>

            {/* ORDER FOR SOMEONE ELSE */}
            <div className="space-y-3">
              <button
                onClick={() => setOrderForOther(!orderForOther)}
                className={`w-full h-14 rounded-2xl border-2 border-dashed font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${orderForOther
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-primary/30 hover:text-primary'
                  }`}
              >
                <Users className="w-4 h-4" />
                Order for Someone Else
              </button>

              {orderForOther && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Type an address, area, or landmark..."
                      value={addressQuery}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      className="pl-11 pr-4 h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-primary text-sm"
                      autoFocus
                    />
                    {isSearchingAddress && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {addressResults.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden max-h-[200px] overflow-y-auto">
                      {addressResults.map((result, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectSearchedAddress(result)}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-b-0"
                        >
                          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{result.displayName.split(',')[0]}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{result.displayName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {addressQuery.length >= 3 && !isSearchingAddress && addressResults.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No results found. Try a different address.</p>
                  )}
                </div>
              )}
            </div>

            {/* SAVED ADDRESSES */}
            {profile?.addresses && profile.addresses.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Saved Addresses</p>
                {profile.addresses.map((addr: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedLocation(addr);
                      fetchNearbyPharmacies(addr.latitude, addr.longitude);
                      setIsLocationModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${selectedLocation?._id === addr._id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-50 bg-white hover:border-primary/20'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedLocation?._id === addr._id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900 capitalize">{addr.label}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{addr.street}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MANUAL MAP PICKER */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Or Pick Manually on Map</p>
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[200px]">
                <MapBox
                  isPicker={true}
                  center={{
                    lat: selectedLocation?.latitude || 19.0760,
                    lng: selectedLocation?.longitude || 72.8777
                  }}
                  onLocationSelect={handleManualLocationSelect}
                  height="200px"
                />
              </div>
              {selectedLocation?.label === 'Selected Location' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Detected Address</p>
                  <p className="text-xs font-bold text-gray-700 line-clamp-2">{selectedLocation.street}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50/50 flex flex-row gap-3 sm:justify-between border-t border-gray-100">
            <Button
              variant="ghost"
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900"
              onClick={() => setIsLocationModalOpen(false)}
            >
              Close
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              onClick={() => setIsLocationModalOpen(false)}
            >
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
