import React from 'react';
import { Star, Quote, Award, Users, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const stats = [
    { label: 'Orders Delivered', value: '45k+', icon: CheckCircle },
    { label: 'Active Users', value: '12k+', icon: Users },
    { label: 'Pharmacy Partners', value: '1.2k+', icon: Award },
    { label: 'Average Rating', value: '4.9/5', icon: Star },
];

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Mother of two',
        content: 'SwasthRoute saved us during a midnight fever emergency. The medicine arrived in 12 minutes. Truly a lifesaver!',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
        name: 'Dr. Rajesh Mehta',
        role: 'General Physician',
        content: 'I recommend SwasthRoute to all my patients for urgent needs. Their verification process for pharmacies is top-notch.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    },
    {
        name: 'Amit Patel',
        role: 'Senior Citizen',
        content: 'The app is so easy to use. I can track my daughter\'s orders for my medicines in real-time. Very reliable service.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
    },
];

export default function TrustSection() {
    return (
        <section className="py-24 bg-card relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="text-center space-y-2 group">
                                <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-3xl md:text-4xl font-black tracking-tighter">{stat.value}</div>
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Testimonials Header */}
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight">Voices of Our Community</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Don't just take our word for it. Here is what our users have to say about their experience.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <Card key={i} className="p-8 border-primary/5 hover:border-primary/20 transition-all duration-300 relative group">
                            <Quote className="absolute top-6 right-8 w-10 h-10 text-primary/5 group-hover:text-primary/10 transition-colors" />
                            <div className="space-y-6 relative z-10">
                                <p className="text-lg font-medium leading-relaxed italic text-muted-foreground">
                                    "{t.content}"
                                </p>
                                <div className="flex items-center gap-4 pt-4 border-t border-primary/5">
                                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full bg-secondary" />
                                    <div>
                                        <div className="font-bold text-lg">{t.name}</div>
                                        <div className="text-sm text-primary font-semibold">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Trust Badges */}
                <div className="mt-24 pt-12 border-t border-primary/5 flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
                        <ShieldCheck className="w-6 h-6 text-primary" /> SECURE PAY
                    </div>
                    <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
                        <CheckCircle className="w-6 h-6 text-primary" /> ISO CERTIFIED
                    </div>
                    <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
                        <Lock className="w-6 h-6 text-primary" /> DATA ENCRYPTED
                    </div>
                </div>
            </div>
        </section>
    );
}

import { ShieldCheck, Lock } from 'lucide-react';
