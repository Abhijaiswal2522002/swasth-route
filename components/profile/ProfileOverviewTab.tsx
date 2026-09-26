'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, MapPin, ShoppingBag, Wallet, Edit3, Loader2 } from 'lucide-react';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';

interface ProfileOverviewTabProps {
  user: any;
  onNavigateTab?: (tab: string) => void;
  onProfileUpdated?: (updatedData?: any) => void;
}

export default function ProfileOverviewTab({ user, onNavigateTab, onProfileUpdated }: ProfileOverviewTabProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const primaryAddress = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const res = await ApiClient.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Profile updated successfully!');
        if (onProfileUpdated) {
          onProfileUpdated(res.data?.user || { name: name.trim(), phone: phone.trim() });
        }
        setIsEditDialogOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const totalSpent = (user?.allOrders || []).reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenEdit} 
              className="gap-1.5 rounded-xl font-semibold text-xs h-8"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-[#0b8a4f] flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">{user?.name || 'User'}</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mt-0.5">
                {user?.role === 'user' ? 'Customer Account' : user?.role || 'Verified User'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Phone Number</p>
                <p className="font-bold text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Email Address</p>
                <p className="font-bold text-gray-900 truncate max-w-[200px]">{user?.email || 'Not provided'}</p>
              </div>
            </div>
            <div 
              className="flex items-center gap-4 group sm:col-span-2 cursor-pointer hover:bg-muted/30 p-2 rounded-2xl transition-colors"
              onClick={() => onNavigateTab?.('addresses')}
            >
              <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Primary Address</p>
                <p className="font-bold text-gray-900">
                  {primaryAddress ? `${primaryAddress.street}, ${primaryAddress.city}` : 'No address set — Click to add'}
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleOpenEdit} 
            className="w-full mt-4 h-12 rounded-2xl font-bold shadow-md"
          >
            Edit Profile Details
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="border-gray-100 rounded-3xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
          onClick={() => onNavigateTab?.('orders')}
        >
          <CardContent className="pt-8 pb-8 text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-4xl font-black text-gray-900">{user?.allOrders?.length || 0}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
          </CardContent>
        </Card>
        
        <Card 
          className="border-gray-100 rounded-3xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
          onClick={() => onNavigateTab?.('orders')}
        >
          <CardContent className="pt-8 pb-8 text-center space-y-2">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-green-100">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-4xl font-black text-gray-900">₹{totalSpent.toFixed(0)}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile Details</DialogTitle>
            <DialogDescription>
              Update your account display name and contact phone number.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="overview-name">Full Name</Label>
              <Input
                id="overview-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="overview-phone">Phone Number</Label>
              <Input
                id="overview-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5 opacity-60">
              <Label htmlFor="overview-email">Email Address</Label>
              <Input
                id="overview-email"
                value={user?.email || ''}
                disabled
              />
              <p className="text-[11px] text-muted-foreground">Email is tied to your account login.</p>
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
