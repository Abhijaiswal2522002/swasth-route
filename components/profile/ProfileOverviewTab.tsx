import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, MapPin, ShoppingBag, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function ProfileOverviewTab({ user }: { user: any }) {
  const primaryAddress = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-[#0b8a4f] flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">{user?.name || 'User Name'}</h3>
              <p className="text-sm font-bold text-primary uppercase tracking-widest">Premium Member</p>
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
                <p className="font-bold text-gray-900 truncate max-w-[150px]">{user?.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group sm:col-span-2">
              <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Primary Address</p>
                <p className="font-bold text-gray-900">
                  {primaryAddress ? `${primaryAddress.street}, ${primaryAddress.city}` : 'No address set'}
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full mt-4 h-12 rounded-2xl font-black shadow-md">Edit Profile Details</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-gray-100 rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="pt-8 pb-8 text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-4xl font-black text-gray-900">{user?.allOrders?.length || 0}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100 rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="pt-8 pb-8 text-center space-y-2">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-green-100">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-4xl font-black text-gray-900">₹{user?.allOrders?.reduce((acc: number, o: any) => acc + (o.total || 0), 0) || 0}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
