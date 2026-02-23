'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Loading medicines...</p>
      </div>
    );
  }

  const medicines = [
    { id: 1, name: 'Aspirin', category: 'Pain Relief', price: 50, inStock: true },
    { id: 2, name: 'Paracetamol', category: 'Fever', price: 45, inStock: true },
    { id: 3, name: 'Ibuprofen', category: 'Anti-Inflammatory', price: 75, inStock: true },
    { id: 4, name: 'Vitamin D', category: 'Supplements', price: 120, inStock: true },
    { id: 5, name: 'Cough Syrup', category: 'Cough', price: 95, inStock: false },
    { id: 6, name: 'Antacid', category: 'Digestive', price: 60, inStock: true },
  ];

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Browse Medicines</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((medicine) => (
            <Card key={medicine.id} className="hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${medicine.inStock
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                    {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <h3 className="font-semibold text-lg mb-1">{medicine.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{medicine.category}</p>

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">₹{medicine.price}</p>
                  <Button
                    size="sm"
                    disabled={!medicine.inStock}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No medicines found</p>
          </div>
        )}
      </div>
    </div>
  );
}
