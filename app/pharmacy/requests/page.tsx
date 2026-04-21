'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, RefreshCw, Clock, MapPin, HandHelping, User, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PharmacyRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quotePrice, setQuotePrice] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchNearbyRequests();
    }
  }, [user]);

  const fetchNearbyRequests = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Pharmacy Profile to get actual coordinates
      const profileRes = await ApiClient.getPharmacyProfile();
      let lat = 19.0760; // Default fallback
      let lng = 72.8777;

      if (profileRes.data && profileRes.data.location?.coordinates) {
        // [lng, lat] format in MongoDB GeoJSON
        lng = profileRes.data.location.coordinates[0];
        lat = profileRes.data.location.coordinates[1];
      }
      
      const res = await ApiClient.getNearbyMedicineRequests(lat, lng, 20); // 20km radius instead of 10 for better testing
      if (res.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error('Error fetching nearby requests:', error);
      toast.error('Failed to load nearby requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptClick = (request: any) => {
    setSelectedRequest(request);
    setQuotePrice('');
    setIsAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!quotePrice || parseFloat(quotePrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ApiClient.acceptMedicineRequest(selectedRequest._id, parseFloat(quotePrice));
      if (res.data) {
        toast.success('Request accepted! Order has been created.');
        setIsAcceptModalOpen(false);
        fetchNearbyRequests(); // Refresh list
      } else {
        toast.error(res.error || 'Failed to accept request');
      }
    } catch (error) {
      toast.error('An error occurred while accepting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Scanning for nearby user requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <HandHelping className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">User Requests</h1>
        </div>
        <p className="text-gray-500 font-medium">Fulfill medicine requests from users in your local area (10km radius).</p>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No pending requests found</h3>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">Any urgent requests from nearby users will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request) => (
            <Card key={request._id} className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">
                            <User className="w-3.5 h-3.5" />
                            <span>Requested by {request.userId?.name || 'User'}</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">{request.medicineName}</h3>
                        <p className="text-gray-500 font-bold">Quantity: {request.quantity} units</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                        request.paymentMethod === 'Prepaid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {request.paymentMethod}
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Delivery To</p>
                            <p className="text-sm font-bold text-gray-700 line-clamp-1">
                                {request.deliveryAddress.street}, {request.deliveryAddress.city}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <Button 
                        onClick={() => handleAcceptClick(request)}
                        className="rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/20"
                    >
                        Accept & Fulfillment
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Acceptance Modal */}
      <Dialog open={isAcceptModalOpen} onOpenChange={setIsAcceptModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Fulfill Medicine Request</DialogTitle>
            <DialogDescription className="font-medium text-gray-500">
              Enter the unit price you will charge for this medicine.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Medicine Details</p>
                <div className="flex justify-between items-end">
                    <div>
                        <h4 className="text-xl font-black text-gray-900">{selectedRequest?.medicineName}</h4>
                        <p className="text-sm font-bold text-gray-500">Qty: {selectedRequest?.quantity} units</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Preference</p>
                        <p className="text-sm font-black text-gray-900">{selectedRequest?.paymentMethod}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 px-1">
              <Label htmlFor="price" className="text-sm font-black text-gray-700 uppercase tracking-tight">Unit Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                className="rounded-2xl bg-gray-50 border-none font-black h-16 text-2xl px-6 focus-visible:ring-primary/20"
              />
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-gray-100 p-3 rounded-xl">
                  <Info className="w-3.5 h-3.5" />
                  Total Order value will include 5% tax + delivery fees automatically.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleConfirmAccept}
              disabled={isSubmitting}
              className="w-full rounded-2xl h-14 text-lg font-black shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Creating Order...
                </>
              ) : (
                'Accept & Create Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
