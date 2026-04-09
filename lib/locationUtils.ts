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
 * Reverse geocodes coordinates into a human-readable address using Geoapify API.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<AddressComponents | null> {
  try {
    const token = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!token) {
      console.warn('Geoapify token missing, falling back to Mapbox if available');
      // Optional fallback to Mapbox if desired, but user asked for Geoapify
      return reverseGeocodeMapbox(lat, lng);
    }

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${token}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const properties = data.features[0].properties;
      return {
        street: properties.street || properties.formatted.split(',')[0],
        city: properties.city || properties.municipality || '',
        state: properties.state || '',
        pincode: properties.postcode || '',
        fullAddress: properties.formatted,
      };
    }
  } catch (error) {
    console.error('Error reverse geocoding with Geoapify:', error);
  }
  return null;
}

/**
 * Fallback Mapbox reverse geocoding
 */
async function reverseGeocodeMapbox(lat: number, lng: number): Promise<AddressComponents | null> {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return null;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`
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

      feature.context?.forEach((ctx: any) => {
        if (ctx.id.startsWith('place')) address.city = ctx.text;
        if (ctx.id.startsWith('region')) address.state = ctx.text;
        if (ctx.id.startsWith('postcode')) address.pincode = ctx.text;
      });

      return address;
    }
  } catch (error) {
    console.error('Error reverse geocoding with Mapbox:', error);
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
