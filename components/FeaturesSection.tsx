import { MapPin, Clock, Shield, TrendingUp, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: MapPin,
    title: 'Hyper-Local Routing',
    description: 'Our proprietary engine locates medicines within your exact delivery radius with 99.9% availability accuracy.',
    badge: 'Real-time Map',
  },
  {
    icon: Clock,
    title: 'Emergency Delivery',
    description: 'Sub-15m delivery windows ensured by dynamic rider dispatching and priority emergency order lanes.',
    badge: 'Priority Lanes',
  },
  {
    icon: Shield,
    title: 'Pharmacy Audit',
    description: 'Every partner pharmacy undergoes a rigorous 20-point verification check for drug licenses and storage compliance.',
    badge: 'Verified Stock',
  },
  {
    icon: TrendingUp,
    title: 'Live Logistics',
    description: 'Watch your medicine move in real-time with satellite-accurate rider tracking and ETA predictions.',
    badge: 'GPS Tracking',
  },
  {
    icon: Zap,
    title: 'Smart Inventory',
    description: 'Pharmacies benefit from automated expiry alerts, multi-batch tracking, and intelligent restocking insights.',
    badge: 'New Feature',
  },
  {
    icon: Users,
    title: 'Digital POS',
    description: 'Professional billing and inventory management for local pharmacies, bridging the gap between offline and online.',
    badge: 'Enterprise',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-gradient-to-b from-background via-secondary/5 to-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-6 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Next-Gen Health <span className="text-primary italic">Infrastructure.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            We don't just deliver medicine; we've built a robust ecosystem for patients, pharmacists, and logistics partners.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative p-10 border-primary/10 hover:border-primary/40 hover:shadow-[0_40px_100px_-20px_rgba(var(--primary-rgb),0.2)] transition-all duration-700 bg-card overflow-hidden rounded-[2.5rem]"
              >
                {/* Visual Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700" />
                
                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-lg shadow-primary/5">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-secondary border border-primary/5 rounded-full text-muted-foreground">
                      {feature.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight text-gray-900">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100/50 flex items-center justify-between">
                     <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-500">
                        Explore Capability
                     </div>
                     <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                        <ArrowRight className="w-4 h-4" />
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
