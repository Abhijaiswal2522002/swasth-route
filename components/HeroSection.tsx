'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { MapPin, Clock, Heart, Zap } from 'lucide-react';

export default function HeroSection() {
  const { location, loading } = useGeolocation();
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    if (location) {
      setLocationText(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    }
  }, [location]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SwasthRoute
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-primary hover:bg-primary/10">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
                Emergency Medicine,{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Delivered Fast
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Find nearby pharmacies, order emergency medicines, and get doorstep delivery within minutes. Connect with trusted local pharmacies in your area.
              </p>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">5min</div>
                <p className="text-sm text-muted-foreground">Avg. Delivery</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <p className="text-sm text-muted-foreground">Pharmacies</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup" className="flex-1">
                <Button className="w-full h-12 bg-gradient-to-r from-primary to-accent text-lg hover:shadow-lg transition-all">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full h-12 border-primary/30 hover:bg-primary/5 text-lg"
                >
                  Explore Pharmacies
                </Button>
              </Link>
            </div>

            {/* Location status */}
            {location && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <MapPin className="w-5 h-5 text-primary animate-pulse" />
                <div className="text-sm">
                  <p className="font-medium">Location detected</p>
                  <p className="text-muted-foreground text-xs">{locationText}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <Zap className="w-5 h-5 text-secondary animate-spin" />
                <p className="text-sm text-muted-foreground">Detecting your location...</p>
              </div>
            )}
          </div>

          {/* Right side - Visual showcase */}
          <div className="hidden md:block">
            <div className="relative space-y-4">
              {/* Card 1 - Medicine Order */}
              <div className="backdrop-blur-sm bg-card/60 border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:scale-105 transform">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Quick Search</h3>
                    <p className="text-sm text-muted-foreground">Find medicines and nearby pharmacies instantly</p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Real-time tracking */}
              <div className="backdrop-blur-sm bg-card/60 border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-all hover:shadow-lg hover:scale-105 transform">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/20">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Real-time Tracking</h3>
                    <p className="text-sm text-muted-foreground">Track your order from pharmacy to doorstep</p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Fast delivery */}
              <div className="backdrop-blur-sm bg-card/60 border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:scale-105 transform">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Express Delivery</h3>
                    <p className="text-sm text-muted-foreground">Emergency medicines delivered in minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
