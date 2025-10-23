import { useEffect, useState } from 'react';
import axios from '../api/axios';
import BookingChat from '../components/BookingChat';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const authToken = localStorage.getItem('token');

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/parking/my-bookings');
      console.log('Fetched bookings:', res.data);
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authToken) return;
      try {
        const res = await axios.get('/users/me', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setCurrentUser(res.data);
        console.log('Current user data:', res.data);
      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    };
    fetchCurrentUser();
  }, [authToken]);

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

  // Helper to check if current user is owner OR admin
  const isBookingParticipant = (bookingObj) => {
    if (!bookingObj || !currentUser) {
      console.log('isBookingParticipant: Missing data', { bookingObj: !!bookingObj, currentUser: !!currentUser });
      return false;
    }
    const bookingUserId = bookingObj.user?._id || bookingObj.user;
    const currentUserId = currentUser.id || currentUser._id;
    const isOwner = String(currentUserId) === String(bookingUserId);
    const isAdmin = currentUser.role === 'admin';
    
    console.log('isBookingParticipant check:', {
      bookingUserId,
      currentUserId,
      isOwner,
      isAdmin,
      result: isOwner || isAdmin
    });
    
    return isOwner || isAdmin;
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
            <div className="mt-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs ${
                b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Status: {b.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            {b.status === 'confirmed' && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">✅ Chat available - Contact admin for support</p>
                <p className="text-xs text-gray-600">Debug: Status={b.status}, Participant={isBookingParticipant(b)}, User={currentUser?.name}</p>
                <button 
                  onClick={() => setSelectedBookingId(selectedBookingId === b._id ? null : b._id)}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                >
                  {selectedBookingId === b._id ? 'Close Chat' : 'Open Chat'}
                </button>
              </div>
            )}
            {b.status === 'pending' && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">⏳ Waiting for confirmation - Chat will be available once confirmed</p>
              </div>
            )}
            <div className="mt-2 space-x-2">
              <button onClick={() => handleEdit(b._id)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</button>
              <button onClick={() => handleCancel(b._id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Cancel</button>
            </div>
            {b.qrCode && <img src={b.qrCode} alt="QR Code" className="mt-2 border p-1 rounded w-32" />}
          </div>
        ))}
      </div>

      {/* Chat Section */}
      {selectedBookingId && (
        <div className="mt-6 p-4 bg-white border rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Chat with Admin</h3>
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">🔧 Debug: Chat component should load here</p>
          </div>
          <BookingChat bookingId={selectedBookingId} token={authToken} />
        </div>
      )}

      {/* Debug Section - Always show for testing */}
      <div className="mt-6 p-4 bg-gray-100 border rounded">
        <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
        <p>Selected Booking ID: {selectedBookingId || 'None'}</p>
        <p>Auth Token: {authToken ? 'Present' : 'Missing'}</p>
        <p>Current User: {currentUser?.name || 'Not loaded'}</p>
        <p>Bookings Count: {bookings.length}</p>
        {bookings.map((b, index) => (
          <div key={index} className="text-sm">
            Booking {index + 1}: Status={b.status}, ID={b._id}
          </div>
        ))}
      </div>
    </div>
  );
}
