'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import BarcodeScanner from '@/components/pharmacy/BarcodeScanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MobileScannerPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const socketUrlParam = searchParams.get('socketUrl');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const getSocketUrl = () => {
    // Priority 1: URL Parameter from QR code
    if (socketUrlParam) return socketUrlParam;

    if (typeof window !== 'undefined') {
      // Priority 2: Localhost check
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      
      // Priority 3: Fallback to same origin
      return window.location.origin;
    }
    return '';
  };

  useEffect(() => {
    if (!roomId) {
      setStatus('error');
      return;
    }

    const newSocket = io(getSocketUrl(), {
      transports: ['polling', 'websocket'],
      path: '/socket.io/',
      reconnectionAttempts: 5
    });

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

  const handleScan = useCallback((barcode: string) => {
    if (status !== 'connected') {
      toast.error('Not connected to laptop. Please wait...');
      return;
    }

    if (socket && roomId) {
      socket.emit('scan-barcode', { roomId, barcode });
      setLastScanned(barcode);

      // Vibration feedback for mobile
      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }

      // Clear last scanned after 2 seconds
      setTimeout(() => setLastScanned(null), 2000);
    }
  }, [status, socket, roomId]);

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
    <div className="min-h-screen bg-black flex flex-col items-center">
      {/* Slim Status Bar */}
      <div className="w-full bg-white/10 backdrop-blur-md p-3 flex justify-between items-center text-white z-20">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {status === 'connected' ? 'Sync Active' : 'Connecting...'}
          </span>
        </div>
        <Smartphone className="w-4 h-4 opacity-50" />
      </div>

      {/* Main Scanner Area */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        <BarcodeScanner onScanSuccess={handleScan} />
        
        {/* Overlay Instructions */}
        <div className="absolute top-10 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Center Barcode in Frame</p>
        </div>
      </div>

      {/* Scanned Badge Overlay */}
      {lastScanned && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-green-500 text-white px-8 py-4 rounded-3xl shadow-2xl animate-in zoom-in-50 duration-300 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-10 h-10" />
            <p className="font-black text-xl tracking-tighter">{lastScanned}</p>
            <p className="text-[10px] font-bold uppercase opacity-80">Sent to Laptop</p>
          </div>
        </div>
      )}
    </div>
  );
}
