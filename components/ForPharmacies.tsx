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

                    <div className="relative">
                        <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                <div className="text-center space-y-6">
                                    <div className="inline-block p-4 rounded-2xl bg-background shadow-xl border border-primary/10 animate-bounce">
                                        <TrendingUp className="w-12 h-12 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold">100% Digital Workflow</h3>
                                    <p className="text-muted-foreground">Manage orders, update stock, and track earnings from one powerful dashboard.</p>
                                </div>
                            </div>
                        </div>
                        {/* Floating stats card */}
                        <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl border border-primary/10 shadow-2xl space-y-2 max-w-[200px] animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-3xl font-bold text-primary">4.9/5</div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Partner Satisfaction</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
