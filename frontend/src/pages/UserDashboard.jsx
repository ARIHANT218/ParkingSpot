import { useEffect, useState } from 'react';
import axios from '../api/axios';
import ParkingCard from '../components/ParkingCard';

export default function UserDashboard() {
  const [parkingLots, setParkingLots] = useState([]);
  const [city, setCity] = useState('');

  const fetchParking = async () => {
    try {
      const res = await axios.get(`/parking${city ? '?city=' + city : ''}`);
      setParkingLots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParking();
  }, [city]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Parking Lots</h1>
      <input
        type="text"
        placeholder="Search by city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="border p-2 rounded mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {parkingLots.map(lot => <ParkingCard key={lot._id} lot={lot} />)}
      </div>
    </div>
  );
}
