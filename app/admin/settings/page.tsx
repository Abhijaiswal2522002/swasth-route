'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Lock, Bell, CreditCard } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage platform configuration</p>
      </div>

      {/* Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Commission & Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Commission Rate (%)</label>
              <input
                type="number"
                defaultValue="15"
                className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">Applied to all orders</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Charge (₹)</label>
              <input
                type="number"
                defaultValue="50"
                className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">Charged to users</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Emergency Fee (₹)</label>
              <input
                type="number"
                defaultValue="100"
                className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">For orders after 10 PM</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Subscription Price (₹/month)</label>
              <input
                type="number"
                defaultValue="499"
                className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">For pharmacy subscriptions</p>
            </div>
          </div>
          <Button className="w-full">Save Configuration</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Order notifications</label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">User feedback alerts</label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pharmacy registration requests</label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Daily analytics report</label>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </div>
          <Button className="w-full">Update Preferences</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Admin Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Enable Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View Active Admin Sessions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Audit Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Platform Name</label>
            <input
              type="text"
              defaultValue="SwasthRoute"
              className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Support Email</label>
            <input
              type="email"
              defaultValue="support@swasthroute.com"
              className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Support Phone</label>
            <input
              type="tel"
              defaultValue="+91 1234567890"
              className="w-full mt-2 px-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
            />
          </div>
          <Button className="w-full">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
