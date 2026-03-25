'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Store, User2, Mail, Phone, MapPin, FileText,
  Clock, Truck, IndianRupee, ShieldCheck, LogOut,
  UploadCloud, ToggleLeft, ToggleRight
} from 'lucide-react';

const tabs = [
  { id: 'basic',    label: 'Basic Info',   icon: Store },
  { id: 'location', label: 'Location',     icon: MapPin },
  { id: 'license',  label: 'License',      icon: FileText },
  { id: 'hours',    label: 'Hours',        icon: Clock },
  { id: 'delivery', label: 'Delivery',     icon: Truck },
  { id: 'earnings', label: 'Earnings',     icon: IndianRupee },
  { id: 'security', label: 'Security',     icon: ShieldCheck },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-600 mb-1.5">{children}</label>;
}

function Section({ title, children, onSave }: { title: string; children: React.ReactNode; onSave?: () => void }) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">{title}</h3>
      {children}
      {onSave && (
        <Button className="w-full sm:w-auto mt-2">Save Changes</Button>
      )}
    </div>
  );
}

export default function PharmacySettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [isOpen, setIsOpen] = useState(true);
  const [deliveryType, setDeliveryType] = useState<'self' | 'platform'>('platform');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your shop details, hours, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border text-gray-600 hover:bg-gray-50 hover:border-primary/30'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-5 sm:p-7">

          {/* BASIC INFO */}
          {activeTab === 'basic' && (
            <Section title="🏪 Basic Information" onSave={() => {}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Shop Name</FieldLabel>
                  <div className="relative">
                    <Store className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input defaultValue={user?.name || 'ABC Medical Store'} className="pl-9" placeholder="Shop name" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Owner Name</FieldLabel>
                  <div className="relative">
                    <User2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input defaultValue="Ramesh Kumar" className="pl-9" placeholder="Owner full name" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input type="email" defaultValue={user?.email || 'pharmacy@example.com'} className="pl-9" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Phone Number</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input type="tel" defaultValue="+91 9876543210" className="pl-9" />
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* LOCATION */}
          {activeTab === 'location' && (
            <Section title="📍 Location" onSave={() => {}}>
              <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                📌 Accurate location is used to show your pharmacy in nearby results and assign orders correctly.
              </p>
              <div>
                <FieldLabel>Full Address</FieldLabel>
                <textarea
                  defaultValue="123 Main Street, Andheri West, Mumbai, MH 400001"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm resize-none bg-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Latitude</FieldLabel>
                  <Input defaultValue="19.1360" placeholder="e.g. 19.0760" />
                </div>
                <div>
                  <FieldLabel>Longitude</FieldLabel>
                  <Input defaultValue="72.8264" placeholder="e.g. 72.8777" />
                </div>
              </div>
              <div className="h-36 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-sm text-gray-400 font-medium">
                🗺️ Map Preview (Integration Coming Soon)
              </div>
            </Section>
          )}

          {/* LICENSE */}
          {activeTab === 'license' && (
            <Section title="📄 License Details" onSave={() => {}}>
              <p className="text-sm text-gray-500 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                🔒 License details build trust with users and are required for platform approval.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>License Number</FieldLabel>
                  <Input defaultValue="AP/PHM/2023/0001" placeholder="MH/DRUG/2023/XXXXX" />
                </div>
                <div>
                  <FieldLabel>License Expiry Date</FieldLabel>
                  <Input type="date" defaultValue="2025-12-31" />
                </div>
              </div>
              <div>
                <FieldLabel>Upload License Document</FieldLabel>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all">
                  <UploadCloud className="w-10 h-10" />
                  <p className="text-sm font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs">PDF, JPG, PNG – Max 5 MB</p>
                </div>
              </div>
            </Section>
          )}

          {/* WORKING HOURS */}
          {activeTab === 'hours' && (
            <Section title="⏰ Working Hours" onSave={() => {}}>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Pharmacy Availability</p>
                  <p className="text-sm text-gray-500 mt-0.5">{isOpen ? 'You are currently open for orders' : 'You are currently closed'}</p>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
                  {isOpen
                    ? <ToggleRight className="w-12 h-12 text-primary" />
                    : <ToggleLeft className="w-12 h-12 text-gray-400" />
                  }
                </button>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Opening Time</FieldLabel>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div>
                  <FieldLabel>Closing Time</FieldLabel>
                  <Input type="time" defaultValue="22:00" />
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium">
                ✅ Current Hours: 8:00 AM – 10:00 PM
              </div>
            </Section>
          )}

          {/* DELIVERY */}
          {activeTab === 'delivery' && (
            <Section title="🚚 Delivery Settings" onSave={() => {}}>
              <div>
                <FieldLabel>Delivery Type</FieldLabel>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  {(['self', 'platform'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setDeliveryType(type)}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                        deliveryType === type
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {type === 'self' ? '🛵 Self Delivery' : '📦 Platform Delivery'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Delivery Radius (km)</FieldLabel>
                <div className="flex items-center gap-4">
                  <input type="range" min={1} max={20} defaultValue={5}
                    className="flex-1 accent-primary" />
                  <span className="text-sm font-bold text-primary w-12 text-right">5 km</span>
                </div>
              </div>
            </Section>
          )}

          {/* EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <Section title="💰 Earnings & Commission">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-xs text-gray-500 font-medium mb-1">Current Commission Rate</p>
                    <p className="text-2xl font-bold text-primary">10%</p>
                    <p className="text-xs text-gray-500 mt-1">Deducted from each completed order</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Earnings (This Month)</p>
                    <p className="text-2xl font-bold text-green-600">₹11,850</p>
                    <p className="text-xs text-gray-500 mt-1">After platform deduction</p>
                  </div>
                </div>
              </Section>
              <Section title="🏦 Bank Details (Coming Soon)" onSave={() => {}}>
                <div className="p-5 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center text-center gap-2">
                  <IndianRupee className="w-8 h-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Bank payout integration</p>
                  <p className="text-xs text-gray-400">Will be enabled once your account is verified.</p>
                </div>
              </Section>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <Section title="🔐 Security Settings">
              <div className="space-y-3">
                <div>
                  <FieldLabel>Current Password</FieldLabel>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div>
                  <FieldLabel>New Password</FieldLabel>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div>
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <Input type="password" placeholder="Confirm your new password" />
                </div>
                <Button className="w-full sm:w-auto">Update Password</Button>
              </div>

              <div className="border-t pt-6 mt-6">
                <p className="text-sm font-semibold text-gray-900 mb-4">Account Actions</p>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            </Section>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
