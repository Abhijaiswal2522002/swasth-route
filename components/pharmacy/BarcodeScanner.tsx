'use client';

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'barcode-reader',
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
      false
    );

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Failed to clear scanner:', error);
        });
      }
    };
  }, [onScanSuccess, onScanError, fps, qrbox, aspectRatio]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
      <div id="barcode-reader" className="w-full"></div>
      <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
        Align the barcode within the frame to scan using your device camera.
      </div>
    </div>
  );
};

export default BarcodeScanner;
