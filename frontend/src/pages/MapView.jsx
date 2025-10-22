// src/pages/MapView.jsx
import { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import axios from "../api/axios";
import { useNavigate } from 'react-router-dom';

export default function MapView() {
  const [parkingLots, setParkingLots] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/parking').then(res => setParkingLots(res.data || [])).catch(console.error);
  }, []);

  const center = parkingLots.length
    ? { lat: parkingLots[0].latitude || 28.6139, lng: parkingLots[0].longitude || 77.2090 }
    : { lat: 28.6139, lng: 77.2090 };

  return (
    <div className="h-[80vh] w-full">
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={12}>
        {parkingLots.map(lot => (
          lot.latitude && lot.longitude ? (
            <Marker key={lot._id} position={{ lat: lot.latitude, lng: lot.longitude }} onClick={() => setSelected(lot)} />
          ) : null
        ))}

        {selected && (
          <InfoWindow position={{ lat: selected.latitude, lng: selected.longitude }} onCloseClick={() => setSelected(null)}>
            <div style={{ maxWidth: 220 }}>
              <h3 className="font-bold">{selected.name}</h3>
              <p className="text-sm">{selected.city}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => navigate(`/parking/${selected._id}`)} className="bg-sky-600 text-white px-3 py-1 rounded">View</button>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-gray-200">Directions</a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
