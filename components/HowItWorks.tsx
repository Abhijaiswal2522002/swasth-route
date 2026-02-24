import { Search, ShoppingCart, Truck } from 'lucide-react';

const steps = [
    {
        icon: Search,
        title: 'Find Nearby Pharmacy',
        description: 'Instantly locate live-verified pharmacies in your immediate vicinity with the medicines you need.',
        color: 'bg-blue-500/10 text-blue-500',
    },
    {
        icon: ShoppingCart,
        title: 'Place Emergency Order',
        description: 'Upload prescriptions or select medicines for prioritize fulfillment by our partner pharmacies.',
        color: 'bg-green-500/10 text-green-500',
    },
    {
        icon: Truck,
        title: 'Get Medicine Fast',
        description: 'Our hyper-local delivery network ensures your emergency medicines reach you in record time.',
        color: 'bg-primary/10 text-primary',
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold">How It Works</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Three simple steps to get your emergency medicines delivered
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connector line for desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-12" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="relative space-y-6 text-center group">
                                <div className={`w-24 h-24 mx-auto rounded-3xl ${step.color} flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-500 bg-card border border-primary/5`}>
                                    <Icon className="w-10 h-10" />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center border-4 border-background">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed px-4">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
