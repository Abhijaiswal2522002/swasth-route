import React from 'react';

const partners = [
    { name: 'HealthKart', logo: '💊' },
    { name: 'Apollo Pharmacy', logo: '🏥' },
    { name: 'MedPlus', logo: '🧪' },
    { name: 'Wellness Forever', logo: '🌿' },
    { name: 'Netmeds', logo: '📦' },
    { name: 'Pharmeasy', logo: '🚚' },
];

export default function PartnerLogos() {
    return (
        <section className="py-12 bg-background border-y border-primary/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-10">
                    Powering the network with trusted partners
                </p>

                <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center opacity-40 hover:opacity-100 transition-opacity duration-700">
                    {partners.map((partner, i) => (
                        <div key={i} className="flex items-center gap-3 group cursor-pointer">
                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all scale-100 group-hover:scale-125 duration-300">
                                {partner.logo}
                            </span>
                            <span className="text-xl font-black tracking-tighter group-hover:text-primary transition-colors">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
