'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-primary/10 mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SwasthRoute
            </Link>
            <p className="text-sm text-muted-foreground">
              Fast and reliable emergency medicine delivery at your doorstep. Available 24/7 across India.
            </p>
            <div className="flex gap-3 pt-4">
              <a href="#" className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* User Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Pharmacies
                </Link>
              </li>
              <li>
                <Link href="/app/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/app/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/app/favorites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Saved Pharmacies
                </Link>
              </li>
              <li>
                <Link href="/app/track-order" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Pharmacy Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Pharmacies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pharmacy/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Join As Pharmacy
                </Link>
              </li>
              <li>
                <Link href="/pharmacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pharmacy/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Manage Orders
                </Link>
              </li>
              <li>
                <Link href="/pharmacy/earnings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  View Earnings
                </Link>
              </li>
              <li>
                <Link href="/pharmacy/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Call us</p>
                  <a href="tel:+919876543210" className="text-sm text-primary hover:underline">
                    +91 9876543210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email us</p>
                  <a href="mailto:support@swasthroute.com" className="text-sm text-primary hover:underline">
                    support@swasthroute.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="bg-foreground/5 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} SwasthRoute. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
