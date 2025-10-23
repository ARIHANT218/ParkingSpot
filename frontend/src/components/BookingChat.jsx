// src/components/BookingChat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from '../api/axios'; // use your axios instance (baseURL + interceptors)

const SOCKET_URL = 'http://localhost:5000';

export default function BookingChat({ bookingId, token }) {
  console.log('BookingChat component rendered with:', { bookingId, token: !!token });
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Fetch chat history
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!bookingId) return;
      try {
        const res = await axios.get(`/api/chats/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mounted) setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch chat history:', err?.response?.data || err.message || err);
      }
    };

    fetchHistory();
    return () => { mounted = false; };
  }, [bookingId, token]);
  // in BookingChat useEffect after fetchHistory or on connect
    useEffect(() => {
      if (!bookingId || !token) return;
      axios.patch(`/api/chats/${bookingId}/read`, {}, { headers: { Authorization: `Bearer ${token}` }})
        .catch(err => console.error('markRead error', err));
    }, [bookingId, token]);


  // Setup SocketIO connection (recreate when bookingId or token changes)
  useEffect(() => {
    if (!bookingId || !token) {
      console.log('BookingChat: Missing bookingId or token', { bookingId, token: !!token });
      return;
    }

    console.log('BookingChat: Setting up socket connection', { bookingId });

    // cleanup any previous socket
    if (socketRef.current) {
      socketRef.current.off();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 3
    });
    socketRef.current = socket;

    // connection lifecycle
    socket.on('connect', () => {
      console.log('BookingChat: Socket connected');
      setConnected(true);
      // try to join the booking room
      console.log('BookingChat: Joining room for booking', bookingId);
      socket.emit('joinRoom', { bookingId });
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.warn('Socket disconnected:', reason);
    });

    // custom server-side errors (we used joinError/sendError in examples)
    socket.on('joinError', (payload) => {
      console.warn('Join room error:', payload?.message || payload);
    });

    socket.on('sendError', (payload) => {
      console.warn('Send message error:', payload?.message || payload);
    });

    // normal new message event
    socket.on('newMessage', (msg) => {
      console.log('BookingChat: Received new message', msg);
      // ensure message shape and avoid duplicates (optional)
      setMessages(prev => {
        // simple duplicate avoidance by _id
        if (!msg || !msg._id) return [...prev, msg];
        if (prev.some(m => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    });

    // generic error
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    // cleanup on unmount or deps change
    return () => {
      try {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('joinError');
        socket.off('sendError');
        socket.off('newMessage');
        socket.off('error');
      } catch (error) { /* ignore */ }
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [bookingId, token]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const socket = socketRef.current;
    if (!socket || !connected) {
      console.warn('Socket not connected. Falling back to REST POST.');
      // fallback: send via REST POST
      axios.post(`/api/chats/${bookingId}`, { message: text }, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        // server may also broadcast; add locally to keep UI responsive
        if (res.data) setMessages(prev => [...prev, res.data]);
      }).catch(err => {
        console.error('Failed to send message via REST:', err?.response?.data || err.message || err);
      });
      setText('');
      return;
    }

    socket.emit('sendMessage', { bookingId, text }, (ack) => {
      // optional ack callback from server
      // if server returns ack.msg we could push it, otherwise assume server emits newMessage
      if (ack && ack.error) {
        console.warn('Server ack error:', ack.error);
      }
    });

    setText('');
  };

  return (
    <div className="border rounded-lg p-4 max-w-xl">
      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">🔧 BookingChat Component Loaded - Booking ID: {bookingId}</p>
      </div>
      <div className="mb-2 text-sm text-gray-500">
        {connected ? 'Connected' : 'Connecting...'}
      </div>

      <div className="h-64 overflow-y-auto border p-2 mb-3 bg-white">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-400">No messages yet.</div>
        ) : (
          messages.map(m => {
            const key = m._id || `${m.sender}_${m.createdAt}`;
            const senderRole = m.senderRole || m.sender?.role || (m.sender && m.sender.isAdmin ? 'admin' : 'user');
            const createdAt = m.createdAt ? new Date(m.createdAt) : null;
            return (
              <div key={key} className={`mb-2 flex ${senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-2 rounded-lg max-w-xs ${senderRole === 'admin' ? 'bg-gray-100 text-black' : 'bg-blue-500 text-white'}`}>
                  <div className="text-sm break-words">{m.message ?? m.text ?? ''}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {createdAt ? createdAt.toLocaleString() : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder={connected ? "Type a message..." : "Connecting..."}
          disabled={!connected && !token} // if no token and socket can't connect, disable
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={!text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
