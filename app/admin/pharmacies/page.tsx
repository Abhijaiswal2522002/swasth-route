'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Map as MapIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';
import MapBox from '@/components/MapBox';

interface PharmacyDoc {
  name: string;
  url: string;
}

interface Pharmacy {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: {
    city: string;
    pincode: string;
  };
  status: string;
  isVerified: boolean;
  licenseNumber?: string;
  licenseExpiry?: string;
  commissionRate: number;
  rating: number;
  documents?: PharmacyDoc[];
  location?: {
     type: string;
     coordinates: number[];
  };
  createdAt: string;
}

export default function PharmacyApprovalPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        setIsLoading(true);
        const response = await ApiClient.getAllPharmacies(selectedStatus);
        if (response.error) {
          setError(response.error);
        } else {
          setPharmacies(response.data as Pharmacy[]);
        }
      } catch (err) {
        setError('Failed to load pharmacies');
      } finally {
        setIsLoading(false);
      }
    };

    loadPharmacies();
  }, [selectedStatus]);

  const handleApprove = async (pharmacyId: string) => {
    try {
      const response = await ApiClient.approvePharmacy(pharmacyId);
      if (response.error) {
        alert('Error: ' + response.error);
      } else {
        setPharmacies(pharmacies.filter(p => p._id !== pharmacyId));
      }
    } catch (err) {
      alert('Failed to approve pharmacy');
    }
  };

  const handleReject = async (pharmacyId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        const response = await ApiClient.rejectPharmacy(pharmacyId, reason);
        if (response.error) {
          alert('Error: ' + response.error);
        } else {
          setPharmacies(pharmacies.filter(p => p._id !== pharmacyId));
        }
      } catch (err) {
        alert('Failed to reject pharmacy');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'inactive':
      case 'suspended':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300';
      case 'inactive':
      case 'suspended':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading pharmacies...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Pharmacy Approval Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            {['pending', 'active', 'inactive', 'suspended'].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedStatus(status);
                  setError(null);
                }}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
          
          <div className="flex border rounded-lg p-1 bg-muted/50">
            <Button 
               variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
               size="sm" 
               className="h-8 px-3 rounded-md gap-2"
               onClick={() => setViewMode('list')}
            >
               <List className="w-4 h-4" /> List
            </Button>
            <Button 
               variant={viewMode === 'map' ? 'secondary' : 'ghost'} 
               size="sm" 
               className="h-8 px-3 rounded-md gap-2"
               onClick={() => setViewMode('map')}
            >
               <MapIcon className="w-4 h-4" /> Map
            </Button>
          </div>
        </div>

        {/* Pharmacies Content */}
        {pharmacies.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pharmacies found</p>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {pharmacies.map((pharmacy) => (
              <Card key={pharmacy._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(pharmacy.status)}
                        <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">{pharmacy.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {pharmacy.address.city}, {pharmacy.address.pincode}
                      </p>
                    </div>
                    <Badge className={getStatusColor(pharmacy.status)}>
                      {pharmacy.status.charAt(0).toUpperCase() + pharmacy.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Email</p>
                      <p className="text-sm font-medium text-foreground">{pharmacy.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">License</p>
                      <p className="text-sm font-medium text-foreground">{pharmacy.licenseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Commission Rate</p>
                      <p className="text-sm font-medium text-primary">{pharmacy.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Rating</p>
                      <p className="text-sm font-medium text-foreground">{pharmacy.rating.toFixed(1)}/5</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {pharmacy.status === 'pending' && (
                    <div className="flex gap-2 border-t border-border pt-4">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(pharmacy._id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(pharmacy._id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {pharmacy.status === 'active' && (
                    <div className="flex gap-2 border-t border-border pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const rate = prompt('Enter commission rate (%):');
                          if (rate) {
                            ApiClient.updateCommissionRate(pharmacy._id, parseFloat(rate));
                          }
                        }}
                      >
                        Update Commission
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             <Card className="p-0 overflow-hidden border-border bg-card">
                <MapBox 
                  height="600px"
                  center={{ lat: 19.076, lng: 72.8777 }} // Center on Mumbai generally
                  zoom={11}
                  markers={pharmacies.map(p => ({
                    id: p._id,
                    name: p.name,
                    lat: p.location?.coordinates[1] || 0,
                    lng: p.location?.coordinates[0] || 0,
                    address: `${p.address.city} - ${p.address.pincode}`,
                    status: p.status,
                    rating: p.rating,
                    color: getStatusColor(p.status).includes('green') ? 'text-green-500' : 
                           getStatusColor(p.status).includes('orange') ? 'text-orange-500' : 'text-red-500'
                  })).filter(m => m.lat !== 0)}
                />
             </Card>
             <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-green-500/5 border-green-500/10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Active Nodes</p>
                   <p className="text-2xl font-black text-green-700">{pharmacies.filter(p => p.status === 'active').length}</p>
                </Card>
                <Card className="p-4 bg-orange-500/5 border-orange-500/10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Pending Review</p>
                   <p className="text-2xl font-black text-orange-700">{pharmacies.filter(p => p.status === 'pending').length}</p>
                </Card>
                <Card className="p-4 bg-red-500/5 border-red-500/10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Restricted</p>
                   <p className="text-2xl font-black text-red-700">{pharmacies.filter(p => p.status === 'inactive' || p.status === 'suspended').length}</p>
                </Card>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
