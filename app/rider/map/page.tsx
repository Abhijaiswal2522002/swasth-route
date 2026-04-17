'use client';

import React from 'react';
import { useRider } from '@/lib/contexts/RiderContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Package, CheckCircle, Phone, ArrowRight } from 'lucide-react';
import MapBox from '@/components/MapBox';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RiderMapPage() {
  const { user } = useAuth();
  const { currentLocation, nearbyOrders, activeOrder, handlePickup, handleDeliver, isLoading } = useRider();

  // Calculate destination based on active order status
  const getActiveOrderMarkers = () => {
    if (!activeOrder) return [];

    const markers = [];
    
    // Always show Pharmacy
    markers.push({
      id: 'pharmacy',
      lat: activeOrder.pharmacyId?.location?.coordinates[1] || 0,
      lng: activeOrder.pharmacyId?.location?.coordinates[0] || 0,
      name: `Pickup: ${activeOrder.pharmacyId?.name}`,
      type: 'pharmacy',
      color: activeOrder.status === 'assigned' ? 'border-amber-500 text-amber-500' : 'border-zinc-300 text-zinc-300 opacity-50',
      address: activeOrder.pharmacyId?.address?.street
    });

    // Always show Delivery Location
    markers.push({
      id: 'delivery',
      lat: activeOrder.deliveryAddress?.latitude || 0,
      lng: activeOrder.deliveryAddress?.longitude || 0,
      name: 'Drop-off Location',
      type: 'user',
      color: activeOrder.status === 'picked_up' ? 'border-primary text-primary' : 'border-zinc-300 text-zinc-300 opacity-50',
      address: activeOrder.deliveryAddress?.street
    });

    return markers;
  };

  const activeMarkers = getActiveOrderMarkers();
  
  // Determine current destination for route drawing
  const currentDestination = activeOrder ? (
    activeOrder.status === 'assigned' 
      ? { lat: activeOrder.pharmacyId?.location?.coordinates[1], lng: activeOrder.pharmacyId?.location?.coordinates[0] }
      : { lat: activeOrder.deliveryAddress?.latitude, lng: activeOrder.deliveryAddress?.longitude }
  ) : null;

  const mapMarkers = [
    ...(nearbyOrders
      .filter(o => o.pharmacyId && o.pharmacyId.location && o.pharmacyId.location.coordinates)
      .map(o => ({
        lat: o.pharmacyId.location.coordinates[1],
        lng: o.pharmacyId.location.coordinates[0],
        name: o.pharmacyId.name,
        type: 'pharmacy',
        color: 'border-zinc-100 text-zinc-300 opacity-50'
      }))
    ),
    ...activeMarkers
  ];

  return (
    <div className="h-[calc(100vh-14rem)] min-h-[500px] flex flex-col gap-4 animate-in fade-in duration-500">
      
      <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
        <MapBox
          center={currentLocation || (currentDestination ? { lat: currentDestination.lat, lng: currentDestination.lng } : { lat: 19.076, lng: 72.8777 })}
          zoom={14}
          markers={mapMarkers}
          riders={currentLocation ? [{
            id: user?.id || 'me',
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            color: 'text-zinc-900'
          }] : []}
          routeCoords={(currentLocation && currentDestination) ? [
            [currentLocation.lng, currentLocation.lat],
            [currentDestination.lng, currentDestination.lat]
          ] : []}
        />

        {/* Floating Info Header */}
        {activeOrder && activeMarkers.length > 0 && (
          <div className="absolute top-6 left-6 right-6">
            <Card className="rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl p-5 border-0 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                    {activeOrder.status === 'assigned' ? 'Heading to Pharmacy' : 'Heading to Customer'}
                  </p>
                  <h4 className="font-black text-lg text-zinc-900 leading-none">
                    {activeOrder.status === 'assigned' ? activeOrder.pharmacyId?.name : 'User Location'}
                  </h4>
                  <p className="text-xs font-bold text-zinc-500 mt-1 line-clamp-1">
                    {activeOrder.status === 'assigned' ? activeOrder.pharmacyId?.address?.street : activeOrder.deliveryAddress?.street}
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-400">
                <Phone className="w-5 h-5" />
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* ACTION PANEL */}
      {activeOrder ? (
        <Card className="rounded-[2.5rem] border-0 bg-white shadow-xl p-6 mb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase">
                {activeOrder.status.replace('_', ' ')}
              </Badge>
              <p className="text-xs font-bold text-zinc-400">Order ID: {activeOrder.orderId}</p>
            </div>
            <p className="text-sm font-black text-zinc-900">₹{activeOrder.riderPayout || activeOrder.total}</p>
          </div>

          <div className="flex gap-4">
            {activeOrder.status === 'assigned' && (
              <Button 
                onClick={handlePickup}
                className="flex-1 h-16 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-zinc-200"
              >
                <Package className="w-5 h-5" /> Confirm Pickup
              </Button>
            )}
            {activeOrder.status === 'picked_up' && (
              <Button 
                onClick={handleDeliver}
                className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
              >
                <CheckCircle className="w-5 h-5" /> Mark Delivered
              </Button>
            )}
            <Button variant="outline" className="h-16 w-16 rounded-2xl border-zinc-100 bg-zinc-50 text-zinc-400 flex items-center justify-center">
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="rounded-[2.5rem] border-0 bg-white shadow-lg p-8 text-center space-y-3">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">No Active Route</p>
          <p className="text-sm font-medium text-zinc-500">Accept an order from the dashboard to see navigation markers and actions.</p>
        </Card>
      )}
    </div>
  );
}

