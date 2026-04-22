'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, RefreshCw, Clock, CheckCircle2, MapPin, Phone, Store, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';

export default function UserRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchRequests();
    }
  }, [user, authLoading, router]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.getUserMedicineRequests();
      if (res.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load your requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOffer = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await ApiClient.confirmMedicineRequestOffer(requestId);
      if (res.data) {
        toast.success('Offer accepted! Order has been created.');
        fetchRequests();
      } else {
        toast.error(res.error || 'Failed to accept offer');
      }
    } catch (error) {
      toast.error('An error occurred while accepting offer');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectOffer = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await ApiClient.rejectMedicineRequestOffer(requestId);
      if (res.data) {
        toast.success('Offer rejected.');
        fetchRequests();
      } else {
        toast.error(res.error || 'Failed to reject offer');
      }
    } catch (error) {
      toast.error('An error occurred while rejecting offer');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Medicine Requests</h1>
        <p className="text-gray-500 font-medium">Track requests you've raised for unavailable medicines.</p>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Pill className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500 max-w-sm mx-auto font-medium mb-8">You haven't raised any medicine requests yet.</p>
          <Button onClick={() => router.push('/app/medicines')} className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20">
            Browse Medicines
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request._id} className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        request.status === 'Accepted' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {request.status === 'Accepted' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          request.status === 'Accepted' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {request.status}
                        </span>
                        <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-tighter">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                        {request.medicineName}
                      </h3>
                      <p className="text-gray-500 font-bold text-sm">Quantity: {request.quantity} units • {request.paymentMethod}</p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{request.deliveryAddress.street}, {request.deliveryAddress.city}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 min-w-[200px]">
                    {request.status === 'Offered' && request.offeredBy ? (
                      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3 shadow-inner">
                        <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
                          <Store className="w-4 h-4" />
                          <span className="truncate">{request.offeredBy.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-blue-900">Offered Price: <span className="font-black text-xl">₹{request.offeredPrice}</span></p>
                          <p className="text-sm font-medium text-blue-900">Expected: <span className="font-bold">{request.expectedDate}</span></p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 rounded-xl h-10 font-bold border-blue-200 text-blue-700 hover:bg-blue-100"
                            onClick={() => handleRejectOffer(request._id)}
                            disabled={processingId === request._id}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 rounded-xl h-10 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                            onClick={() => handleConfirmOffer(request._id)}
                            disabled={processingId === request._id}
                          >
                            {processingId === request._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Accept Offer'}
                          </Button>
                        </div>
                      </div>
                    ) : request.status === 'Accepted' && request.acceptedBy ? (
                      <div className="p-5 bg-green-50 rounded-2xl border border-green-100 space-y-3">
                        <div className="flex items-center gap-2 text-green-800 font-bold mb-1">
                          <Store className="w-4 h-4" />
                          <span className="truncate">{request.acceptedBy.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-black text-green-900">₹{request.price}</p>
                          <Button 
                            size="sm" 
                            className="rounded-xl h-9 font-black shadow-md shadow-green-200 bg-green-600 hover:bg-green-700"
                            onClick={() => router.push(`/app/orders`)}
                          >
                            View Order
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-400 text-sm font-medium text-center">
                        Waiting for pharmacies to respond...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
