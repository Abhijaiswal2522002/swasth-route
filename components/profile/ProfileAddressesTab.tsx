'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapPin, Home, Briefcase, Plus, MoreVertical, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';

interface ProfileAddressesTabProps {
  user: any;
  onAddressUpdated?: (updatedData?: any) => void;
}

export default function ProfileAddressesTab({ user, onAddressUpdated }: ProfileAddressesTabProps) {
  const addresses = user?.addresses || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Form fields
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setLabel('Home');
    setStreet('');
    setCity('');
    setState('');
    setPincode('');
    setIsDefault(addresses.length === 0);
    setEditingAddressId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (addr: any) => {
    setEditingAddressId(addr._id);
    setLabel(addr.label || 'Home');
    setStreet(addr.street || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
    setIsDefault(Boolean(addr.isDefault));
    setIsDialogOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error('Please fill in all address fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const addressData = {
        label: label.trim() || 'Home',
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault,
      };

      let res;
      if (editingAddressId) {
        res = await ApiClient.updateAddress(editingAddressId, addressData);
      } else {
        res = await ApiClient.addAddress(addressData);
      }

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingAddressId ? 'Address updated successfully!' : 'Address added successfully!');
        setIsDialogOpen(false);
        resetForm();
        if (onAddressUpdated) {
          onAddressUpdated({ addresses: res.data?.addresses });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActiveActionId(id);
    try {
      const res = await ApiClient.setDefaultAddress(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Default address updated!');
        if (onAddressUpdated) {
          onAddressUpdated({ addresses: res.data?.addresses });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to set default address');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setActiveActionId(id);
    try {
      const res = await ApiClient.deleteAddress(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Address deleted successfully!');
        if (onAddressUpdated) {
          onAddressUpdated({ addresses: res.data?.addresses });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address');
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground">Manage your emergency and regular delivery locations</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 rounded-xl font-bold shadow-md shadow-primary/10">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((addr: any, i: number) => (
            <Card 
              key={addr._id || i} 
              className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl ${
                addr.isDefault 
                  ? 'border-primary shadow-lg shadow-primary/5 bg-primary/[0.02]' 
                  : 'border-gray-100 hover:border-primary/20 hover:shadow-md'
              }`}
            >
              {addr.isDefault && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1">
                    <Check className="w-3 h-3" /> DEFAULT
                  </div>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex gap-5">
                  <div className="mt-1">
                    {addr.label?.toLowerCase() === 'home' ? (
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
                        <Home className="w-6 h-6" />
                      </div>
                    ) : addr.label?.toLowerCase() === 'work' ? (
                      <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 border border-orange-100">
                        <Briefcase className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 border border-gray-100">
                        <MapPin className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900 capitalize">{addr.label}</h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full hover:bg-white border-transparent"
                            disabled={activeActionId === addr._id}
                          >
                            {activeActionId === addr._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-1 border-gray-100 shadow-xl">
                          <DropdownMenuItem 
                            onClick={() => openEditDialog(addr)} 
                            className="gap-2 cursor-pointer rounded-lg py-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit Address
                          </DropdownMenuItem>
                          {!addr.isDefault && (
                            <DropdownMenuItem 
                              onClick={() => handleSetDefault(addr._id)} 
                              className="gap-2 cursor-pointer rounded-lg py-2"
                            >
                              <MapPin className="w-4 h-4 text-primary" /> Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAddress(addr._id)} 
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg py-2"
                          >
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
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No addresses saved</h3>
            <p className="text-sm text-gray-500 mb-6">Add your delivery address to get faster emergency checkouts.</p>
            <Button onClick={openAddDialog} className="rounded-xl font-bold px-8">
              Add First Address
            </Button>
          </div>
        )}
      </div>

      {/* Add / Edit Address Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingAddressId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              Enter your complete delivery address for quick dispatch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
            {/* Label Selector */}
            <div className="space-y-1.5">
              <Label>Address Label</Label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={label === type ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-xl text-xs font-semibold"
                    onClick={() => setLabel(type)}
                  >
                    {type === 'Home' && <Home className="w-3.5 h-3.5 mr-1" />}
                    {type === 'Work' && <Briefcase className="w-3.5 h-3.5 mr-1" />}
                    {type === 'Other' && <MapPin className="w-3.5 h-3.5 mr-1" />}
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Street */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-street">Street Address / House / Flat No.</Label>
              <Input
                id="addr-street"
                placeholder="e.g., 204 Sunrise Apts, Park Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-city">City</Label>
                <Input
                  id="addr-city"
                  placeholder="e.g., Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-state">State</Label>
                <Input
                  id="addr-state"
                  placeholder="e.g., Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-pincode">Pincode</Label>
              <Input
                id="addr-pincode"
                placeholder="6-digit PIN"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>

            {/* Set as default checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="addr-default"
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="addr-default" className="text-sm font-normal cursor-pointer">
                Set as default delivery address
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
