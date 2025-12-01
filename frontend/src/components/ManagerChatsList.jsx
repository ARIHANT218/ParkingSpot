// src/components/ManagerChatsList.jsx (or AdminChatsList.jsx)
import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

export default function AdminChatsList({ token, onSelectBooking }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/chats/manager/active", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const results = res.data?.results ?? res.data;
      setChats(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error("Failed to fetch manager chats", err);
      setError(
        err.response?.data?.message ?? err.message ?? "Failed to load chats"
      );
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
    window.addEventListener("bookingConfirmed", handleBookingConfirmed);
    return () =>
      window.removeEventListener("bookingConfirmed", handleBookingConfirmed);
  }, [fetchActive]);

  const openChat = async (bookingId) => {
    // notify parent which booking/chat to show
    onSelectBooking?.(bookingId);

    // mark messages read
    try {
      await api.patch(
        `/chats/${bookingId}/read`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      fetchActive();
    } catch (err) {
      console.error("markRead error", err);
    }
  };

  return (
    <div className="w-80 border rounded p-3 bg-white dark:bg-sky-800 dark:border-sky-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">
          Active Chats
        </h3>
        <button
          onClick={fetchActive}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-600 dark:text-slate-300">
          Loading chats…
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600 dark:text-red-300">
          Error: {error}
        </div>
      )}

      {!loading && chats.length === 0 && !error && (
        <div className="text-sm text-gray-500 dark:text-slate-300">
          No active chats
        </div>
      )}

      <ul>
        {chats.map((c, idx) => {
          const bookingId = c.bookingId ?? c.booking?._id ?? String(idx);
          const userName =
            c.booking?.user?.name ||
            c.booking?.user?.email ||
            "Unknown user";

          const lastMessageText =
            typeof c.lastMessage === "string"
              ? c.lastMessage
              : c.lastMessage?.text || "No messages";

          const unreadCount =
            typeof c.unread === "number"
              ? c.unread
              : c.unread === true
              ? 1
              : 0;

          return (
            <li
              key={bookingId}
              className="mb-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-sky-700 rounded"
              onClick={() => openChat(bookingId)}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {userName}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-300 truncate">
                {lastMessageText}
              </div>
              {unreadCount > 0 && (
                <div className="text-xs text-red-600 dark:text-red-300">
                  {unreadCount} unread
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
