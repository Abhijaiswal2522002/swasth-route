'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Marker } from 'react-map-gl';
import { Bike } from 'lucide-react';

interface SmoothMarkerProps {
  latitude: number;
  longitude: number;
  id: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function SmoothMarker({ latitude, longitude, id, color = "text-primary", icon }: SmoothMarkerProps) {
  const [coords, setCoords] = useState({ lat: latitude, lng: longitude });
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startCoordsRef = useRef({ lat: latitude, lng: longitude });
  const targetCoordsRef = useRef({ lat: latitude, lng: longitude });

  const duration = 2000; // Animation duration in ms

  useEffect(() => {
    // When target changes, start animation from current animated position to new target
    startCoordsRef.current = coords;
    targetCoordsRef.current = { lat: latitude, lng: longitude };
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeInOutCubic for "antigravity-like" smoothness)
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentLat = startCoordsRef.current.lat + (targetCoordsRef.current.lat - startCoordsRef.current.lat) * ease;
      const currentLng = startCoordsRef.current.lng + (targetCoordsRef.current.lng - startCoordsRef.current.lng) * ease;

      setCoords({ lat: currentLat, lng: currentLng });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [latitude, longitude]);

  return (
    <Marker latitude={coords.lat} longitude={coords.lng} anchor="bottom">
      <div className={`transition-all duration-300 drop-shadow-lg`}>
        {icon || (
          <div className="bg-white dark:bg-zinc-900 p-2 rounded-full border-2 border-primary shadow-xl">
             <Bike className={`w-6 h-6 ${color}`} />
          </div>
        )}
      </div>
    </Marker>
  );
}
