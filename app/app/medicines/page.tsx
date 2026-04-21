'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Search, RefreshCw, Store, MapPin, Plus } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ApiClient from '@/lib/api';
import { useCart } from '@/lib/context/CartContext';
import { useLocation } from '@/lib/context/LocationContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function MedicinesContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pharmacyId = searchParams.get('pharmacy');
  const initialQuery = searchParams.get('query') || '';
  const { addToCart } = useCart();
  const { selectedLocation } = useLocation();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestData, setRequestData] = useState({
    quantity: 1,
    paymentMethod: 'COD'
  });

  const handleRaiseRequest = async () => {
    if (!searchTerm) {
      toast.error("Please enter a medicine name first");
      return;
    }

    if (!selectedLocation && (!user?.addresses || user.addresses.length === 0)) {
      toast.error("Please select a delivery address first");
      return;
    }

    setIsSubmitting(true);
    try {
      const address = selectedLocation || user?.addresses[0];
      const res = await ApiClient.createMedicineRequest({
        medicineName: searchTerm,
        quantity: requestData.quantity,
        paymentMethod: requestData.paymentMethod,
        deliveryAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          latitude: address.latitude,
          longitude: address.longitude,
        }
      });

      if (res.data) {
        toast.success("Medicine request raised successfully! Nearby pharmacies will see it.");
        setIsRequestModalOpen(false);
      } else {
        toast.error(res.error || "Failed to raise request");
      }
    } catch (error) {
      toast.error("An error occurred while raising request");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          if (pharmacyId) {
            const res = await ApiClient.getPharmacyDetails(pharmacyId);
            if (res.data) {
              const pharm = res.data as any;
              setPharmacies([pharm]);
              
              const meds: any[] = [];
              if (pharm.inventory) {
                pharm.inventory.forEach((item: any) => {
                  meds.push({
                    ...item,
                    pharmacyName: pharm.name,
                    pharmacyId: pharm._id || pharm.id,
                    distance: 0,
                    status: pharm.status
                  });
                });
              }
              setAllMedicines(meds);
            }
          } else {
            // Use global selected location, or user's default, or Mumbai
            const lat = selectedLocation?.latitude || user.addresses?.[0]?.latitude || 19.0760;
            const lon = selectedLocation?.longitude || user.addresses?.[0]?.longitude || 72.8777;

            const res = await ApiClient.getNearbyPharmacies(lat, lon, 10000); // 10km range
            if (res.data) {
              const pharmacyData = res.data as any[];
              setPharmacies(pharmacyData);
              
              const meds: any[] = [];
              pharmacyData.forEach((pharm: any) => {
                if (pharm.inventory) {
                  pharm.inventory.forEach((item: any) => {
                    meds.push({
                      ...item,
                      pharmacyName: pharm.name,
                      pharmacyId: pharm._id || pharm.id,
                      distance: pharm.distance,
                      status: pharm.status
                    });
                  });
                }
              });
              setAllMedicines(meds);
            }
          }
        } catch (error) {
          console.error('Error fetching medicines:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, authLoading, router, pharmacyId, selectedLocation]);

  const filteredMedicines = allMedicines.filter((medicine) =>
    medicine.medicineName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (isLoading && allMedicines.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">
          {pharmacyId ? 'Scanning pharmacy inventory...' : 'Scanning nearby pharmacies...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Browse Medicines</h1>
        <p className="text-gray-500 max-w-2xl mb-8 font-medium">
          {pharmacyId 
            ? `Viewing inventory for ${pharmacies[0]?.name || 'the selected pharmacy'}.` 
            : 'Find and order medicines from verified pharmacies near your current location.'}
        </p>
        
        <div className="relative max-w-3xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for medicines, syrups, or health supplements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm text-lg font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((medicine, i) => (
            <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Pill className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${medicine.quantity > 0
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {medicine.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {medicine.distance !== undefined && medicine.distance > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5" />
                        {(medicine.distance / 1000).toFixed(1)} km
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors">{medicine.medicineName}</h3>
                  <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                    <Store className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[180px]">{medicine.pharmacyName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                  <div>
                    <p className="text-3xl font-black text-gray-900">₹{medicine.price}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Per Unit</p>
                  </div>
                  <Button
                    size="lg"
                    disabled={medicine.quantity <= 0}
                    onClick={() => addToCart({
                      medicineId: medicine._id || medicine.id,
                      pharmacyId: medicine.pharmacyId,
                      medicineName: medicine.medicineName,
                      price: medicine.price
                    })}
                    className="rounded-2xl px-6 font-black shadow-lg shadow-primary/20 h-12"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Pill className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium mb-6">Try searching for something else or check pharmacies in a different area.</p>
            <Button 
                onClick={() => setIsRequestModalOpen(true)}
                className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20"
            >
                <Plus className="w-5 h-5 mr-2" />
                Raise a Request
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Raise Medicine Request</DialogTitle>
            <DialogDescription className="font-medium text-gray-500">
              Can't find "{searchTerm}"? Request it from nearby pharmacies.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="medicine" className="text-sm font-bold text-gray-700">Medicine Name</Label>
              <Input
                id="medicine"
                value={searchTerm}
                readOnly
                className="rounded-xl bg-gray-50 border-none font-medium h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-bold text-gray-700">Quantity Needed</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={requestData.quantity}
                onChange={(e) => setRequestData({ ...requestData, quantity: parseInt(e.target.value) || 1 })}
                className="rounded-xl bg-gray-50 border-none font-medium h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">Payment Preference</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestData({ ...requestData, paymentMethod: 'COD' })}
                  className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                    requestData.paymentMethod === 'COD' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                  }`}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setRequestData({ ...requestData, paymentMethod: 'Prepaid' })}
                  className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                    requestData.paymentMethod === 'Prepaid' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                  }`}
                >
                  Prepaid
                </button>
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                        <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Delivery Address</p>
                        <p className="text-sm font-medium text-blue-700 line-clamp-1">
                            {selectedLocation?.street || user?.addresses?.[0]?.street || 'No address selected'}
                        </p>
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleRaiseRequest}
              disabled={isSubmitting}
              className="w-full rounded-2xl h-14 text-lg font-black shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                'Broadcast Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MedicinesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading...</p>
      </div>
    }>
      <MedicinesContent />
    </Suspense>
  );
}
