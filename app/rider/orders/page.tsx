'use client';

import React from 'react';
import { useRider } from '@/lib/contexts/RiderContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, Clock, Package } from 'lucide-react';

export default function RiderOrdersPage() {
  const { nearbyOrders, handleAcceptOrder } = useRider();

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-zinc-900 uppercase tracking-widest">Available Orders</h3>
        <Badge className="bg-zinc-900 text-white rounded-full px-2.5 py-1 text-[9px]">{nearbyOrders.length}</Badge>
      </div>

      {nearbyOrders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {nearbyOrders.map(order => (
            <Card key={order._id} className="rounded-[2.5rem] border-0 shadow-sm hover:shadow-md transition-all p-6 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                    <Navigation className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-lg">{order.pharmacyId?.name}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{order.pharmacyId?.address?.street}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Earnings</p>
                  <p className="text-2xl font-black text-zinc-900">₹{order.deliveryFee || 50}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-primary" /> 5-10 Minutes
                </div>
                <Button
                  onClick={() => handleAcceptOrder(order._id)}
                  className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white h-12 px-8 font-black uppercase tracking-widest text-[9px]"
                >
                  Accept
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center opacity-40">
          <Package className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
          <p className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">No Orders in your Area</p>
        </div>
      )}
    </div>
  );
}

