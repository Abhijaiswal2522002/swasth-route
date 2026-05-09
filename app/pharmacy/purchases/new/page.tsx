'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Plus, Trash2, ShoppingCart, 
  Users, Calendar, Save, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    items: [{ medicineName: '', quantity: 1, purchasePrice: 0, batchNumber: '', expiryDate: '' }],
    tax: 0,
    amountPaid: 0,
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await ApiClient.getSuppliers();
      if (res.data) setSuppliers(res.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicineName: '', quantity: 1, purchasePrice: 0, batchNumber: '', expiryDate: '' }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const subTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  const totalAmount = subTotal + Number(formData.tax);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) return alert('Please select a supplier');
    if (formData.items.some(item => !item.medicineName || item.quantity <= 0)) {
      return alert('Please fill in all item details correctly');
    }

    setIsLoading(true);
    try {
      const res = await ApiClient.createPurchaseOrder(formData);
      if (!res.error) {
        router.push('/pharmacy/purchases');
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pharmacy/purchases">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-white border-b border-gray-100 p-8">
              <CardTitle className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {formData.items.map((item, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group">
                  <button 
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute -right-2 -top-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Medicine Name</label>
                      <Input 
                        required 
                        value={item.medicineName} 
                        onChange={e => updateItem(index, 'medicineName', e.target.value)}
                        placeholder="e.g. Paracetamol 500mg"
                        className="h-12 rounded-xl border-none shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">Batch No.</label>
                        <Input 
                          value={item.batchNumber} 
                          onChange={e => updateItem(index, 'batchNumber', e.target.value)}
                          placeholder="BT-123"
                          className="h-12 rounded-xl border-none shadow-sm uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">Expiry</label>
                        <Input 
                          type="date"
                          value={item.expiryDate} 
                          onChange={e => updateItem(index, 'expiryDate', e.target.value)}
                          className="h-12 rounded-xl border-none shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Quantity</label>
                      <Input 
                        type="number" 
                        required 
                        min="1"
                        value={item.quantity} 
                        onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                        className="h-12 rounded-xl border-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Purchase Price</label>
                      <Input 
                        type="number" 
                        required 
                        min="0"
                        value={item.purchasePrice} 
                        onChange={e => updateItem(index, 'purchasePrice', Number(e.target.value))}
                        className="h-12 rounded-xl border-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Total</label>
                      <div className="h-12 flex items-center px-4 font-bold text-gray-900">
                        ₹{(item.quantity * item.purchasePrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem} className="w-full h-14 rounded-2xl border-dashed border-2 text-primary border-primary/20 hover:bg-primary/5 font-bold">
                <Plus className="w-4 h-4 mr-2" /> Add More Medicines
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Supplier & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Select Supplier</label>
                  <select 
                    required
                    value={formData.supplierId}
                    onChange={e => setFormData({...formData, supplierId: e.target.value})}
                    className="w-full h-12 rounded-xl border-gray-100 bg-gray-50 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Choose Supplier...</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Tax (GST)</label>
                  <Input 
                    type="number" 
                    value={formData.tax} 
                    onChange={e => setFormData({...formData, tax: Number(e.target.value)})}
                    className="h-12 rounded-xl border-gray-100 font-bold"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Additional Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-4 rounded-xl border-gray-100 bg-gray-50 text-sm font-medium h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Reference, remarks, etc."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-primary text-white overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-primary-foreground/60 text-xs font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>₹{subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-primary-foreground/60 text-xs font-bold uppercase tracking-widest">
                    <span>Tax</span>
                    <span>₹{formData.tax.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-sm font-black uppercase tracking-[0.1em]">Grand Total</span>
                    <span className="text-3xl font-black">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black uppercase text-white/60 tracking-widest">Initial Payment (Advance)</label>
                  <Input 
                    type="number"
                    max={totalAmount}
                    value={formData.amountPaid}
                    onChange={e => setFormData({...formData, amountPaid: Number(e.target.value)})}
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 font-bold focus-visible:ring-white/20"
                  />
                  <p className="text-[10px] font-bold text-white/40">
                    Remaining: ₹{(totalAmount - formData.amountPaid).toLocaleString()}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 bg-white text-primary hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Place Order</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
