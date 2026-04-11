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
import { useEffect } from 'react';
import { RefreshCcw, MapPin, Loader2, Bike } from 'lucide-react';
import { reverseGeocode } from '@/lib/locationUtils';

import GuestRoute from '@/components/auth/GuestRoute';

export default function SignupPage() {
  const router = useRouter();
  const { signup, pharmacySignup, riderSignup, loading, error, clearError } = useAuth();
  const { location: geoPerm, loading: geoLoading, error: geoError } = useGeolocation();
  const [step, setStep] = useState<'selection' | 'form'>('selection');
  const [role, setRole] = useState<'user' | 'pharmacy' | 'rider'>('user');
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
        <Card className="backdrop-blur-sm border-primary/10 bg-card/80">
          <div className="p-8 space-y-8">
            <div className="space-y-2 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SwasthRoute
              </div>
              <p className="text-muted-foreground text-sm">Choose your account type</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => {
                  setRole('user');
                  setStep('form');
                }}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 group transition-all"
              >
                <span className="text-lg font-bold group-hover:text-primary">Customer</span>
                <span className="text-xs text-muted-foreground text-center line-clamp-2 px-2">
                  Order emergency medicines and discover nearby pharmacies
                </span>
              </Button>

              <Button
                onClick={() => {
                  setRole('pharmacy');
                  setStep('form');
                }}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 group transition-all"
              >
                <span className="text-lg font-bold group-hover:text-primary">Pharmacy</span>
                <span className="text-xs text-muted-foreground text-center line-clamp-2 px-2">
                  Register your store to fulfill emergency medicine requests
                </span>
              </Button>

              <Button
                onClick={() => {
                  setRole('rider');
                  setStep('form');
                }}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 group transition-all"
              >
                <span className="text-lg font-bold group-hover:text-primary">Delivery Rider</span>
                <span className="text-xs text-muted-foreground text-center line-clamp-2 px-2">
                  Join our delivery fleet and earn on every medicine delivery
                </span>
              </Button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="backdrop-blur-sm border-primary/10 bg-card/80">
        <div className="p-8 space-y-8">
          <div className="space-y-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('selection')}
              className="absolute left-4 top-4 text-muted-foreground hover:text-primary"
            >
              ← Back
            </Button>
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {role === 'user' ? 'Customer' : role === 'pharmacy' ? 'Pharmacy' : 'Rider'} Sign Up
            </div>
            <p className="text-muted-foreground text-sm">
              {role === 'user'
                ? 'Join SwasthRoute for fast medicine delivery'
                : role === 'pharmacy'
                  ? 'Register your pharmacy with the platform'
                  : 'Join as a delivery partner and start earning'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {role === 'user' ? 'Full Name' : 'Pharmacy Name'} *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={role === 'user' ? 'John Doe' : role === 'pharmacy' ? 'LifeCare Pharmacy' : 'Alex Rider'}
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="bg-input/50 border-primary/20 focus:border-primary"
              />
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
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-input/50 border border-primary/20 rounded-md text-muted-foreground text-sm">
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
                  className="bg-input/50 border-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={role === 'user' ? 'john@example.com' : 'pharmacy@example.com'}
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="bg-input/50 border-primary/20 focus:border-primary"
              />
            </div>

            {role === 'pharmacy' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Pharmacy Address *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Complete pharmacy address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-input/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City *
                  </label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City name"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-input/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="licenseNumber" className="text-sm font-medium">
                    Pharmacy License Number *
                  </label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    placeholder="e.g. LIC-12345678"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-input/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${geoPerm ? 'bg-green-500' : geoError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                      Location Status
                    </span>
                    <span className={geoPerm ? 'text-green-600' : geoError ? 'text-red-500' : 'text-yellow-600'}>
                      {geoPerm ? 'Detected' : geoError ? 'Failed' : geoLoading ? 'Finding...' : 'Waiting...'}
                    </span>
                  </div>
                  {geoPerm && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] text-muted-foreground truncate flex-1">
                        Lat: {geoPerm.latitude.toFixed(4)}, Lng: {geoPerm.longitude.toFixed(4)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
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
                        className="h-7 px-2 text-[10px] gap-1 rounded-md border-primary/20 hover:bg-primary/10"
                      >
                        {isDetectingAddress ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <MapPin className="w-3 h-3" />
                        )}
                        Detect Address
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="captcha" className="text-sm font-medium">
                    Security Check *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center justify-between px-3 bg-primary/5 border border-primary/20 rounded-md text-sm">
                      <span className="font-medium text-primary">
                        {captcha ? captcha.question : 'Loading...'}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={fetchCaptcha}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id="captcha"
                      type="text"
                      placeholder="Answer"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      disabled={loading}
                      className="w-24 bg-input/50 border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="bg-input/50 border-primary/20 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
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
              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card/80 text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          <Link href="/auth/login">
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/40"
            >
              Log In
            </Button>
          </Link>
        </div>
      </Card>
    );
  };

  return <GuestRoute>{renderContent()}</GuestRoute>;
}
