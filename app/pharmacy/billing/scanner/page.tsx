'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import BarcodeScanner from '@/components/pharmacy/BarcodeScanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MobileScannerPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setStatus('error');
      return;
    }

    const getSocketUrl = () => {
      let url = process.env.NEXT_PUBLIC_API_URL;

      if (!url || (url.includes('localhost') && window.location.hostname !== 'localhost')) {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        url = `${protocol}//${hostname}:3001`;
      }

      return url.replace(/\/api$/, '').replace(/\/$/, '');
    };

    const newSocket = io(getSocketUrl());

    newSocket.on('connect', () => {
      setStatus('connected');
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('connect_error', () => {
      setStatus('error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleScan = (barcode: string) => {
    if (socket && status === 'connected' && roomId) {
      socket.emit('scan-barcode', { roomId, barcode });
      setLastScanned(barcode);
      // Vibration feedback for mobile
      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }

      // Clear last scanned after 2 seconds
      setTimeout(() => setLastScanned(null), 2000);
    }
  };

  if (status === 'error' || !roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle>Connection Error</CardTitle>
            <CardDescription>
              Invalid session or unable to connect to the server. Please scan the QR code again from your laptop.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 space-y-6">
      <div className="w-full max-w-md flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="font-medium text-gray-700">
            {status === 'connected' ? 'Linked to Laptop' : 'Connecting...'}
          </span>
        </div>
        <Smartphone className="w-5 h-5 text-gray-400" />
      </div>

      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mobile Barcode Scanner</CardTitle>
          <CardDescription>Scanning results will appear on your laptop in real-time.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <BarcodeScanner onScanSuccess={handleScan} />
        </CardContent>
      </Card>

      {lastScanned && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <Badge className="bg-green-500 text-white px-4 py-2 text-lg animate-bounce flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Sent: {lastScanned}
          </Badge>
        </div>
      )}
    </div>
  );
}
