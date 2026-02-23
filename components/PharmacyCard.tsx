'use client';

import { MapPin, Clock, Star, Heart, Share2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface PharmacyCardProps {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: number;
  deliveryTime: number;
  isOpen: boolean;
  onViewDetails: (id: string) => void;
}

export function PharmacyCard({
  id,
  name,
  address,
  rating,
  distance,
  deliveryTime,
  isOpen,
  onViewDetails,
}: PharmacyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <Card className="group backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 overflow-hidden hover:shadow-lg hover:scale-105 transform bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-primary/5">
      <div className="p-6 space-y-4">
        {/* Header with rating and actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{address}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 whitespace-nowrap flex-shrink-0">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-semibold text-primary">{rating}</span>
          </div>
        </div>

        {/* Info metrics */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{distance} km</span>
            </div>
            <p className="text-xs text-muted-foreground">Distance</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{deliveryTime} min</span>
            </div>
            <p className="text-xs text-muted-foreground">Delivery</p>
          </div>
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-1.5 ${isOpen ? 'text-green-600' : 'text-destructive'}`}>
              <span className="inline-block h-2 w-2 rounded-full bg-current" />
              <span className="text-sm font-medium">{isOpen ? 'Open' : 'Closed'}</span>
            </div>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-md transition-all"
            onClick={() => onViewDetails(id)}
          >
            Order Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-3 border-primary/20 hover:bg-primary/5"
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? 'fill-destructive text-destructive' : ''}`}
            />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-3 border-primary/20 hover:bg-primary/5"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick contact */}
        <div className="pt-2 border-t border-primary/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-primary hover:bg-primary/10"
          >
            <Phone className="h-4 w-4 mr-2" />
            <span className="text-xs">Call Pharmacy</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
