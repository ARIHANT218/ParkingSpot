import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import BookingChat from '../components/BookingChat'; // adjust path if different

export default function ParkingDetails() {
  const { id } = useParams();
  const [parking, setParking] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const authToken = localStorage.getItem('token'); // adjust key if you store token under a different key

  // Fetch logged-in user (if token present)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authToken) return;
      try {
        const res = await axios.get('/users/me', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error('Failed to fetch current user', err);
        // If token invalid you may want to clear it:
        // localStorage.removeItem('token');
      }
    };
    fetchCurrentUser();
  }, [authToken]);

  // Fetch parking lot details (single lot by id if your API supports it)
  const fetchParking = async () => {
    try {
      // Try to fetch single parking if backend supports /parking/:id
      const res = await axios.get(`/parking/${id}`);
      setParking(res.data);
    } catch (err) {
      // Fallback: fetch all and find by id (keeps compatibility with earlier code)
      try {
        const res2 = await axios.get('/parking');
        const lot = Array.isArray(res2.data) ? res2.data.find(p => String(p._id) === String(id)) : null;
        setParking(lot);
      } catch (err2) {
        console.error('Error fetching parking', err2);
      }
    }
  };

  useEffect(() => {
    fetchParking();
    // reset booking/message when visiting a different parking
    setBooking(null);
    setMessage('');
  }, [id]);

  // validate times
  const isValidTimes = () => {
    if (!startTime || !endTime) return false;
    const s = new Date(startTime);
    const e = new Date(endTime);
    return s < e;
  };

  // Handle booking
  const handleBooking = async () => {
    if (!authToken) {
      setMessage('You must be logged in to book.');
      return;
    }
    if (!isValidTimes()) {
      setMessage('Please select valid start and end times (start < end).');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `/parking/book/${id}`,
        { startTime, endTime },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setBooking(res.data);
      setMessage('Booking successful!');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Booking failed';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // helper to check if current user is owner OR admin
  const isBookingParticipant = (bookingObj) => {
    if (!bookingObj || !currentUser) return false;
    const bookingUserId = bookingObj.user?._id || bookingObj.user; // could be populated user object or id
    return String(currentUser.id || currentUser._id || currentUser._id) === String(bookingUserId)
      || currentUser.role === 'admin';
  };

  if (!parking) return <p className="p-6">Loading parking details...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{parking.name}</h1>
      <p>{parking.city} - {parking.location}</p>
      <p>Price/hr: ₹{parking.pricePerHour ?? 'N/A'}</p>
      <p>Available Slots: {parking.availableSlots ?? 'N/A'}</p>
      <p>Rating: {parking.rating ? parking.rating.toFixed(1) : 'No ratings yet'}</p>

      {parking.latitude && parking.longitude && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${parking.latitude},${parking.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block bg-sky-600 text-white px-3 py-1 rounded"
        >
          Open in Google Maps
        </a>
      )}

      <div className="mt-3">
        <p className="mt-2 font-semibold">Amenities:</p>
        <ul className="list-disc ml-6">
          {Array.isArray(parking.amenities) && parking.amenities.length > 0 ? (
            parking.amenities.map((a, index) => <li key={index}>{a}</li>)
          ) : (
            <li>No amenities listed.</li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="font-bold mb-2">Book Parking</h2>
        <label className="block mb-1">Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <label className="block mb-1">End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleBooking}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Booking...' : 'Book Now'}
        </button>
      </div>

      {message && <p className="mt-4 font-semibold">{message}</p>}

      {booking && booking.qrCode && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Your Booking QR Code</h2>
          <img src={booking.qrCode} alt="QR Code" className="border p-2 rounded" />
        </div>
      )}

      {/* Chat: render only if booking exists, status confirmed, and current user is participant (owner or admin) */}
      <div className="mt-6">
        {booking ? (
          (booking.status === 'confirmed' && isBookingParticipant(booking)) ? (
            <BookingChat bookingId={booking._id || booking.id} token={authToken} />
          ) : (
            <div className="text-sm text-gray-500">
              Chat available only for confirmed bookings to booking owner or admin.
            </div>
          )
        ) : (
          <div className="text-sm text-gray-500">Chat will appear here after a successful booking.</div>
        )}
      </div>
    </div>
  );
}
