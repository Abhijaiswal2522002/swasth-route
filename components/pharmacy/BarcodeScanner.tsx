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

  useEffect(() => {
    // Check for secure context
    const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
    if (!isSecure) {
      setError('Camera access requires HTTPS or localhost. If using an IP address, please enable HTTPS.');
      return;
    }

    const html5QrCode = new Html5Qrcode('barcode-reader');
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps,
            qrbox,
            aspectRatio,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
            ],
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            if (onScanError) onScanError(errorMessage);
          }
        );
        setIsStarted(true);
      } catch (err: any) {
        console.error('Scanner start error:', err);
        setError(err?.message || 'Could not start camera. Please ensure permissions are granted.');
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError, fps, qrbox, aspectRatio]);

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
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 m-8 rounded-xl ring-offset-black ring-4 ring-primary/20 animate-pulse">
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
