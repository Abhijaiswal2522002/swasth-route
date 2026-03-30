/**
 * Utility for location-related operations.
 */

export const REVERSE_GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
}

/**
 * Reverse geocodes coordinates into a human-readable address using Mapbox API.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<AddressComponents | null> {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token missing');
      return null;
    }

    const response = await fetch(
      `${REVERSE_GEOCODE_URL}${lng},${lat}.json?access_token=${token}&limit=1`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const address: AddressComponents = {
        street: feature.place_name,
        city: '',
        state: '',
        pincode: '',
        fullAddress: feature.place_name,
      };

      // Extract components from Mapbox context
      feature.context?.forEach((ctx: any) => {
        if (ctx.id.startsWith('place')) address.city = ctx.text;
        if (ctx.id.startsWith('region')) address.state = ctx.text;
        if (ctx.id.startsWith('postcode')) address.pincode = ctx.text;
      });

      return address;
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
  }
  return null;
}

/**
 * Gets current browser location if permission is granted.
 */
export function getCurrentLocation(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
}
