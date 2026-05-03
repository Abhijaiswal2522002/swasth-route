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
  const [customIp, setCustomIp] = useState('');

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

  const handleBarcodeScan = React.useCallback(async (barcode: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${backendUrl}/invoices/barcode/${barcode}`, {
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
  }, [cart]); // Added cart as dependency since addToCart depends on it

  // Mobile Scanner Setup
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const roomId = user?.id ? `billing-${user.id}` : null;

  const getBaseUrl = () => {
    if (typeof window === 'undefined') return '';
    
    // In production (non-localhost), ALWAYS use the current origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }

    // In development, allow Local IP override for phone testing on same Wi-Fi
    if (customIp) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${window.location.protocol}//${customIp}${port}`;
    }
    return window.location.origin;
  };

  const mobileScannerUrl = roomId
    ? `${getBaseUrl()}/pharmacy/billing/scanner?roomId=${roomId}&socketUrl=${encodeURIComponent(getSocketUrl())}`
    : '';

  useEffect(() => {
    if (!roomId) return;

    const getSocketUrl = () => {
      // Priority 1: Environment variable (stripping /api if present)
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envApiUrl && !envApiUrl.includes('localhost') && !envApiUrl.includes('127.0.0.1')) {
        return envApiUrl.replace(/\/api$/, '');
      }

      // Priority 2: If we are on localhost, talk directly to the backend on 3001
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:3001';
      }
      
      // Priority 3: Use the current origin (for same-origin tunnels/production)
      return typeof window !== 'undefined' ? window.location.origin : '';
    };

    const socket = io(getSocketUrl(), {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('✅ Billing Socket Connected');
      setIsSocketConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket Connection Error:', err.message);
      setIsSocketConnected(false);
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket Disconnected');
      setIsSocketConnected(false);
    });

    socket.on('barcode-scanned', ({ barcode }) => {
      handleBarcodeScan(barcode);
      toast.success('Mobile scan received!');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, handleBarcodeScan]);

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
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${backendUrl}/api/invoices`, {
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
          <div className="hidden md:block">
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
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 p-6">
                  <div className="bg-white p-4 rounded-xl shadow-inner border">
                    <QRCodeCanvas value={mobileScannerUrl} size={200} />
                  </div>
                  <div className="w-full p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-3">
                    <div className="text-xs font-semibold text-indigo-800 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</div>
                      Network Setup
                    </div>
                    <p className="text-[11px] text-indigo-700 leading-tight">
                      Connect your phone to the <b>same Wi-Fi</b> as this laptop.
                      {window.location.hostname === 'localhost' && (
                        <span> Enter your laptop's Local IP below to sync:</span>
                      )}
                    </p>

                    {window.location.hostname === 'localhost' && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Smartphone className="absolute left-2 top-2 w-3 h-3 text-indigo-400" />
                          <Input
                            placeholder="e.g. 192.168.1.5"
                            className="h-8 text-xs bg-white pl-7 border-indigo-200"
                            value={customIp}
                            onChange={(e) => setCustomIp(e.target.value)}
                          />
                        </div>
                        <Button size="sm" variant="secondary" className="h-8 text-xs shrink-0 bg-indigo-200 hover:bg-indigo-300 text-indigo-800" onClick={() => {
                          toast.info('Open CMD and type "ipconfig" to find your IPv4 Address');
                        }}>
                          Find IP
                        </Button>
                      </div>
                    )}

                    <div className="pt-2 border-t border-indigo-100">
                      <div className="text-xs font-semibold text-indigo-800 mb-1 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</div>
                        Open Scanner
                      </div>
                      <p className="text-[11px] text-indigo-700 leading-tight">
                        Scan the QR code with your <b>Phone Camera</b>.
                      </p>
                      <div className="mt-2 p-1.5 bg-white/50 rounded border border-indigo-100 text-[10px] font-mono text-indigo-600 break-all">
                        {mobileScannerUrl}
                      </div>
                    </div>
                  </div>

                  <div className={`w-full p-3 rounded-lg border ${window.location.protocol === 'https:' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                    <p className={`text-[10px] leading-tight ${window.location.protocol === 'https:' ? 'text-green-800' : 'text-amber-800'}`}>
                      <span className="font-bold">{window.location.protocol === 'https:' ? '✅ Secure Connection:' : '⚠️ Security Requirement:'}</span> 
                      {window.location.protocol === 'https:' 
                        ? ' You are on a secure (HTTPS) connection. The mobile camera will work perfectly.'
                        : ' Mobile browsers block cameras on plain HTTP links. Use a tunnel (ngrok/Cloudflare) or VS Code Port Forwarding to get an HTTPS link for testing.'}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                <span className="md:hidden">Scan Barcode</span>
                <span className="hidden md:inline">Laptop Camera</span>
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
