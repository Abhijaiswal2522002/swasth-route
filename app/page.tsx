'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Pharmacy {
  _id: string;
  name: string;
  address: {
    city: string;
    pincode: string;
  };
  rating: number;
  distance: number;
  deliveryTime: number;
  isOpen: boolean;
}

export default function HomePage() {
  const { location } = useGeolocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([
    {
      _id: '1',
      name: 'HealthCare Pharmacy',
      address: { city: 'Mumbai', pincode: '400001' },
      rating: 4.8,
      distance: 2.3,
      deliveryTime: 35,
      isOpen: true,
    },
    {
      _id: '2',
      name: 'MediPlus Chemist',
      address: { city: 'Mumbai', pincode: '400002' },
      rating: 4.6,
      distance: 3.1,
      deliveryTime: 45,
      isOpen: true,
    },
    {
      _id: '3',
      name: 'Emergency Pharmacy',
      address: { city: 'Mumbai', pincode: '400003' },
      rating: 4.9,
      distance: 1.8,
      deliveryTime: 25,
      isOpen: true,
    },
    {
      _id: '4',
      name: 'Care Chemist Store',
      address: { city: 'Mumbai', pincode: '400004' },
      rating: 4.7,
      distance: 2.5,
      deliveryTime: 40,
      isOpen: true,
    },
  ]);
  const [filteredPharmacies, setFilteredPharmacies] = useState(pharmacies);

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
                  <div className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-lg">Location Enabled</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Showing pharmacies near your location. Results are sorted using our real-time hyper-local routing algorithm.
                      </p>
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
