'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Search, RefreshCw, Pill, Save, X, Check, AlertCircle, Camera, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ApiClient from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import BarcodeScanner from '@/components/pharmacy/BarcodeScanner';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';

export default function PharmacyMedicinesPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 0, price: 0 });

  // Add Medicine Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogResults, setCatalogResults] = useState<any[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [addForm, setAddForm] = useState({
    quantity: 0,
    price: 0,
    reorderLevel: 10
  });

  // Create New Medicine State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    manufacturer: '',
    category: 'Tablet',
    composition: '',
    description: '',
    barcode: ''
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'catalog' | 'manual'>('catalog');
  const [isMobileScannerOpen, setIsMobileScannerOpen] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [customIp, setCustomIp] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Device detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-detect IP on mount (only on localhost)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return;
    }

    const fetchNetworkInfo = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${backendUrl}/network-info`);
        if (response.ok) {
          const data = await response.json();
          if (data.localIp && data.localIp !== 'localhost') {
            setCustomIp(data.localIp);
          }
        }
      } catch (err) {
        console.error('Failed to fetch network info:', err);
      }
    };
    fetchNetworkInfo();
  }, []);

  const getBaseUrl = () => {
    if (typeof window === 'undefined') return '';
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    if (customIp) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${window.location.protocol}//${customIp}${port}`;
    }
    return window.location.origin;
  };

  const getSocketUrl = () => {
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envApiUrl && !envApiUrl.includes('localhost') && !envApiUrl.includes('127.0.0.1')) {
      return envApiUrl.replace(/\/api$/, '');
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:3001';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
  };

  const roomId = user?.id ? `billing-${user.id}` : null;
  const mobileScannerUrl = roomId
    ? `${getBaseUrl()}/pharmacy/billing/scanner?roomId=${roomId}&socketUrl=${encodeURIComponent(getSocketUrl())}`
    : '';

  useEffect(() => {
    if (!roomId) return;

    const socket = io(getSocketUrl(), {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      setIsSocketConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('connect_error', () => {
      setIsSocketConnected(false);
    });

    socket.on('barcode-scanned', ({ barcode }) => {
      handleScannerResult(barcode);
      toast.success('Mobile scan received!');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, scannerTarget, isAddDialogOpen]); // Re-connect if target or dialog status changes to ensure correct state capture

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

  const handleCatalogSearch = async (val: string) => {
    setCatalogSearch(val);
    if (val.length < 2) {
      setCatalogResults([]);
      return;
    }

    setIsSearchingCatalog(true);
    try {
      const res = await ApiClient.getMedicinesCatalog(val);
      if (res.data) {
        setCatalogResults(res.data);
      }
    } catch (error) {
      console.error('Error searching catalog:', error);
    } finally {
      setIsSearchingCatalog(false);
    }
  };

  const handleAddToInventory = async () => {
    if (!selectedMedicine) return;

    try {
      const res = await ApiClient.addMedicine(
        selectedMedicine.name,
        addForm.quantity,
        addForm.price,
        addForm.reorderLevel,
        selectedMedicine._id
      );

      if (!res.error) {
        toast.success(`${selectedMedicine.name} added to inventory`);
        setIsAddDialogOpen(false);
        resetAddForm();
        fetchInventory();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to add medicine");
    }
  };

  const handleCreateAndAdd = async () => {
    try {
      // 1. Add to global catalog
      const catalogRes = await ApiClient.addMedicineToCatalog(newMedicine);
      if (catalogRes.error) {
        toast.error(catalogRes.error);
        return;
      }

      const createdMedicine = (catalogRes.data as any)?.medicine;

      // 2. Add to local inventory
      const res = await ApiClient.addMedicine(
        newMedicine.name,
        addForm.quantity,
        addForm.price,
        addForm.reorderLevel,
        createdMedicine?._id
      );

      if (!res.error) {
        toast.success(`${newMedicine.name} created and added to inventory`);
        setIsAddDialogOpen(false);
        resetAddForm();
        fetchInventory();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error('Error creating and adding medicine:', error);
      toast.error("Failed to create medicine");
    }
  };

  const handleScannerResult = (barcode: string) => {
    if (scannerTarget === 'catalog') {
      handleCatalogSearch(barcode);
    } else {
      setNewMedicine({ ...newMedicine, barcode });
    }
    setIsScannerOpen(false);
    toast.success(`Scanned: ${barcode}`);
  };

  const resetAddForm = () => {
    setSelectedMedicine(null);
    setCatalogSearch('');
    setCatalogResults([]);
    setShowCreateForm(false);
    setAddForm({ quantity: 0, price: 0, reorderLevel: 10 });
    setNewMedicine({
      name: '',
      manufacturer: '',
      category: 'Tablet',
      composition: '',
      description: '',
      barcode: ''
    });
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
        toast.success("Inventory updated");
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

        <div className="flex gap-3">
          {isMobile ? (
            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl bg-primary text-white shadow-lg h-14 px-8 font-black uppercase tracking-widest text-xs">
                  <Camera className="w-5 h-5" />
                  Scan Barcode
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-0">
                <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                  <h3 className="font-bold uppercase tracking-widest text-[10px]">Stock Scanner</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsScannerOpen(false)} className="text-white hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="bg-black">
                  <BarcodeScanner onScanSuccess={handleScannerResult} />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isMobileScannerOpen} onOpenChange={setIsMobileScannerOpen}>
              <div className="flex items-center gap-3">
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all">
                    <Smartphone className="w-4 h-4" />
                    Mobile Sync
                  </Button>
                </DialogTrigger>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isSocketConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  {isSocketConnected ? 'Ready' : 'Offline'}
                </div>
              </div>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Use Mobile as Scanner</DialogTitle>
                  <DialogDescription>
                    Link your phone to scan medicine boxes directly into your inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 p-6">
                  <div className="bg-white p-4 rounded-xl shadow-inner border">
                    <QRCodeCanvas value={mobileScannerUrl} size={200} />
                  </div>
                  
                  <div className="w-full p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-3">
                    <p className="text-[11px] text-indigo-700 leading-tight">
                      1. Scan this QR code with your <b>Phone Camera</b>.<br />
                      2. Scanned items will appear in the <b>Add Medicine</b> dialog automatically.
                    </p>
                    <div className="p-1.5 bg-white/50 rounded border border-indigo-100 text-[10px] font-mono text-indigo-600 break-all">
                      {mobileScannerUrl}
                    </div>
                  </div>

                  <div className={`w-full p-3 rounded-lg border ${window.location.protocol === 'https:' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                    <p className={`text-[10px] leading-tight ${window.location.protocol === 'https:' ? 'text-green-800' : 'text-amber-800'}`}>
                      <span className="font-bold">{window.location.protocol === 'https:' ? '✅ Secure Connection:' : '⚠️ Security Requirement:'}</span> 
                      {window.location.protocol === 'https:' 
                        ? ' HTTPS detected. Mobile camera will work.'
                        : ' Mobile camera requires HTTPS or Tunnel.'}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetAddForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-3 rounded-[1.25rem] h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
              <Plus className="w-5 h-5" />
              Add New Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-gray-900">Add Medicine</DialogTitle>
              <DialogDescription className="font-medium text-gray-500">
                Search our master catalog or create a new entry.
              </DialogDescription>
            </DialogHeader>

            {!selectedMedicine && !showCreateForm && (
              <div className="space-y-4 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search master catalog..."
                      className="pl-9"
                      value={catalogSearch}
                      onChange={(e) => handleCatalogSearch(e.target.value)}
                    />
                  </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {isSearchingCatalog && (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  {catalogResults.map((med) => (
                    <button
                      key={med._id}
                      onClick={() => setSelectedMedicine(med)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-primary/5 hover:border-primary/20 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{med.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{med.manufacturer} • {med.category}</p>
                      </div>
                      <Plus className="h-4 w-4 text-gray-300 group-hover:text-primary" />
                    </button>
                  ))}
                  {!isSearchingCatalog && catalogSearch.length >= 2 && catalogResults.length === 0 && (
                    <div className="text-center py-6">
                      <AlertCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-bold mb-3">Medicine not found in catalog</p>
                      <Button
                        variant="ghost"
                        className="text-primary font-black text-xs uppercase tracking-widest"
                        onClick={() => {
                          setShowCreateForm(true);
                          setScannerTarget('manual');
                          setNewMedicine({ ...newMedicine, name: catalogSearch });
                        }}
                      >
                        Create New Entry
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedMedicine && (
              <div className="space-y-6 py-4 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Pill className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{selectedMedicine.name}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedMedicine.manufacturer}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedMedicine(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="font-black text-[10px] uppercase tracking-widest text-gray-400">Stock Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      className="rounded-xl font-bold"
                      value={addForm.quantity || ''}
                      onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="font-black text-[10px] uppercase tracking-widest text-gray-400">Unit Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      className="rounded-xl font-bold"
                      value={addForm.price || ''}
                      onChange={(e) => setAddForm({ ...addForm, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder" className="font-black text-[10px] uppercase tracking-widest text-gray-400">Low Stock Alert Level</Label>
                  <Input
                    id="reorder"
                    type="number"
                    placeholder="10"
                    className="rounded-xl font-bold"
                    value={addForm.reorderLevel || ''}
                    onChange={(e) => setAddForm({ ...addForm, reorderLevel: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <Button className="w-full rounded-xl h-12 font-black uppercase tracking-widest text-xs" onClick={handleAddToInventory}>
                  Add to Inventory
                </Button>
              </div>
            )}

            {showCreateForm && (
              <div className="space-y-4 py-4 animate-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Medicine Name</Label>
                    <Input
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      className="rounded-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Manufacturer</Label>
                    <Input
                      value={newMedicine.manufacturer}
                      onChange={(e) => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })}
                      className="rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-gray-400">Composition (Formula)</Label>
                  <Input
                    value={newMedicine.composition}
                    onChange={(e) => setNewMedicine({ ...newMedicine, composition: e.target.value })}
                    className="rounded-lg font-bold"
                    placeholder="e.g. Paracetamol 500mg"
                  />
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Barcode (Optional)</Label>
                    <Input
                      value={newMedicine.barcode}
                      onChange={(e) => setNewMedicine({ ...newMedicine, barcode: e.target.value })}
                      className="rounded-lg font-bold border-primary/20"
                      placeholder="Barcode will appear here when scanned by phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Initial Stock</Label>
                    <Input
                      type="number"
                      value={addForm.quantity || ''}
                      onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 0 })}
                      className="rounded-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Price (₹)</Label>
                    <Input
                      type="number"
                      value={addForm.price || ''}
                      onChange={(e) => setAddForm({ ...addForm, price: parseInt(e.target.value) || 0 })}
                      className="rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCreateForm(false)}>Back</Button>
                  <Button className="flex-[2] rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={handleCreateAndAdd}>
                    Create & Add
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
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
                      value={editForm.quantity || 0}
                      onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                      className="w-24 rounded-lg font-bold"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${medicine.quantity >= medicine.reorderLevel
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
                        value={editForm.price || 0}
                        onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
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
