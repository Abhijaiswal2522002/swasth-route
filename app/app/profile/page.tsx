'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserCircle, Package, MapPin, Heart, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import ApiClient from '@/lib/api';

import ProfileOverviewTab from '@/components/profile/ProfileOverviewTab';
import ProfileOrdersTab from '@/components/profile/ProfileOrdersTab';
import ProfileAddressesTab from '@/components/profile/ProfileAddressesTab';
import ProfileHealthTab from '@/components/profile/ProfileHealthTab';
import ProfileSettingsTab from '@/components/profile/ProfileSettingsTab';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [profileRes, ordersRes] = await Promise.all([
        ApiClient.getUserProfile(),
        ApiClient.getUserOrders()
      ]);

      if (profileRes.error) {
        // If unauthorized/expired token
        if (profileRes.error.toLowerCase().includes('token') || profileRes.error.toLowerCase().includes('unauthorized')) {
          router.push('/auth/login');
          return;
        }
        setFetchError(profileRes.error);
      } else if (profileRes.data) {
        setProfile(profileRes.data);
        // Sync local storage user cache if available
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              localStorage.setItem('user', JSON.stringify({ ...parsed, ...profileRes.data }));
            } catch (e) {
              // Ignore cache parse error
            }
          }
        }
      }

      if (ordersRes.data) {
        setOrders(ordersRes.data as any[]);
      }
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      setFetchError(error.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router, fetchData]);

  // Update profile in local state immediately and re-fetch if needed
  const handleProfileUpdated = useCallback((updatedData?: any) => {
    if (updatedData) {
      setProfile((prev: any) => ({ ...prev, ...updatedData }));
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedData }));
          } catch (e) {
            // ignore
          }
        }
      }
    } else {
      fetchData();
    }
  }, [fetchData]);

  if (authLoading || (isLoading && !profile && !fetchError)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <RefreshCw className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Connecting to your profile...</p>
      </div>
    );
  }

  if (fetchError && !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Unable to load profile</h2>
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button onClick={fetchData} className="gap-2 rounded-xl font-bold">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  const extendedUser = { ...user, ...profile, allOrders: orders };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="mb-8 flex flex-col items-center sm:items-start text-center sm:text-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome back, {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg">
          Manage your account settings, track active emergency orders, and update your health preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="w-full sm:w-auto flex justify-start sm:inline-flex h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="overview" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <UserCircle className="w-4 h-4" /> <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Package className="w-4 h-4" /> <span className="hidden sm:inline">Orders</span>
              {orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.status?.toLowerCase())).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                  {orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.status?.toLowerCase())).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MapPin className="w-4 h-4" /> <span className="hidden sm:inline">Addresses</span>
              {profile?.addresses?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-muted-foreground/20 text-muted-foreground">
                  {profile.addresses.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Heart className="w-4 h-4" /> <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card border rounded-2xl p-1 shadow-sm">
          <TabsContent value="overview" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileOverviewTab 
              user={extendedUser} 
              onNavigateTab={setActiveTab}
              onProfileUpdated={handleProfileUpdated}
            />
          </TabsContent>
          
          <TabsContent value="orders" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileOrdersTab 
              user={extendedUser} 
              onRefresh={fetchData}
            />
          </TabsContent>
          
          <TabsContent value="addresses" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileAddressesTab 
              user={extendedUser} 
              onAddressUpdated={handleProfileUpdated}
            />
          </TabsContent>
          
          <TabsContent value="health" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileHealthTab 
              user={extendedUser} 
              onHealthUpdated={handleProfileUpdated}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileSettingsTab 
              user={extendedUser} 
              onProfileUpdated={handleProfileUpdated}
            />
          </TabsContent>
        </div>

      </Tabs>
      
    </div>
  );
}
