'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PharmacyCard } from '@/components/PharmacyCard';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useAuth } from '@/lib/hooks/useAuth';

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
  }, [searchQuery]);

  const handleViewDetails = (id: string) => {
    console.log('[v0] Viewing pharmacy:', id);
    // Navigate to pharmacy details page or open modal
  };

  return (
    <>
      {!user && <HeroSection />}

      {user && (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-primary/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SwasthRoute
              </h1>
              <div className="text-sm text-muted-foreground">
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location detected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Search section */}
            <div className="space-y-6 mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Find Emergency Medicines</h2>
                <p className="text-muted-foreground">
                  Search for medicines and find nearby pharmacies with real-time availability
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search medicines or pharmacies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-primary/20 bg-card/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Info banner */}
            {location && (
              <div className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Location Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Showing pharmacies near your location. Results are sorted by distance and delivery time.
                  </p>
                </div>
              </div>
            )}

            {/* Pharmacies grid */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  {searchQuery ? 'Search Results' : 'Nearby Pharmacies'}
                </h3>
                <p className="text-muted-foreground">
                  {filteredPharmacies.length} pharmacies available
                </p>
              </div>

              {filteredPharmacies.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="py-12 text-center space-y-4">
                  <p className="text-muted-foreground text-lg">No pharmacies found</p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className="border-primary/20"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!user && <FeaturesSection />}
    </>
  );
}
