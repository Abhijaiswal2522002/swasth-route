'use client';

import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl, MapMouseEvent, ViewStateChangeEvent, MarkerDragEvent } from 'react-map-gl';
import { MapPin } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapBoxProps {
  markers?: any[];
  center?: { lat: number; lng: number };
  zoom?: number;
  isPicker?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  interactive?: boolean;
  className?: string;
}

export default function MapBox({ 
  markers = [], 
  center = { lat: 19.076, lng: 72.8777 }, // Default Mumbai
  zoom = 12,
  isPicker = false,
  onLocationSelect,
  height = '400px',
  interactive = true,
  className = ""
}: MapBoxProps) {
  const [viewState, setViewState] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: zoom
  });

  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [pickerLocation, setPickerLocation] = useState(center);

  // Update view state when center prop changes
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      latitude: center.lat,
      longitude: center.lng,
    }));
    setPickerLocation(center);
  }, [center.lat, center.lng]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (isPicker && onLocationSelect) {
      const { lng, lat } = e.lngLat;
      setPickerLocation({ lat, lng });
      onLocationSelect(lat, lng);
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center bg-muted/20 border border-dashed rounded-2xl ${className}`} style={{ height }}>
        <p className="text-sm text-muted-foreground font-medium italic">Mapbox token missing</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-border shadow-sm ${className}`} style={{ height }}>
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleMapClick}
        interactive={interactive}
        attributionControl={false}
      >
        <GeolocateControl position="top-left" trackUserLocation={true} />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />

        {/* Regular Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            latitude={marker.lat}
            longitude={marker.lng}
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              setSelectedMarker(marker);
            }}
          >
            <div className={`cursor-pointer transition-transform hover:scale-110 drop-shadow-md`}>
              <MapPin 
                className={`w-8 h-8 ${marker.color || 'text-primary'}`} 
                fill="currentColor" 
                fillOpacity={0.2} 
              />
            </div>
          </Marker>
        ))}

        {/* Picker Marker */}
        {isPicker && (
          <Marker
            latitude={pickerLocation.lat}
            longitude={pickerLocation.lng}
            anchor="bottom"
            draggable
            onDragEnd={(e: MarkerDragEvent) => {
              const { lng, lat } = e.lngLat;
              setPickerLocation({ lat, lng });
              if (onLocationSelect) onLocationSelect(lat, lng);
            }}
          >
            <div className="text-red-500 animate-pulse transition-transform active:scale-110">
              <MapPin className="w-10 h-10 drop-shadow-xl" fill="currentColor" fillOpacity={0.3} />
            </div>
          </Marker>
        )}

        {/* Selected Marker Popup */}
        {selectedMarker && (
          <Popup
            latitude={selectedMarker.lat}
            longitude={selectedMarker.lng}
            anchor="top"
            onClose={() => setSelectedMarker(null)}
            closeButton={true}
            closeOnClick={false}
            className="z-50"
            offset={10}
          >
            <div className="p-3 min-w-[180px] bg-card text-card-foreground">
              <h4 className="font-bold text-sm leading-tight">{selectedMarker.name}</h4>
              {selectedMarker.address && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {selectedMarker.address}
                </p>
              )}
              <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                 <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                   selectedMarker.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' 
                    : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                 }`}>
                   {selectedMarker.status || 'Verified'}
                 </span>
                 {selectedMarker.rating && (
                   <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                     ★ {selectedMarker.rating.toFixed(1)}
                   </span>
                 )}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
