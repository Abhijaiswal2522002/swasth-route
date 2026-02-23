import { MapPin, Clock, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: MapPin,
    title: 'Smart Location Detection',
    description: 'Automatically detects your location to show nearby pharmacies with real-time availability',
  },
  {
    icon: Clock,
    title: 'Ultra-Fast Delivery',
    description: 'Get emergency medicines delivered to your doorstep in minutes, not hours',
  },
  {
    icon: Shield,
    title: 'Verified Pharmacies',
    description: 'All pharmacies are verified and approved by our expert team for quality assurance',
  },
  {
    icon: TrendingUp,
    title: 'Live Tracking',
    description: 'Track your order in real-time from the pharmacy to your location on the map',
  },
  {
    icon: Users,
    title: 'Trusted Network',
    description: 'Connect with a network of trusted local pharmacies committed to your health',
  },
  {
    icon: Zap,
    title: 'Instant Ordering',
    description: 'One-click ordering with saved prescriptions and order history for quick reorders',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Why Choose SwasthRoute?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We combine technology with healthcare expertise to deliver emergency medicines when you need them most
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group p-8 border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-primary/5"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
