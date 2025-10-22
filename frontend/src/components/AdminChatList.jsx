// src/components/AdminChatsList.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import BookingChat from './BookingChat';

export default function AdminChatsList({ token }) {
  const [chats, setChats] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await axios.get('/api/chats/admin/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(res.data);
      } catch (err) {
        console.error('Failed to fetch admin chats', err);
      }
    };
    fetchActive();
  }, [token]);
  

  const openChat = (bookingId) => {
    setSelectedBookingId(bookingId);
    // mark messages read for admin whenever opening
    axios.patch(`/api/chats/${bookingId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .catch(err => console.error('markRead error', err));
  };

  return (
    <div className="flex gap-6">
      <div className="w-80 border rounded p-3">
        <h3 className="font-bold mb-3">Active Chats</h3>
        {chats.length === 0 && <div className="text-sm text-gray-500">No active chats</div>}
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
