'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCircle, Package, MapPin, Heart, Settings } from 'lucide-react';

import ProfileOverviewTab from '@/components/profile/ProfileOverviewTab';
import ProfileOrdersTab from '@/components/profile/ProfileOrdersTab';
import ProfileAddressesTab from '@/components/profile/ProfileAddressesTab';
import ProfileHealthTab from '@/components/profile/ProfileHealthTab';
import ProfileSettingsTab from '@/components/profile/ProfileSettingsTab';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Loading your profile dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="mb-8 flex flex-col items-center sm:items-start text-center sm:text-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome back, {user.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg">
          Manage your account settings, track active emergency orders, and update your health preferences.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="w-full sm:w-auto flex justify-start sm:inline-flex h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="overview" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <UserCircle className="w-4 h-4" /> <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Package className="w-4 h-4" /> <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MapPin className="w-4 h-4" /> <span className="hidden sm:inline">Addresses</span>
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
            <ProfileOverviewTab user={user} />
          </TabsContent>
          
          <TabsContent value="orders" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileOrdersTab user={user} />
          </TabsContent>
          
          <TabsContent value="addresses" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileAddressesTab user={user} />
          </TabsContent>
          
          <TabsContent value="health" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileHealthTab user={user} />
          </TabsContent>
          
          <TabsContent value="settings" className="m-0 p-4 sm:p-6 outline-none focus-visible:ring-0">
            <ProfileSettingsTab user={user} />
          </TabsContent>
        </div>

      </Tabs>
      
    </div>
  );
}
