'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Search, RefreshCw, Pill, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ApiClient from '@/lib/api';
import { Input } from '@/components/ui/input';

export default function PharmacyMedicinesPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 0, price: 0 });

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.getPharmacyProfile();
      if (res.data) {
        setInventory((res.data as any).inventory || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setEditForm({ quantity: item.quantity, price: item.price });
  };

  const handleSave = async (medicineId: string) => {
    try {
      const res = await ApiClient.updateInventory(medicineId, editForm.quantity, editForm.price);
      if (!res.error) {
        setEditingId(null);
        fetchInventory();
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  };

  const filteredMedicines = inventory.filter((medicine) =>
    medicine.medicineName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (isLoading && inventory.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Updating inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Inventory Control</h1>
          <p className="text-gray-500 font-medium max-w-md">Manage your active stock levels, unit pricing, and reorder alerts.</p>
        </div>
        <Button className="gap-3 rounded-[1.25rem] h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5" />
          Add New Stock
        </Button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by medicine name, barcode, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] border-2 border-gray-100 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm text-lg font-bold"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/30">
              <th className="text-left p-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Medicine Name</th>
              <th className="text-left p-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Status & Stock</th>
              <th className="text-right p-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Unit Price</th>
              <th className="text-right p-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredMedicines.map((medicine) => (
              <tr key={medicine._id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-lg leading-none">{medicine.medicineName}</h4>
                      <p className="text-xs text-gray-400 mt-1.5 font-bold uppercase tracking-tighter">SKU: {medicine._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  {editingId === medicine._id ? (
                    <Input 
                      type="number" 
                      value={editForm.quantity} 
                      onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                      className="w-24 rounded-lg font-bold"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        medicine.quantity >= medicine.reorderLevel
                          ? 'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-100/50'
                          : 'bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-100/50'
                      }`}>
                        {medicine.quantity} UNITS
                      </span>
                      {medicine.quantity < medicine.reorderLevel && (
                        <div className="p-1 px-2 bg-red-600 text-white rounded text-[8px] font-bold animate-pulse">LOW</div>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-6 text-right">
                   {editingId === medicine._id ? (
                    <div className="flex items-center justify-end gap-2">
                       <span className="font-bold text-gray-400">₹</span>
                       <Input 
                        type="number" 
                        value={editForm.price} 
                        onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value)})}
                        className="w-24 rounded-lg font-bold text-right"
                      />
                    </div>
                  ) : (
                    <span className="font-black text-xl text-gray-900 tracking-tighter">₹{medicine.price}</span>
                  )}
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === medicine._id ? (
                      <>
                        <Button size="sm" variant="outline" className="rounded-xl font-bold" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button size="sm" className="rounded-xl font-bold gap-2" onClick={() => handleSave(medicine._id)}>
                          <Save className="w-4 h-4" /> Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="rounded-xl border-gray-100 hover:bg-white hover:text-primary hover:border-primary/30 h-10 w-10 p-0" onClick={() => handleEdit(medicine)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-xl border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-10 w-10 p-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMedicines.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
               <Search className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">No catalog entries match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
