'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function PharmacySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your pharmacy information</p>
      </div>

      {/* Pharmacy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pharmacy Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pharmacy Name</label>
              <input
                type="text"
                defaultValue="Apollo Pharmacy"
                className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">License Number</label>
                <input
                  type="text"
                  defaultValue="AP/PHM/2023/0001"
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">License Expiry</label>
                <input
                  type="date"
                  defaultValue="2025-12-31"
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
          <Button className="w-full">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+91 9876543210"
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  defaultValue="pharmacy@apollo.com"
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
          <Button className="w-full">Update Contact</Button>
        </CardContent>
      </Card>

      {/* Location & Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Business Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-2" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <textarea
                  defaultValue="123 Main Street, Mumbai, MH 400001"
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">Operating Hours</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="time"
                    defaultValue="08:00"
                    placeholder="Opening time"
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
                  />
                  <input
                    type="time"
                    defaultValue="22:00"
                    placeholder="Closing time"
                    className="px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
          <Button className="w-full">Update Location</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Active Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
