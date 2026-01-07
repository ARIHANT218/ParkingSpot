import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios'; 
import BookingChat from './BookingChat';

export default function AdminChatsList({ token }) {
  const [chats, setChats] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const fetchActive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching admin chats — token:', token ? 'Present' : 'Missing');

     
      const res = await api.get('/chats/admin/active', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      console.log('Admin chats API response:', res.status, res.data);

     
      const results = res.data?.results ?? res.data;
      setChats(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error('Failed to fetch admin chats', err);
      setError(err.response?.data?.message ?? err.message ?? 'Unknown error');
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

 
  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

 
  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      if (mounted) fetchActive();
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchActive]);

 
  useEffect(() => {
    const handleBookingConfirmed = () => {
      fetchActive();
    };
    window.addEventListener('bookingConfirmed', handleBookingConfirmed);
    return () => window.removeEventListener('bookingConfirmed', handleBookingConfirmed);
  }, [fetchActive]);

  const openChat = async (bookingId) => {
    setSelectedBookingId(bookingId);

    try {
      await api.patch(
        `/chats/${bookingId}/read`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      // Optionally refresh chat list to update unread counters
      fetchActive();
    } catch (err) {
      console.error('markRead error', err);
    }
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

        {loading && <div className="text-sm text-gray-600">Loading chats…</div>}
        {!loading && error && <div className="text-sm text-red-600">Error: {error}</div>}

        {!loading && chats.length === 0 && !error && (
          <div className="text-sm text-gray-500">
            No active chats
            <div className="text-xs mt-1">Debug: {chats.length} chats found</div>
          </div>
        )}

        <ul>
          {chats.map((c, idx) => {
            const bookingId = c.bookingId ?? c.booking?._id ?? String(idx);
            const userName = c.booking?.user?.name ?? c.booking?.user?.email ?? 'User';
           
            const lastMessageText =
              (c.lastMessage && typeof c.lastMessage === 'object' && c.lastMessage.text) ||
              (typeof c.lastMessage === 'string' && c.lastMessage) ||
              'No messages';
           
            const unreadCount =
              typeof c.unreadForAdmin === 'number'
                ? c.unreadForAdmin
                : c.unreadForAdmin === true
                ? 1
                : 0;

            return (
              <li
                key={bookingId}
                className="mb-2 cursor-pointer p-2 hover:bg-gray-100 rounded"
                onClick={() => openChat(bookingId)}
              >
                <div className="font-semibold">{userName}</div>
                <div className="text-xs text-gray-500 truncate">{lastMessageText}</div>
                {unreadCount > 0 && (
                  <div className="text-xs text-red-600">{unreadCount} unread</div>
                )}
              </li>
            );
          })}
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



