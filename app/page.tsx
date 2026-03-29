'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, AlertCircle, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PharmacyCard } from '@/components/PharmacyCard';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import ForPharmacies from '@/components/ForPharmacies';
import TrustSection from '@/components/TrustSection';
import PartnerLogos from '@/components/PartnerLogos';

import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MapBox from '@/components/MapBox';
import ApiClient from '@/lib/api';

interface Pharmacy {
  _id: string;
  name: string;
  address: {
    city: string;
    pincode: string;
    street?: string;
  };
  location?: {
    type: string;
    coordinates: number[];
  };
  rating: number;
  distance: number;
  deliveryTime: number;
  isOpen: boolean;
  status?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { location } = useGeolocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (location) {
        setIsLoadingPharmacies(true);
        try {
          const response = await ApiClient.getNearbyPharmacies(location.latitude, location.longitude);
          if (response.data) {
            // Add some mock delivery data if missing from API
            const enrichedData = (response.data as any[]).map(p => ({
              ...p,
              distance: parseFloat((Math.random() * 5 + 1).toFixed(1)), // Mock distance for now if not sent by backend
              deliveryTime: Math.floor(Math.random() * 30 + 20),
              isOpen: p.status === 'active'
            }));
            setPharmacies(enrichedData);
          }
        } catch (err) {
          console.error("Failed to fetch nearby pharmacies:", err);
        } finally {
          setIsLoadingPharmacies(false);
        }
      }
    };
    fetchPharmacies();
  }, [location]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = pharmacies.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pharmacy.address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPharmacies(filtered);
    } else {
      setFilteredPharmacies(pharmacies);
    }
  }, [searchQuery, pharmacies]);

  const handleViewDetails = (id: string) => {
    console.log('[v0] Viewing pharmacy:', id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {!user && (
          <>
            <HeroSection />
            <PartnerLogos />
            <HowItWorks />
            <FeaturesSection />
            <TrustSection />
            <ForPharmacies />
          </>
        )}

        {/* Search & Results Section (Emergency Order Primary CTA Target) */}
        <section id="emergency" className="scroll-mt-24">
          {user ? (
            <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
              <div className="max-w-7xl mx-auto px-6 py-12">
                {user.role === 'pharmacy' ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-4xl font-black tracking-tight">
                        Welcome back, <span className="text-primary">{user.name}</span>
                      </h1>
                      <p className="text-xl text-muted-foreground max-w-2xl">
                        Monitor your pharmacy's performance and manage emergency medicine orders in real-time.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <ShoppingCart className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                            <h3 className="text-3xl font-bold">128</h3>
                          </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start text-primary" onClick={() => router.push('/app/orders')}>
                          View all orders →
                        </Button>
                      </Card>

                      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                            <h3 className="text-3xl font-bold">5</h3>
                          </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start text-amber-500" onClick={() => router.push('/app/orders?status=pending')}>
                          Review requests →
                        </Button>
                      </Card>

                      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revenue</p>
                            <h3 className="text-3xl font-bold">₹24,500</h3>
                          </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start text-green-500" onClick={() => router.push('/app/analytics')}>
                          View analytics →
                        </Button>
                      </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 space-y-6">
                          <h3 className="text-2xl font-bold">Quick Actions</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <Button className="h-14 text-lg font-bold" onClick={() => router.push('/app/inventory')}>
                               Manage Inventory
                            </Button>
                            <Button variant="outline" className="h-14 text-lg font-bold" onClick={() => router.push('/app/profile')}>
                               Update Pharmacy Profile
                            </Button>
                          </div>
                       </div>
                       <div className="p-8 rounded-2xl bg-accent/5 border border-accent/10 space-y-4 flex flex-col justify-center text-center">
                          <AlertCircle className="w-12 h-12 text-accent mx-auto" />
                          <h3 className="text-2xl font-bold text-accent">Availability Status</h3>
                          <p className="text-muted-foreground">Your pharmacy is currently marked as <span className="font-bold text-green-500 uppercase">Open</span></p>
                          <Button variant="outline" className="border-accent/20 hover:bg-accent/10">Toggle Offline</Button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 mb-12">
                      <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                          Find Emergency Medicines
                        </h2>
                        <p className="text-xl text-muted-foreground">
                          Search for medicines and find nearby pharmacies with real-time availability
                        </p>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl group-focus-within:bg-primary/10 transition-colors" />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary" />
                        <Input
                          placeholder="Search medicines or pharmacies..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-14 h-16 text-lg border-primary/20 bg-card/50 backdrop-blur-sm focus:border-primary shadow-lg relative rounded-2xl"
                        />
                      </div>
                    </div>

                    {location && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                         <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                               <h3 className="text-xl font-bold flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-primary" /> Live Pharmacy Map
                               </h3>
                               <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  {filteredPharmacies.length} Active Nodes
                               </span>
                            </div>
                            <MapBox 
                              center={{ lat: location.latitude, lng: location.longitude }}
                              zoom={13}
                              height="450px"
                              markers={filteredPharmacies.map(p => ({
                                id: p._id,
                                name: p.name,
                                lat: p.location?.coordinates[1] || location.latitude,
                                lng: p.location?.coordinates[0] || location.longitude,
                                address: `${p.address.city} - ${p.address.pincode}`,
                                status: p.isOpen ? 'active' : 'inactive',
                                rating: p.rating,
                                color: p.isOpen ? 'text-primary' : 'text-muted-foreground'
                              }))}
                              className="shadow-2xl shadow-primary/5 border-primary/10"
                            />
                         </div>
                         <div className="flex flex-col gap-6">
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4 h-full">
                              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                              <div className="space-y-4">
                                <div>
                                  <p className="font-bold text-lg">Hyper-Local Routing</p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Our algorithm has detected your presence. We are currently surfacing verified pharmacies within a 5km radius for immediate response.
                                  </p>
                                </div>
                                <div className="space-y-2">
                                   <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                      <span>Signal Strength</span>
                                      <span className="text-primary">Optimized</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary w-[85%] animate-pulse" />
                                   </div>
                                </div>
                              </div>
                            </div>
                            <Card className="p-6 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                               <h4 className="font-bold mb-2">Emergency Mode</h4>
                               <p className="text-xs text-muted-foreground mb-4">Click any marker on the map to see pharmacy details and stock status.</p>
                               <Button size="sm" className="w-full text-[10px] font-black uppercase tracking-widest h-10">Recalibrate GPS</Button>
                            </Card>
                         </div>
                      </div>
                    )}

                    <div className="space-y-8">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-bold">
                            {searchQuery ? 'Search Results' : 'Nearby Pharmacies'}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
                            {filteredPharmacies.length} pharmacies found
                          </p>
                        </div>
                      </div>

                      {filteredPharmacies.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {filteredPharmacies.map((pharmacy) => (
                            <PharmacyCard
                              key={pharmacy._id}
                              id={pharmacy._id}
                              name={pharmacy.name}
                              address={`${pharmacy.address.city} - ${pharmacy.address.pincode}`}
                              rating={pharmacy.rating}
                              distance={pharmacy.distance}
                              deliveryTime={pharmacy.deliveryTime}
                              isOpen={pharmacy.isOpen}
                              onViewDetails={handleViewDetails}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-24 text-center space-y-6">
                          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                            <Search className="w-10 h-10" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-2xl font-bold">No pharmacies found</p>
                            <p className="text-muted-foreground max-w-md mx-auto">We couldn't find any pharmacies matching your search. Try broadening your criteria or search term.</p>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => setSearchQuery('')}
                            className="px-8 h-12"
                          >
                            Clear Search
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="py-24 bg-secondary/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent_50%)]" />
              <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-12">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-bold uppercase tracking-widest mb-4">
                    Primary CTA
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                    Ready to Place an <span className="text-destructive">Emergency Order?</span>
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Join thousands of users who trust SwasthRoute for lightning-fast emergency medicine delivery.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/auth/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="h-16 px-12 text-xl font-bold bg-destructive hover:bg-destructive/90 shadow-2xl hover:shadow-destructive/20 transition-all hover:-translate-y-1 w-full">
                      Order Now 🚀
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold hover:bg-primary/5 transition-all w-full">
                      Login to Account
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground font-medium">
                  * Emergency orders are prioritized by our delivery partners 24/7.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

    </div>
  );
}
