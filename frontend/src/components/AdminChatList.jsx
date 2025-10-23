// src/components/AdminChatsList.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import BookingChat from './BookingChat';

export default function AdminChatsList({ token }) {
  const [chats, setChats] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchActive = async () => {
    try {
      console.log('Fetching admin chats with token:', token ? 'Present' : 'Missing');
      const res = await axios.get('/api/chats/admin/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Admin chats API response:', res.status, res.data);
      console.log('Admin chats fetched:', res.data);
      setChats(res.data);
    } catch (err) {
      console.error('Failed to fetch admin chats', err);
      console.error('Error details:', err.response?.data, err.response?.status);
      setChats([]);
    }
  };

  useEffect(() => {
    fetchActive();
  }, [token]);

  // Refresh chats every 5 seconds to catch new confirmed bookings
  useEffect(() => {
    const interval = setInterval(fetchActive, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Listen for booking confirmation events
  useEffect(() => {
    const handleBookingConfirmed = () => {
      fetchActive();
    };
    
    window.addEventListener('bookingConfirmed', handleBookingConfirmed);
    return () => window.removeEventListener('bookingConfirmed', handleBookingConfirmed);
  }, []);
  

  const openChat = (bookingId) => {
    setSelectedBookingId(bookingId);
    // mark messages read for admin whenever opening
    axios.patch(`/api/chats/${bookingId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .catch(err => console.error('markRead error', err));
  };

  return (
    <div className="flex gap-6">
      <div className="w-80 border rounded p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Active Chats</h3>
          <button 
            onClick={fetchActive}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        {chats.length === 0 && (
          <div className="text-sm text-gray-500">
            No active chats
            <div className="text-xs mt-1">Debug: {chats.length} chats found</div>
          </div>
        )}
        <ul>
          {chats.map(c => (
            <li key={c.bookingId} className="mb-2 cursor-pointer p-2 hover:bg-gray-100 rounded" onClick={() => openChat(c.bookingId)}>
              <div className="font-semibold">{c.booking.user?.name || c.booking.user?.email || 'User'}</div>
              <div className="text-xs text-gray-500 truncate">{c.lastMessage}</div>
              {c.unreadForAdmin > 0 && <div className="text-xs text-red-600">{c.unreadForAdmin} unread</div>}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1">
        {selectedBookingId ? (
          <BookingChat bookingId={selectedBookingId} token={token} />
        ) : (
          <div className="text-gray-500">Select a chat to open</div>
        )}
      </div>
    </div>
  );
}
