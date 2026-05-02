'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { RefreshCw, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanSuccessRef = useRef(onScanSuccess);
  const scanErrorRef = useRef(onScanError);
  const [manualBarcode, setManualBarcode] = useState('');

  // Keep refs up to date
  useEffect(() => {
    scanSuccessRef.current = onScanSuccess;
    scanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    // Check for secure context
    const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
    if (!isSecure) {
      setError('CAMERA_UNAVAILABLE');
      return;
    }

    const html5QrCode = new Html5Qrcode('barcode-reader');
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const config = {
          fps: 20,
          qrbox: { width: 300, height: 200 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => scanSuccessRef.current(decodedText),
          (errorMessage) => scanErrorRef.current?.(errorMessage)
        );
        
        // Final check if still mounted
        if (html5QrCodeRef.current) {
          setIsStarted(true);
        }
      } catch (err: any) {
        console.error('Scanner start error:', err);
        setError(err?.message || 'Could not start camera. Please ensure permissions are granted.');
      }
    };

    startScanner();

    return () => {
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        if (scanner.isScanning) {
          scanner.stop()
            .then(() => {
              scanner.clear();
            })
            .catch(err => console.warn('Error stopping scanner:', err));
        }
        html5QrCodeRef.current = null;
      }
    };
  }, []); // Only run once on mount

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScanSuccess(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  if (error === 'CAMERA_UNAVAILABLE') {
    return (
      <div className="p-6 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Camera className="w-6 h-6 text-amber-600" />
          </div>
          <p className="font-bold">Camera Security Blocked</p>
        </div>
        <p className="text-sm opacity-90 leading-relaxed">
          Modern browsers only allow camera access on <b>HTTPS</b> or <b>localhost</b>. 
          You are currently using an insecure IP address.
        </p>
        
        <div className="pt-2 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Manual Entry Fallback</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter barcode manually..."
              className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm"
            >
              Send
            </button>
          </form>
        </div>

        <div className="text-[10px] bg-white/50 p-2 rounded-lg border border-amber-100">
          <b>Fix:</b> Use a secure tunnel like <b>ngrok</b> to test the camera on your phone.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center space-y-3">
        <Camera className="w-10 h-10 mx-auto text-red-300" />
        <p className="font-bold">Scanner Error</p>
        <p className="text-sm opacity-80">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold"
        >
          Retry / Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black relative aspect-square flex items-center justify-center">
      <div id="barcode-reader" className="w-full h-full"></div>
      
      {!isStarted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white gap-4 z-10">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold tracking-widest uppercase">Initializing Camera...</p>
        </div>
      )}

      {isStarted && (
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 m-8 rounded-xl ring-offset-black ring-4 ring-primary/20 animate-pulse flex items-center justify-center">
          {/* Laser Line Animation */}
          <div className="w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] absolute animate-[scan_2s_linear_infinite]" />
          
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
