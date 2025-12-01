// src/pages/ManagerChats.jsx
import { useState } from "react";
import AdminChatsList from "../components/ManagerChatsList";
import BookingChat from "./BookingChat";

export default function ManagerChats() {
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 pt-6 px-4 md:px-8 flex gap-6">
      {/* Left: list only */}
      <AdminChatsList
        token={token}
        onSelectBooking={setSelectedBookingId}
      />

      {/* Right: chat */}
      <div className="flex-1">
        {selectedBookingId ? (
          <BookingChat bookingId={selectedBookingId} token={token} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a chat from the left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
