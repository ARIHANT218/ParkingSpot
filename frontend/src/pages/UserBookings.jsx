import { useEffect, useState } from 'react';
import axios from '../api/axios';
import BookingChat from '../components/BookingChat';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem('token');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/parking/my-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
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


  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: '✓' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: '⏳' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: '✕' },
      completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', icon: '✓' }
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', icon: '?' };
    return config;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your parking reservations</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No bookings yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start by booking a parking spot!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map(b => {
              const statusConfig = getStatusBadge(b.status);
              return (
                <div key={b._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{b.parkingLot.name}</h2>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{b.parkingLot.location}, {b.parkingLot.city}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.icon} {b.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Start Time</span>
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(b.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">End Time</span>
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(b.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Price per hour</span>
                        <span className="font-bold text-gray-900 dark:text-white">₹{b.parkingLot.pricePerHour}</span>
                      </div>
                    </div>

                    {b.status === 'confirmed' && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-300 mb-2 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Chat available - Contact admin for support
                        </p>
                        <button 
                          onClick={() => setSelectedBookingId(selectedBookingId === b._id ? null : b._id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          {selectedBookingId === b._id ? 'Close Chat' : 'Open Chat'}
                        </button>
                      </div>
                    )}

                    {b.status === 'pending' && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center">
                          <svg className="h-4 w-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Waiting for confirmation - Chat will be available once confirmed
                        </p>
                      </div>
                    )}

                    {b.qrCode && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">QR Code</p>
                        <img src={b.qrCode} alt="QR Code" className="mx-auto border-2 border-gray-200 dark:border-gray-600 rounded p-2 bg-white w-32 h-32" />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => handleEdit(b._id)} 
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCancel(b._id)} 
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat Section */}
        {selectedBookingId && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Chat with Admin</h3>
                <button 
                  onClick={() => setSelectedBookingId(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <BookingChat bookingId={selectedBookingId} token={authToken} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
