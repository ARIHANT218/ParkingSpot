import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

export default function ParkingDetails() {
  const { id } = useParams();
  const [parking, setParking] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch parking lot details
  const fetchParking = async () => {
    try {
      const res = await axios.get(`/parking`);
      const lot = res.data.find(p => p._id === id);
      setParking(lot);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParking();
  }, [id]);

  // Handle booking
  const handleBooking = async () => {
    try {
      const res = await axios.post(`/parking/book/${id}`, { startTime, endTime });
      setBooking(res.data);
      setMessage('Booking successful!');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Booking failed');
    }
  };

  if (!parking) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{parking.name}</h1>
      <p>{parking.city} - {parking.location}</p>
      <p>Price/hr: ₹{parking.pricePerHour}</p>
      <p>Available Slots: {parking.availableSlots}</p>
      <p>Rating: {parking.rating.toFixed(1)}</p>
      <p className="mt-2 font-semibold">Amenities:</p>
      <ul className="list-disc ml-6">
        {parking.amenities.map((a, index) => <li key={index}>{a}</li>)}
      </ul>

      <div className="mt-4">
        <h2 className="font-bold mb-2">Book Parking</h2>
        <label className="block mb-1">Start Time:</label>
        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="border p-2 rounded w-full mb-2" />
        <label className="block mb-1">End Time:</label>
        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="border p-2 rounded w-full mb-2" />
        <button onClick={handleBooking} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2">Book Now</button>
      </div>

      {message && <p className="mt-4 font-semibold">{message}</p>}

      {booking && booking.qrCode && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Your Booking QR Code</h2>
          <img src={booking.qrCode} alt="QR Code" className="border p-2 rounded" />
        </div>
      )}
    </div>
  );
}
