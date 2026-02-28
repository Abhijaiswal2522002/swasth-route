import { TrendingUp, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const benefits = [
    {
        icon: TrendingUp,
        title: 'Increase Sales',
        description: 'Reach more customers in your area and boost your daily medicine orders.',
    },
    {
        icon: Users,
        title: 'New Customer Reach',
        description: 'Connect with patients who need medicines urgently and build long-term trust.',
    },
    {
        icon: ShieldCheck,
        title: 'Verified Status',
        description: 'Get a verified badge and prioritize your pharmacy in local search results.',
    },
];

export default function ForPharmacies() {
    return (
        <section id="for-pharmacies" className="py-24 bg-gradient-to-b from-secondary/5 to-background border-y border-primary/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                Empowering Pharmacies to <span className="text-primary">Save Lives</span>
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Join our network of elite pharmacies and provide essential healthcare services to your local community with zero hassle.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold">{benefit.title}</h4>
                                            <p className="text-muted-foreground">{benefit.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Link href="/auth/signup" className="inline-block">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all">
                                Join as Pharmacy <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="relative h-full">
                        <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 shadow-2xl relative overflow-hidden group">
                            {/* Pharmacy Image with Overlay */}
                            <img
                                src="/pharmacy.jpg"
                                alt="Pharmacy Network"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                <div className="text-center space-y-6 relative z-10">
                                    <div className="inline-block p-4 rounded-2xl bg-card shadow-2xl border border-primary/10 group-hover:-translate-y-2 transition-transform duration-500">
                                        <TrendingUp className="w-12 h-12 text-primary" />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight">100% Digital Workflow</h3>
                                    <p className="text-muted-foreground font-medium max-w-sm mx-auto">Manage orders, update stock, and track earnings from one powerful dashboard.</p>
                                </div>
                            </div>
                        </div>
                        {/* Floating stats card - Adjusted for mobile position */}
                        <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 bg-card/90 backdrop-blur-xl p-5 md:p-8 rounded-2xl md:rounded-3xl border border-primary/10 shadow-2xl space-y-1 md:space-y-2 max-w-[180px] md:max-w-[240px] animate-fade-in group hover:-translate-y-1 transition-transform z-20">
                            <div className="text-2xl md:text-4xl font-black text-primary tracking-tighter">4.9/5</div>
                            <p className="text-[10px] md:text-sm text-muted-foreground font-bold uppercase tracking-widest leading-tight">Partner Satisfaction</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
