'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Camera, Receipt, User, Phone, Save, Printer, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BarcodeScanner from '@/components/pharmacy/BarcodeScanner';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import { useAuth } from '@/lib/hooks/useAuth';

interface Medicine {
  _id: string;
  name: string;
  price: number;
  barcode?: string;
}

interface CartItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMobileScannerOpen, setIsMobileScannerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);

  // Mobile Scanner Setup
  const roomId = user?._id ? `billing-${user._id}` : null;
  const mobileScannerUrl = typeof window !== 'undefined' && roomId 
    ? `${window.location.origin}/pharmacy/billing/scanner?roomId=${roomId}`
    : '';

  useEffect(() => {
    if (!roomId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    
    socket.on('connect', () => {
      socket.emit('join-room', roomId);
    });

    socket.on('barcode-scanned', ({ barcode }) => {
      handleBarcodeScan(barcode);
      toast.success('Mobile scan received!');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Global Hardware Scanner Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Barcode scanners type very fast. We check the time between keypresses.
      const now = Date.now();
      
      // If the gap is small (less than 50ms), it's likely a scanner
      const isFast = now - lastKeyTime < 50;
      setLastKeyTime(now);

      // Ignore modifiers
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 3) {
          // It's a barcode!
          handleBarcodeScan(barcodeBuffer);
          setBarcodeBuffer('');
          e.preventDefault();
        } else {
          setBarcodeBuffer('');
        }
      } else if (e.key.length === 1) {
        // Append to buffer if it's a character
        if (isFast || barcodeBuffer === '') {
          setBarcodeBuffer(prev => prev + e.key);
        } else {
          // Reset buffer if typing is slow (manual keyboard entry)
          setBarcodeBuffer(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [barcodeBuffer, lastKeyTime]);

  // Manual search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const response = await fetch(`/api/medicines?search=${searchQuery}`);
          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToCart = (medicine: Medicine, inventoryPrice?: number) => {
    const price = inventoryPrice || medicine.price || 0;
    const existingItem = cart.find((item) => item.medicineId === medicine._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.medicineId === medicine._id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * price }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          medicineId: medicine._id,
          name: medicine.name,
          quantity: 1,
          price: price,
          total: price,
        },
      ]);
    }
    toast.success(`${medicine.name} added to cart`);
  };

  const updateQuantity = (medicineId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.medicineId === medicineId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/invoices/barcode/${barcode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const { medicine, inventory } = await response.json();
        addToCart(medicine, inventory?.price);
        setIsScannerOpen(false);
        toast.success(`Scanned: ${medicine.name}`);
      } else {
        toast.error('Medicine not found with this barcode');
      }
    } catch (error) {
      toast.error('Error scanning barcode');
    }
  };

  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subTotal * 0.12; // Assuming 12% GST
  const totalAmount = subTotal + tax;

  const generateInvoice = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: cart,
          subTotal,
          tax,
          discount: 0,
          totalAmount,
          paymentMethod: 'Cash',
          paymentStatus: 'Paid',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Invoice generated successfully!');
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        // Optional: Trigger print view or redirect to invoice page
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate invoice');
      }
    } catch (error) {
      toast.error('Error connecting to server');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="w-8 h-8 text-primary" />
            Pharmacy Billing & POS
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tip: You can use a hardware scanner anytime without clicking anything.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isMobileScannerOpen} onOpenChange={setIsMobileScannerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/50 text-primary">
                <Smartphone className="w-4 h-4" />
                Mobile Sync
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Use Mobile as Scanner</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 p-6">
                <div className="bg-white p-4 rounded-xl shadow-inner border">
                  <QRCodeCanvas value={mobileScannerUrl} size={200} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    Scan with your <b>Phone Camera</b> (not GPay) or open the link below on your phone.
                  </p>
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                    <div className="flex-1 text-xs font-mono truncate text-gray-600">
                      {mobileScannerUrl}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(mobileScannerUrl);
                        toast.success('Link copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="w-full p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-[11px] text-yellow-800 leading-tight">
                    <b>Note:</b> Both devices must be on the same Wi-Fi. If you are on "localhost", use your laptop's IP address (e.g., 192.168.x.x) so your phone can connect.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                Laptop Camera
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Medicine Barcode</DialogTitle>
              </DialogHeader>
              <BarcodeScanner onScanSuccess={handleBarcodeScan} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Cart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Selection</CardTitle>
              <CardDescription>Search for medicines to add to the bill</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by medicine name, manufacturer..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-md overflow-hidden bg-white shadow-sm absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                  {searchResults.map((med) => (
                    <div
                      key={med._id}
                      className="p-3 hover:bg-gray-50 flex justify-between items-center border-b last:border-0 cursor-pointer"
                      onClick={() => {
                        addToCart(med);
                        setSearchQuery('');
                      }}
                    >
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-gray-500">{med.barcode || 'No barcode'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-primary">₹{med.price || 0}</span>
                        <Button size="sm" variant="ghost">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Cart is empty. Scan or search for items.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item) => (
                        <TableRow key={item.medicineId}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.medicineId, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-4 text-center">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.medicineId, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">₹{item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 h-8 w-8"
                              onClick={() => removeFromCart(item.medicineId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer & Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" /> Customer Name
                </label>
                <Input
                  placeholder="Enter name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Customer Phone
                </label>
                <Input
                  placeholder="Enter phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-2 border-primary/10">
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (GST 12%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full h-12 text-lg font-semibold mt-4" 
                onClick={generateInvoice}
                disabled={isProcessing || cart.length === 0}
              >
                {isProcessing ? 'Processing...' : 'Generate Invoice'}
                {!isProcessing && <Save className="w-5 h-5 ml-2" />}
              </Button>
              <Button variant="outline" className="w-full">
                <Printer className="w-4 h-4 mr-2" />
                Print Bill
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
