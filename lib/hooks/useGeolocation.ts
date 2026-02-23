import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
  requestPermission: () => void;
}

export function useGeolocation(): GeolocationState {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-request geolocation on mount
    if ('geolocation' in navigator) {
      requestGeolocation();
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, []);

  const requestGeolocation = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
        // Store location in localStorage for later use
        localStorage.setItem(
          'userLocation',
          JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          })
        );
      },
      (err) => {
        console.error('[v0] Geolocation error:', err.message);
        setError(err.message);
        setLoading(false);

        // Try to load from localStorage as fallback
        const cached = localStorage.getItem('userLocation');
        if (cached) {
          try {
            const parsedLocation = JSON.parse(cached);
            setLocation({
              latitude: parsedLocation.latitude,
              longitude: parsedLocation.longitude,
              accuracy: 0,
            });
          } catch (e) {
            console.error('[v0] Failed to parse cached location:', e);
          }
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  return {
    location,
    error,
    loading,
    requestPermission: requestGeolocation,
  };
}
