'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Store, User2, Mail, Phone, MapPin, FileText,
  Clock, Truck, IndianRupee, ShieldCheck, LogOut,
  UploadCloud, ToggleLeft, ToggleRight, RefreshCw, Save,
  TrendingUp
} from 'lucide-react';
import ApiClient from '@/lib/api';
import MapBox from '@/components/MapBox';

const tabs = [
  { id: 'basic', label: 'Basic Info', icon: Store },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'license', label: 'License', icon: FileText },
  { id: 'hours', label: 'Hours', icon: Clock },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'earnings', label: 'Earnings', icon: IndianRupee },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{children}</label>;
}

function Section({ title, children, onSave, isSaving }: { title: string; children: React.ReactNode; onSave?: () => void; isSaving?: boolean }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
        {title}
      </h3>
      <div className="space-y-5">
        {children}
      </div>
      {onSave && (
        <Button
          className="w-full sm:w-auto mt-4 rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      )}
    </div>
  );
}

export default function PharmacySettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0 },
    licenseNumber: '',
    licenseExpiry: '',
    businessHours: { open: '08:00', close: '22:00' },
    isOpen: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.getPharmacyProfile();
      if (res.data) {
        const data = res.data as any;
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || { street: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0 },
          licenseNumber: data.licenseNumber || '',
          licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry).toISOString().split('T')[0] : '',
          businessHours: data.businessHours || { open: '08:00', close: '22:00' },
          isOpen: data.status === 'active'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        ...formData,
        latitude: formData.address.latitude,
        longitude: formData.address.longitude
      };
      const res = await ApiClient.updatePharmacyProfile(updateData);
      if (!res.error) {
        // Success notification or feedback
        fetchProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (authLoading || (isLoading && !profile)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Configuring shop profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 px-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Pharmacy Control</h1>
          <p className="text-gray-500 font-medium max-w-lg">Fine-tune your shop presence, operational hours, and regulatory compliance data.</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-xl px-4 py-1.5 h-max font-black text-[10px] uppercase tracking-widest">
          Role: Verified Pharmacy
        </Badge>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${active
                ? 'bg-primary text-white shadow-xl shadow-primary/20'
                : 'bg-white border-2 border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-gray-100 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 sm:p-12">

          {/* BASIC INFO */}
          {activeTab === 'basic' && (
            <Section title="🏪 Identity & Contact" onSave={handleSave} isSaving={isSaving}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                <div className="space-y-1">
                  <FieldLabel>Shop Commercial Name</FieldLabel>
                  <div className="relative group">
                    <Store className="absolute left-4 top-4 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-12 h-14 rounded-2xl border-gray-100 font-bold text-gray-900 focus-visible:ring-primary/10"
                      placeholder="e.g. Wellness Forever"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <FieldLabel>Verified Email</FieldLabel>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-14 rounded-2xl border-gray-100 font-bold text-gray-900"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <FieldLabel>Owner Support Hotline</FieldLabel>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-12 h-14 rounded-2xl border-gray-100 font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* LOCATION */}
          {activeTab === 'location' && (
            <Section title="📍 Geospatial Data" onSave={handleSave} isSaving={isSaving}>
              <div className="bg-primary/5 border border-primary/10 p-5 rounded-3xl flex gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><MapPin className="w-6 h-6" /></div>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Accurate coordinates ensure your pharmacy appears in the "Emergency" and "Nearby" search results correctly.
                </p>
              </div>
              <div className="space-y-6 mt-4">
                <div>
                  <FieldLabel>Business Street Address</FieldLabel>
                  <textarea
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                    className="w-full px-5 py-4 rounded-[1.5rem] border-2 border-gray-100 focus:outline-none focus:border-primary text-sm font-bold resize-none bg-white transition-all min-h-[100px]"
                    placeholder="Floor, Building, Street..."
                  />
                </div>
                <div className="space-y-4">
                  <FieldLabel>Interactive Map Picker</FieldLabel>
                  <MapBox
                    isPicker={true}
                    center={{
                      lat: formData.address.latitude || 19.076,
                      lng: formData.address.longitude || 72.8777
                    }}
                    onLocationSelect={(lat, lng) => {
                      setFormData({
                        ...formData,
                        address: { ...formData.address, latitude: lat, longitude: lng }
                      });
                    }}
                    height="350px"
                    className="border-primary/10 shadow-inner bg-muted/50"
                  />
                  <div className="flex justify-between items-center px-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Coordinates</p>
                      <p className="text-xs font-bold text-primary">
                        {formData.address?.latitude && formData.address?.longitude ? (
                          <p className="text-xs font-bold text-primary">
                            {formData.address.latitude.toFixed(6)}, {formData.address.longitude.toFixed(6)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">Location not selected</p>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude
                              }
                            });
                          });
                        }
                      }}
                    >
                      Use Current GPS
                    </Button>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* LICENSE */}
          {activeTab === 'license' && (
            <Section title="📄 Regulatory Compliance" onSave={handleSave} isSaving={isSaving}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                <div>
                  <FieldLabel>Drug License Registry ID</FieldLabel>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <Input
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="pl-12 h-14 rounded-2xl border-gray-100 font-bold text-gray-900 uppercase"
                      placeholder="MH/DRUG/XXXXX"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Certificate Expiry</FieldLabel>
                  <Input
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    className="h-14 rounded-2xl border-gray-100 font-bold text-gray-900"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Updated Proof of License</FieldLabel>
                <div className="border-3 border-dashed border-gray-50 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:text-primary transition-colors">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Digital Registry File</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">PDF OR HIGH-RES SCAN (MAX 10MB)</p>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* WORKING HOURS */}
          {activeTab === 'hours' && (
            <Section title="⏰ Operational Hours" onSave={handleSave} isSaving={isSaving}>
              <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                <div className="space-y-1">
                  <p className="text-lg font-black text-gray-900">Current Sales Status</p>
                  <p className="text-sm text-gray-500 font-medium">{formData.isOpen ? 'You are actively receiving orders' : 'Shop is currently dark'}</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                  className="focus:outline-none transition-transform active:scale-95"
                >
                  {formData.isOpen
                    ? <ToggleRight className="w-14 h-14 text-primary fill-primary/10" />
                    : <ToggleLeft className="w-14 h-14 text-gray-300" />
                  }
                </button>
              </div>
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <FieldLabel>Opening Protocols</FieldLabel>
                  <Input
                    type="time"
                    value={formData.businessHours.open}
                    onChange={(e) => setFormData({ ...formData, businessHours: { ...formData.businessHours, open: e.target.value } })}
                    className="h-14 rounded-2xl border-gray-100 font-black text-gray-900"
                  />
                </div>
                <div>
                  <FieldLabel>Closing Protocols</FieldLabel>
                  <Input
                    type="time"
                    value={formData.businessHours.close}
                    onChange={(e) => setFormData({ ...formData, businessHours: { ...formData.businessHours, close: e.target.value } })}
                    className="h-14 rounded-2xl border-gray-100 font-black text-gray-900"
                  />
                </div>
              </div>
            </Section>
          )}

          {/* EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-12">
              <Section title="💰 Financial Terms">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col justify-between h-48 relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] opacity-5"><TrendingUp className="w-32 h-32" /></div>
                    <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.2em] mb-1">Contracted Growth</p>
                    <div>
                      <p className="text-5xl font-black text-primary tracking-tighter">10%</p>
                      <p className="text-xs text-primary/50 font-bold mt-2 uppercase tracking-widest leading-relaxed">Platform Service Fee <br />per completed delivery</p>
                    </div>
                  </div>
                  <div className="p-8 bg-green-50 rounded-[2rem] border border-green-100 flex flex-col justify-between h-48">
                    <p className="text-[10px] text-green-600/60 font-black uppercase tracking-[0.2em] mb-1">Settled Monthly</p>
                    <div>
                      <p className="text-5xl font-black text-green-700 tracking-tighter">₹11,850</p>
                      <p className="text-xs text-green-600/50 font-bold mt-2 uppercase tracking-widest leading-relaxed">Net Liquidity <br />current billing cycle</p>
                    </div>
                  </div>
                </div>
              </Section>
              <Section title="🏦 Settlement Node">
                <div className="p-12 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-100 flex flex-col items-center text-center gap-4">
                  <div className="p-5 bg-white rounded-3xl shadow-sm text-gray-200"><IndianRupee className="w-10 h-10" /></div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-gray-900 tracking-tight">Financial Integration Looming</p>
                    <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">Bank payout nodes will be activated once your Drug License is re-verified by the admin panel.</p>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <Section title="🔐 Security Protocols">
              <div className="space-y-6 mt-4">
                <div>
                  <FieldLabel>Current Secret Phrase</FieldLabel>
                  <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-gray-100 font-bold" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>New Secret Phrase</FieldLabel>
                    <Input type="password" placeholder="New strong password" className="h-14 rounded-2xl border-gray-100 font-bold" />
                  </div>
                  <div>
                    <FieldLabel>Protocol Confirmation</FieldLabel>
                    <Input type="password" placeholder="Repeat new password" className="h-14 rounded-2xl border-gray-100 font-bold" />
                  </div>
                </div>
                <Button className="w-full sm:w-auto rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">Update Credentials</Button>
              </div>

              <div className="pt-10 border-t border-gray-50 mt-12">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Administrative Actions</p>
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-2 border-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" /> Terminate Active Session
                </Button>
              </div>
            </Section>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
