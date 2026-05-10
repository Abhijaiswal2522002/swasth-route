'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getCaptcha, CaptchaData } from '@/lib/api';
import { useEffect, Suspense } from 'react';
import { RefreshCcw, MapPin, Loader2, Bike, User, Phone, Mail, Lock, Shield, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { reverseGeocode } from '@/lib/locationUtils';
import { useSearchParams } from 'next/navigation';

import GuestRoute from '@/components/auth/GuestRoute';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, pharmacySignup, riderSignup, loading, error, clearError } = useAuth();
  const { location: geoPerm, loading: geoLoading, error: geoError } = useGeolocation();
  
  // Initialize role and step from URL if present
  const urlRole = searchParams.get('role');
  const [step, setStep] = useState<'selection' | 'form'>(urlRole ? 'form' : 'selection');
  const [role, setRole] = useState<'user' | 'pharmacy' | 'rider'>((urlRole as any) || 'user');
  const [isDetectingAddress, setIsDetectingAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    licenseNumber: '',
    vehicleType: 'bike',
    vehicleNumber: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');

  const fetchCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptcha(data);
    } catch (err) {
      console.error('Failed to fetch CAPTCHA:', err);
    }
  };

  useEffect(() => {
    if (step === 'form' && role === 'pharmacy') {
      fetchCaptcha();
    }
  }, [step, role]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setLocalError('Name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }

    // Role specific validation
    if (role === 'pharmacy') {
      if (!formData.address.trim()) {
        setLocalError('Pharmacy Address is required');
        return false;
      }
      if (!formData.city.trim()) {
        setLocalError('City is required');
        return false;
      }
      if (!formData.licenseNumber.trim()) {
        setLocalError('Pharmacy License Number is required');
        return false;
      }
      if (!geoPerm) {
        setLocalError('Location permission is required for pharmacies');
        return false;
      }
      if (!captchaInput.trim()) {
        setLocalError('Please complete the CAPTCHA');
        return false;
      }
    }

    if (role === 'rider') {
      if (!formData.vehicleType) {
        setLocalError('Vehicle Type is required');
        return false;
      }
      if (!formData.vehicleNumber.trim()) {
        setLocalError('Vehicle Number is required');
        return false;
      }
    }

    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setLocalError('Enter a valid Indian phone number');
      return false;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let response;
      if (role === 'user') {
        response = await signup(formData.name, formData.phone.replace(/\D/g, ''), formData.email, formData.password);
      } else if (role === 'rider') {
        const coords = geoPerm || { latitude: 0, longitude: 0 };
        response = await riderSignup(
          formData.name,
          formData.phone.replace(/\D/g, ''),
          formData.email,
          formData.password,
          formData.vehicleType,
          formData.vehicleNumber,
          coords.latitude,
          coords.longitude
        );
      } else {
        response = await pharmacySignup(
          formData.name,
          formData.phone.replace(/\D/g, ''),
          formData.email,
          formData.password,
          formData.address,
          formData.city,
          formData.licenseNumber,
          geoPerm?.latitude || 0,
          geoPerm?.longitude || 0,
          captcha?.id || '',
          captchaInput
        );
      }

      // Redirect to login with success message from backend
      router.push(`/auth/login?msg=${encodeURIComponent(response.message)}`);
    } catch (err) {
      console.error('[v0] Signup failed:', err);
    }
  };

  const renderContent = () => {
    if (step === 'selection') {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="backdrop-blur-xl border-white/10 bg-white/5 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="p-8 space-y-8">
              <div className="space-y-3 text-center">

                <h1 className="text-3xl font-black tracking-tight text-black">
                  Create <span className="text-primary">Account.</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium">Select your role to get started</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'user', title: 'Customer', desc: 'Order medicines & find pharmacies', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { id: 'pharmacy', title: 'Pharmacy', desc: 'Register store & fulfill orders', icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
                  { id: 'rider', title: 'Delivery Rider', desc: 'Join fleet & start earning', icon: Bike, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id as any);
                      setStep('form');
                      router.push(`/auth/signup?role=${r.id}`);
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all group text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl ${r.bg} ${r.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <r.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-black group-hover:text-primary transition-colors">{r.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{r.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline font-bold">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="backdrop-blur-xl border-white/10 bg-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="p-8 space-y-8">
            <div className="space-y-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep('selection');
                  router.push('/auth/signup');
                }}
                className="absolute left-4 top-4 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
              <h2 className="text-3xl font-black text-black">
                {role === 'user' ? 'Customer' : role === 'pharmacy' ? 'Pharmacy' : 'Rider'} <span className="text-primary">Sign Up</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                {role === 'user'
                  ? 'Join SwasthRoute for fast medicine delivery'
                  : role === 'pharmacy'
                    ? 'Register your pharmacy with the platform'
                    : 'Join as a delivery partner and start earning'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-300 ml-1">
                  {role === 'user' ? 'Full Name' : 'Pharmacy Name'} *
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={role === 'user' ? 'John Doe' : role === 'pharmacy' ? 'LifeCare Pharmacy' : 'Alex Rider'}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-black placeholder:text-slate-600 rounded-xl transition-all"
                  />
                </div>
              </div>

              {role === 'rider' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="vehicleType" className="text-sm font-medium">Vehicle Type *</label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData(p => ({ ...p, vehicleType: e.target.value }))}
                      className="w-full h-10 px-3 bg-input/50 border border-primary/20 rounded-md focus:border-primary outline-none text-sm"
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vehicleNumber" className="text-sm font-medium">License Plate *</label>
                    <Input
                      id="vehicleNumber"
                      name="vehicleNumber"
                      placeholder="MH 01 AB 1234"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className="bg-input/50 border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-bold text-slate-300 ml-1">
                  Phone Number *
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors z-10" />
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold z-10">
                    +91
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={10}
                    className="pl-20 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-black placeholder:text-slate-600 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-300 ml-1">
                  Email Address *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={role === 'user' ? 'john@example.com' : 'pharmacy@example.com'}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-black placeholder:text-slate-600 rounded-xl transition-all"
                  />
                </div>
              </div>

              {role === 'pharmacy' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-bold text-slate-300 ml-1">
                      Pharmacy Address *
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Complete pharmacy address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-slate-600 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-bold text-slate-300 ml-1">
                      City *
                    </label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="City name"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-slate-600 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="licenseNumber" className="text-sm font-bold text-slate-300 ml-1">
                      Pharmacy License Number *
                    </label>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        placeholder="e.g. LIC-12345678"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-slate-600 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-500 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${geoPerm ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : geoError ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                        Location Status
                      </span>
                      <span className={geoPerm ? 'text-green-500' : geoError ? 'text-red-500' : 'text-amber-500'}>
                        {geoPerm ? 'Verified' : geoError ? 'Permission Denied' : geoLoading ? 'Detecting...' : 'Pending'}
                      </span>
                    </div>
                    {geoPerm && (
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          GPS: {geoPerm.latitude.toFixed(6)}, {geoPerm.longitude.toFixed(6)}
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            setIsDetectingAddress(true);
                            try {
                              const addressData = await reverseGeocode(geoPerm.latitude, geoPerm.longitude);
                              if (addressData) {
                                setFormData(prev => ({
                                  ...prev,
                                  address: addressData.fullAddress,
                                  city: addressData.city || prev.city
                                }));
                              }
                            } catch (err) {
                              console.error('Failed to detect address:', err);
                            } finally {
                              setIsDetectingAddress(false);
                            }
                          }}
                          disabled={isDetectingAddress}
                          className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-none rounded-lg"
                        >
                          {isDetectingAddress ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCcw className="w-3 h-3" />
                          )}
                          Auto-Fill
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="captcha" className="text-sm font-bold text-slate-300 ml-1">
                      Security Check *
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1 flex items-center justify-between px-4 h-14 bg-white/5 border border-white/10 rounded-xl text-sm">
                        <span className="font-black text-primary tracking-widest text-lg italic">
                          {captcha ? captcha.question : '...'}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={fetchCaptcha}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-primary rounded-full"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        id="captcha"
                        type="text"
                        placeholder="?"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        disabled={loading}
                        className="w-24 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-black text-center font-bold text-lg rounded-xl transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-slate-300 ml-1">
                  Password *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-primary/50 text-black placeholder:text-slate-600 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-input/50 border-primary/20 focus:border-primary"
                />
              </div>

              {(localError || error) && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {localError || error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-4"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign Up <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-600">
                <span className="px-4 shadow-sm">Already have an account?</span>
              </div>
            </div>

            <Link href="/auth/login">
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-xl border-black/10 hover:bg-primary text-black font-bold transition-all"
              >
                Log In to Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  };

  return <GuestRoute>{renderContent()}</GuestRoute>;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
