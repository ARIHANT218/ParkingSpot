
import React from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places']; // choose once, consistently

export default function MapLoader({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    // other options (language, region) optional but keep consistent everywhere
  });

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    return <div className="p-4 text-red-600">Error loading Google Maps: {String(loadError.message)}</div>;
  }
  if (!isLoaded) return <div className="p-4">Loading maps…</div>;

  // Provide maps to children once loaded
  return children;
}
