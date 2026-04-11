'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/app') || pathname?.startsWith('/admin') || pathname?.startsWith('/pharmacy') || pathname?.startsWith('/rider')) {
    return null;
  }

  return (
    <footer id="contact" className="bg-card border-t border-primary/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SwasthRoute
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              India's fastest emergency medicine delivery network. Saving lives, one delivery at a time.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/20 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="#for-pharmacies" className="text-muted-foreground hover:text-primary transition-colors">For Pharmacies</Link></li>
              <li><Link href="#emergency" className="text-muted-foreground hover:text-primary transition-colors">Emergency Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Safety Guide</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Partner FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">support@swasthroute.com</span>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">+918690896522</span>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/5 text-center">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} SwasthRoute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
