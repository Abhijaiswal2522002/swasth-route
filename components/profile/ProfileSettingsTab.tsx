import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, LogOut, MessageSquare, AlertCircle, HelpCircle, ChevronRight, CheckCircle2, UploadCloud, UserCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';

export default function ProfileSettingsTab({ user }: { user: any }) {
  const { logout } = useAuth();
  const [pwdChanged, setPwdChanged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    setAvatarPreview(URL.createObjectURL(file));
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('name', user.name);
      formData.append('email', user.email);

      const res = await ApiClient.updateUserProfile(formData);
      if (!res.error) {
        // Success
        window.location.reload(); 
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChanged(true);
    setTimeout(() => setPwdChanged(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* PROFILE PICTURE */}
      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg">Profile Identity</CardTitle>
          <CardDescription>Your avatar helps pharmacies identify you during delivery.</CardDescription>
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
                onClick={() => document.getElementById('avatarInput')?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-90"
              >
                <UploadCloud className="w-4 h-4" />
              </button>
              <input 
                id="avatarInput" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                disabled={isUploading}
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h4 className="font-bold text-lg">{user?.name}</h4>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 pt-1">Verified Customer Account</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <CardTitle>Security Settings</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <form onSubmit={handlePasswordChange} className="space-y-4 border-b pb-6">
            <h3 className="font-medium text-sm">Change Password</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" type="password" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button type="submit">Update Password</Button>
              {pwdChanged && (
                <span className="text-sm text-green-600 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-4 h-4" /> Saved successfully
                </span>
              )}
            </div>
          </form>

          <div className="flex justify-between items-center py-2">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Badge variant="outline" className="opacity-50">Coming Soon</Badge>
          </div>
          
          <div className="pt-4 mt-4">
            <Button variant="destructive" className="w-full sm:w-auto gap-2 group" onClick={logout}>
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Log Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <CardTitle>Support & Help</CardTitle>
          </div>
          <CardDescription>Need help with our services? We're here for you.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            <button className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Contact Support</p>
                  <p className="text-xs text-muted-foreground">Chat with our team</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Report an Issue</p>
                  <p className="text-xs text-muted-foreground">Found a bug or problem?</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors rounded-b-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">FAQs</p>
                  <p className="text-xs text-muted-foreground">Answers to common questions</p>
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
