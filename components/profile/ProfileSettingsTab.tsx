import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, LogOut, MessageSquare, AlertCircle, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

export default function ProfileSettingsTab({ user }: { user: any }) {
  const { logout } = useAuth();
  const [pwdChanged, setPwdChanged] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChanged(true);
    setTimeout(() => setPwdChanged(false), 3000);
  };

  return (
    <div className="space-y-6">
      
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
