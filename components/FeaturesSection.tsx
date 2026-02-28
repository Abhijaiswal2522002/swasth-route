import { MapPin, Clock, Shield, TrendingUp, Users, Zap, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: MapPin,
    title: 'Precision Locating',
    description: 'Our proprietary hyper-local engine detects pharmacies within your exact delivery radius with 99.9% accuracy.',
    badge: 'Real-time',
  },
  {
    icon: Clock,
    title: 'Sub-15m Delivery',
    description: 'Proprietary routing algorithms ensure your emergency medicines reach you faster than any traditional service.',
    badge: 'Fastest',
  },
  {
    icon: Shield,
    title: 'Certified Safety',
    description: 'Every partner pharmacy undergoes a rigorous 20-point verification check for quality and compliance.',
    badge: 'Verified',
  },
  {
    icon: TrendingUp,
    title: 'Dynamic Tracking',
    description: 'Watch your order move map-pin by map-pin. No more guessing when your relief will arrive.',
    badge: 'Live',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Built for local neighborhoods, powered by trusted local pharmacists who know your community best.',
    badge: 'Local',
  },
  {
    icon: Zap,
    title: 'One-Tap Fulfillment',
    description: 'Revolutionary ordering flow that gets you from symptom to solution in less than 60 seconds.',
    badge: 'Smart',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-secondary/5 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2 -z-10"></div>
      <div className="absolute top-20 left-10 w-96 h-96 opacity-5 -z-10 grayscale brightness-0">
        <img src="/OIP.webp" alt="Background Texture" className="w-full h-full object-contain" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            <span>Why SwasthRoute</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Engineered for <span className="text-primary">Reliability.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            We don't just deliver medicine; we deliver peace of mind when you need it most.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative p-8 border-primary/10 hover:border-primary/40 hover:shadow-[0_20px_60px_-15px_rgba(var(--primary-rgb),0.2)] transition-all duration-500 bg-card overflow-hidden"
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                      {feature.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-500">
                    <div className="text-sm font-bold text-primary inline-flex items-center gap-1">
                      Learn more <span className="text-lg">→</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
