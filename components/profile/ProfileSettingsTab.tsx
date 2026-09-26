'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, LogOut, MessageSquare, AlertCircle, HelpCircle, ChevronRight, CheckCircle2, UploadCloud, UserCircle2, Loader2, User, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProfileSettingsTabProps {
  user: any;
  onProfileUpdated?: (updatedData?: any) => void;
}

export default function ProfileSettingsTab({ user, onProfileUpdated }: ProfileSettingsTabProps) {
  const { logout } = useAuth();
  const router = useRouter();

  // Profile details state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Avatar state
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be less than 5MB');
      return;
    }

    // Preview locally
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      if (name) formData.append('name', name);
      if (user?.email) formData.append('email', user.email);

      const res = await ApiClient.updateUserProfile(formData);
      if (res.error) {
        toast.error(res.error);
        setAvatarPreview(user?.avatar || '');
      } else {
        toast.success('Avatar updated successfully!');
        const updatedAvatar = res.data?.user?.avatar || localUrl;
        setAvatarPreview(updatedAvatar);
        if (onProfileUpdated) {
          onProfileUpdated(res.data?.user || { avatar: updatedAvatar });
        }
      }
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      toast.error(err.message || 'Failed to upload avatar');
      setAvatarPreview(user?.avatar || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSavingDetails(true);
    try {
      const res = await ApiClient.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Personal details updated successfully!');
        if (onProfileUpdated) {
          onProfileUpdated(res.data?.user || { name: name.trim(), phone: phone.trim() });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update personal details');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('New password cannot be the same as your current password');
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await ApiClient.changePassword(currentPassword, newPassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Password changed successfully!');
        setPwdChanged(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdChanged(false), 4000);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error('Error logging out');
      router.push('/auth/login');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PROFILE PICTURE & IDENTITY */}
      <Card className="overflow-hidden border-primary/10 rounded-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg">Profile Identity</CardTitle>
          <CardDescription>Your avatar helps pharmacies and delivery riders recognize you.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-muted flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 className="w-12 h-12 text-muted-foreground" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => document.getElementById('avatarInput')?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-90"
                disabled={isUploading}
                title="Change Avatar"
              >
                <UploadCloud className="w-4 h-4" />
              </button>
              <input 
                id="avatarInput" 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleAvatarChange} 
                disabled={isUploading}
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h4 className="font-bold text-lg text-gray-900">{name || user?.name}</h4>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 pt-1">
                Verified Customer Account
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PERSONAL DETAILS */}
      <Card className="rounded-3xl border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>Update your contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="settings-name">Full Name</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-phone">Phone Number</Label>
                <Input
                  id="settings-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5 opacity-60">
              <Label htmlFor="settings-email">Email Address</Label>
              <Input
                id="settings-email"
                value={user?.email || ''}
                disabled
                className="rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">Email cannot be changed directly for security reasons.</p>
            </div>

            <Button type="submit" disabled={isSavingDetails} className="gap-2 rounded-xl font-bold">
              {isSavingDetails && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Details
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* SECURITY / CHANGE PASSWORD */}
      <Card className="border-primary/20 rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <CardTitle>Security & Password</CardTitle>
          </div>
          <CardDescription>Keep your account secure with a strong password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <form onSubmit={handlePasswordChange} className="space-y-4 border-b border-gray-100 pb-6">
            <h3 className="font-bold text-sm text-foreground">Change Password</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="current">Current Password</Label>
                <Input 
                  id="current" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new">New Password</Label>
                <Input 
                  id="new" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="rounded-xl"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isChangingPwd} className="gap-2 rounded-xl font-bold">
                {isChangingPwd && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </Button>
              {pwdChanged && (
                <span className="text-sm text-green-600 font-semibold flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-4 h-4" /> Password updated!
                </span>
              )}
            </div>
          </form>

          <div className="flex justify-between items-center py-2">
            <div>
              <h3 className="font-bold text-sm">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your emergency delivery account.</p>
            </div>
            <Badge variant="outline" className="opacity-60 rounded-lg">Coming Soon</Badge>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <Button variant="destructive" className="w-full sm:w-auto gap-2 group rounded-xl font-bold" onClick={handleLogout}>
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Log Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SUPPORT LINKS */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <CardTitle>Support & Help</CardTitle>
          </div>
          <CardDescription>Need help with our services? We're available 24/7 for emergency assistance.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            <button 
              type="button"
              onClick={() => router.push('/support')} 
              className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Contact Emergency Support</p>
                  <p className="text-xs text-muted-foreground">Chat or call our helpline</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button 
              type="button"
              onClick={() => router.push('/support')} 
              className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Report an Issue</p>
                  <p className="text-xs text-muted-foreground">Found a bug or order problem?</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
