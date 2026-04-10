'use client';

import React from 'react';
import { useRider } from '@/lib/contexts/RiderContext';
import { Card } from '@/components/ui/card';
import { Navigation } from 'lucide-react';
import MapBox from '@/components/MapBox';

export default function RiderMapPage() {
  const { currentLocation, nearbyOrders, activeOrder } = useRider();

  return (
    <div className="h-[calc(100vh-16rem)] min-h-[400px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative animate-in zoom-in duration-500">
      <MapBox
        center={currentLocation || { lat: 19.076, lng: 72.8777 }}
        zoom={14}
        markers={nearbyOrders.map(o => ({
          lat: o.pharmacyId?.location?.coordinates[1] || 0,
          lng: o.pharmacyId?.location?.coordinates[0] || 0,
          name: o.pharmacyId?.name,
          color: 'text-amber-500'
        }))}
      />
      {activeOrder && (
        <div className="absolute top-6 left-6 right-6">
          <Card className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl p-4 border-0">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[8px] font-black text-zinc-400 uppercase">Navigating to</p>
                <h4 className="font-black text-xs text-zinc-900 leading-none mt-0.5">{activeOrder.status === 'assigned' ? activeOrder.pharmacyId?.name : activeOrder.deliveryAddress?.street}</h4>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

