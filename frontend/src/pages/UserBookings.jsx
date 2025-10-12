import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/parking/my-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    try {
      await axios.delete(`/parking/cancel/${id}`);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (id) => {
    const newStart = prompt('Enter new start time (YYYY-MM-DDTHH:MM):');
    const newEnd = prompt('Enter new end time (YYYY-MM-DDTHH:MM):');
    if(newStart && newEnd){
      try {
        await axios.put(`/parking/edit/${id}`, { startTime: newStart, endTime: newEnd });
        fetchBookings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      {bookings.length === 0 && <p>No bookings yet.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map(b => (
          <div key={b._id} className="border p-4 rounded shadow">
            <h2 className="font-bold">{b.parkingLot.name}</h2>
            <p>Location: {b.parkingLot.location}, {b.parkingLot.city}</p>
            <p>Start: {new Date(b.startTime).toLocaleString()}</p>
            <p>End: {new Date(b.endTime).toLocaleString()}</p>
            <p>Price/hr: ₹{b.parkingLot.pricePerHour}</p>
            <div className="mt-2 space-x-2">
              <button onClick={() => handleEdit(b._id)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</button>
              <button onClick={() => handleCancel(b._id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Cancel</button>
            </div>
            {b.qrCode && <img src={b.qrCode} alt="QR Code" className="mt-2 border p-1 rounded w-32" />}
          </div>
        ))}
      </div>
    </div>
  );
}
