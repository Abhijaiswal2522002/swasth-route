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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
      // In production, the socket usually runs on the same origin as the frontend
      // or at a specific API domain. 
      const origin = window.location.origin;
      
      // Handle the case where the frontend and backend are on different ports locally
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      
      return origin;
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 space-y-6">
      <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-sm border space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
            <span className="font-medium text-gray-700">
              {status === 'connected' ? 'Linked to Laptop' : status === 'error' ? 'Connection Failed' : 'Connecting...'}
            </span>
          </div>
          <Smartphone className="w-5 h-5 text-gray-400" />
        </div>
        
        {status !== 'connected' && (
          <div className="text-[10px] text-gray-400 font-mono bg-gray-50 p-2 rounded border border-dashed">
            Target: {getSocketUrl() || 'Unknown'}
            <br />
            ID: {roomId || 'None'}
          </div>
        )}
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
