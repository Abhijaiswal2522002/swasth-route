'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Building2, MapPin, CheckCircle2, AlertCircle,
  Clock, Package, TrendingUp, ChevronRight, Check, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PharmacyDashboard() {
  const { user } = useAuth();

  // Mock Data
  const shopDetails = {
    name: user?.name || 'ABC Medical Store',
    address: '123 Main Street, Andheri West, Mumbai',
    status: 'Approved'
  };

  const incomingOrders = [
    {
      id: '#ORD-9021',
      items: 'Paracetamol 500mg (2 strips), Vitamin C',
      distance: '1.2 km',
      isEmergency: true,
      time: 'Just now',
    },
    {
      id: '#ORD-9022',
      items: 'Ibuprofen 400mg, Cough Syrup',
      distance: '2.5 km',
      isEmergency: false,
      time: '5 mins ago',
    }
  ];

  const activeOrders = [
    {
      id: '#ORD-8901',
      status: 'Preparing',
      items: 'Amoxicillin 250mg, Digel',
      eta: '10 mins'
    },
    {
      id: '#ORD-8890',
      status: 'Out for delivery',
      items: 'Bandages, Antiseptic Cream',
      eta: '5 mins'
    }
  ];

  const earnings = {
    today: '₹1,240',
    orders: 8,
    commissionDeducted: '₹124'
  };

  const orderHistory = [
    { id: '#ORD-8800', status: 'Delivered', date: 'Today, 10:30 AM', total: '₹450' },
    { id: '#ORD-8799', status: 'Cancelled', date: 'Today, 09:15 AM', total: '₹120' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP SECTION: Shop Identity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shopDetails.name}</h1>
              <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{shopDetails.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 w-max">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-700 uppercase tracking-wider">Status: {shopDetails.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: Incoming & Active Orders */}
          <div className="lg:col-span-7 space-y-6">

            {/* INCOMING ORDERS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Incoming Orders
                </h2>
                <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 rounded-full font-bold">{incomingOrders.length} New</Badge>
              </div>

              <div className="grid gap-4">
                {incomingOrders.map((order) => (
                  <Card key={order.id} className={`overflow-hidden transition-all hover:shadow-md ${order.isEmergency ? 'border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}>
                    {order.isEmergency && (
                      <div className="bg-red-600 px-4 py-1.5 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                          <AlertCircle className="w-4 h-4" /> EMERGENCY ORDER
                        </div>
                        <span className="text-xs font-semibold">{order.time}</span>
                      </div>
                    )}
                    <CardContent className={`p-4 sm:p-5 ${!order.isEmergency ? 'pt-5' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-lg text-gray-900">{order.id}</p>
                          <p className="text-gray-600 mt-1 sm:text-lg">{order.items}</p>
                        </div>
                        {!order.isEmergency && <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{order.time}</span>}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5">
                        <div className="flex gap-4 text-sm font-medium text-gray-600">
                          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {order.distance} away</div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                            <X className="w-4 h-4 mr-1.5" /> Reject
                          </Button>
                          <Button className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-sm">
                            <Check className="w-4 h-4 mr-1.5" /> Accept
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* ACTIVE ORDERS */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Active Orders
              </h2>
              <div className="grid gap-4">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="border-primary/10 bg-white">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">{order.id}</p>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{order.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{order.items}</p>
                      </div>
                      <Button variant="outline" className="w-full sm:w-auto shrink-0 border-primary/20 hover:bg-primary/5 text-primary">
                        Update Status <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Earnings & History */}
          <div className="lg:col-span-5 space-y-6">

            {/* EARNINGS */}
            <Card className="bg-gradient-to-br from-primary to-[#0b8a4f] text-white border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/90 text-sm font-medium uppercase tracking-wider flex justify-between">
                  Today's Earnings <TrendingUp className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold mb-4">{earnings.today}</div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mt-2">
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase mb-1">Total Orders</p>
                    <p className="text-xl font-bold">{earnings.orders}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase mb-1">Platform Fee</p>
                    <p className="text-xl font-bold">{earnings.commissionDeducted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NOTIFICATIONS */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100 bg-orange-50/50 flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">High Demand Alert</p>
                    <p className="text-xs text-gray-600 mt-0.5">Emergency orders are surging in your area. Keep inventory ready.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ORDER HISTORY */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" /> Order History
                  </CardTitle>
                  <span className="text-xs text-primary font-medium cursor-pointer hover:underline">View All</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{order.total}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${order.status === 'Delivered' ? 'text-green-600' : 'text-red-500'}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
