'use client';

import React, { useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import AmbulancePromo from '@/components/AmbulancePromo';
import ForPharmacies from '@/components/ForPharmacies';
import TrustSection from '@/components/TrustSection';
import PartnerLogos from '@/components/PartnerLogos';
import PlatformShowcase from '@/components/PlatformShowcase';
import DeliveryShowcase from '@/components/DeliveryShowcase';
import PharmacyMagic from '@/components/PharmacyMagic';
import ProductOverview from '@/components/ProductOverview';
import LiveStatsTicker from '@/components/LiveStatsTicker';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.role === 'pharmacy') {
        router.replace('/pharmacy');
      } else if (user.role === 'rider') {
        router.replace('/rider');
      } else {
        router.replace('/app');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  // While restoring session or redirecting authenticated user, display a clean loader
  if (loading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
          Loading SwasthRoute...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <HeroSection />
        <PartnerLogos />
        <HowItWorks />
        <FeaturesSection />
        <AmbulancePromo />
        <ProductOverview />
        <PlatformShowcase />
        <DeliveryShowcase />
        <PharmacyMagic />
        <LiveStatsTicker />
        <TrustSection />
        <ForPharmacies />

        {/* Emergency CTA Section */}
        <section id="emergency" className="scroll-mt-24">
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
                <Link href={`/auth/signup?redirect=${encodeURIComponent('/app/medicines?emergency=true')}`} className="w-full sm:w-auto">
                  <Button size="lg" className="h-16 px-12 text-xl font-bold bg-destructive hover:bg-destructive/90 shadow-2xl hover:shadow-destructive/20 transition-all hover:-translate-y-1 w-full">
                    Order Now 🚀
                  </Button>
                </Link>
                <Link href={`/auth/login?redirect=${encodeURIComponent('/app/medicines?emergency=true')}`} className="w-full sm:w-auto">
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
        </section>
      </main>
    </div>
  );
}
