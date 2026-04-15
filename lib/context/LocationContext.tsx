'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SelectedLocation {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  _id?: string; // Optional if it matches a saved user address
}

interface LocationContextType {
  selectedLocation: SelectedLocation | null;
  setSelectedLocation: (location: SelectedLocation) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'swasth_selected_location';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<SelectedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem(STORAGE_KEY);
    if (savedLocation) {
      try {
        setSelectedLocationState(JSON.parse(savedLocation));
      } catch (e) {
        console.error('Failed to parse saved location', e);
      }
    }
    setIsLoading(false);
  }, []);

  const setSelectedLocation = (location: SelectedLocation) => {
    setSelectedLocationState(location);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  };

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
