'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Briefcase, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ProfileAddressesTab({ user }: { user: any }) {
  const addresses = user?.addresses || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground">Manage your delivery locations</p>
        </div>
        <Button className="gap-2 rounded-xl font-bold shadow-md shadow-primary/10">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.length > 0 ? addresses.map((addr: any, i: number) => (
          <Card key={i} className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl ${addr.isDefault ? 'border-primary shadow-lg shadow-primary/5 bg-primary/[0.02]' : 'border-gray-100 hover:border-primary/20 hover:shadow-md'}`}>
            {addr.isDefault && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                  DEFAULT
                </div>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex gap-5">
                <div className="mt-1">
                  {addr.label?.toLowerCase() === 'home' ? (
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100"><Home className="w-6 h-6" /></div>
                  ) : addr.label?.toLowerCase() === 'work' ? (
                    <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 border border-orange-100"><Briefcase className="w-6 h-6" /></div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 border border-gray-100"><MapPin className="w-6 h-6" /></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 capitalize">{addr.label}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white border-transparent">
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-1 border-gray-100 shadow-xl">
                        <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg py-2">
                          <Edit2 className="w-4 h-4" /> Edit Address
                        </DropdownMenuItem>
                        {!addr.isDefault && (
                          <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg py-2">
                            <MapPin className="w-4 h-4" /> Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg py-2">
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2 font-medium max-w-[90%]">
                    {addr.street}<br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No addresses saved</h3>
            <p className="text-sm text-gray-500 mb-6">Add your delivery address to get started.</p>
            <Button className="rounded-xl font-bold px-8">Add First Address</Button>
          </div>
        )}
      </div>
    </div>
  );
}
