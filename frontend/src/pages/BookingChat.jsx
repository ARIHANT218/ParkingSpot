// src/pages/UserBookings.jsx (or wherever this lives)
import { useEffect, useState } from "react";
import axios from "../api/axios";
import BookingChat from "./BookingChat";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const authToken = localStorage.getItem("token");

  const authConfig = authToken
    ? { headers: { Authorization: `Bearer ${authToken}` } }
    : {};

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/parking/my-bookings", authConfig);
      console.log("Fetched bookings:", res.data);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authToken) return;
      try {
        const res = await axios.get("/users/me", authConfig);
        setCurrentUser(res.data);
        console.log("Current user data:", res.data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };
    fetchCurrentUser();
  }, [authToken]);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    try {
      await axios.delete(`/parking/cancel/${id}`, authConfig);
      fetchBookings();
      if (selectedBookingId === id) setSelectedBookingId(null);
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  const handleEdit = async (id) => {
    const newStart = prompt("Enter new start time (YYYY-MM-DDTHH:MM):");
    const newEnd = prompt("Enter new end time (YYYY-MM-DDTHH:MM):");
    if (newStart && newEnd) {
      try {
        await axios.put(
          `/parking/edit/${id}`,
          { startTime: newStart, endTime: newEnd },
          authConfig
        );
        fetchBookings();
      } catch (err) {
        console.error("Edit error:", err);
      }
    }
  };

  // Helper to check if current user is owner OR admin
  const isBookingParticipant = (bookingObj) => {
    if (!bookingObj || !currentUser) {
      console.log("isBookingParticipant: Missing data", {
        bookingObj: !!bookingObj,
        currentUser: !!currentUser,
      });
      return false;
    }
    const bookingUserId = bookingObj.user?._id || bookingObj.user;
    const currentUserId = currentUser.id || currentUser._id;
    const isOwner = String(currentUserId) === String(bookingUserId);
    const isAdmin = currentUser.role === "admin";

    console.log("isBookingParticipant check:", {
      bookingUserId,
      currentUserId,
      isOwner,
      isAdmin,
      result: isOwner || isAdmin,
    });

    return isOwner || isAdmin;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-10">
      <h1 className="text-3xl font-extrabold text-sky-700 mb-6">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-gray-600 mb-4">You don’t have any bookings yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="border border-slate-200 rounded-xl bg-white shadow-sm p-4"
          >
            <h2 className="font-bold text-lg mb-1">
              {b.parkingLot?.name || "Parking Lot"}
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              Location: {b.parkingLot?.location}, {b.parkingLot?.city}
            </p>
            <p className="text-sm">
              Start: {new Date(b.startTime).toLocaleString()}
            </p>
            <p className="text-sm">
              End: {new Date(b.endTime).toLocaleString()}
            </p>
            <p className="text-sm mb-2">
              Price/hr: <span className="font-semibold">₹{b.parkingLot?.pricePerHour}</span>
            </p>

            <div className="mt-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  b.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : b.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : b.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                Status: {b.status?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>

            {b.status === "confirmed" && isBookingParticipant(b) && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  ✅ Chat available – contact support about this booking.
                </p>
                <button
                  onClick={() =>
                    setSelectedBookingId(
                      selectedBookingId === b._id ? null : b._id
                    )
                  }
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                >
                  {selectedBookingId === b._id ? "Close Chat" : "Open Chat"}
                </button>
              </div>
            )}

            {b.status === "pending" && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⏳ Waiting for manager confirmation – chat becomes available
                  after confirmation.
                </p>
              </div>
            )}

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(b._id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleCancel(b._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
              >
                Cancel
              </button>
            </div>

            {b.qrCode && (
              <img
                src={b.qrCode}
                alt="QR Code"
                className="mt-3 border p-1 rounded w-32"
              />
            )}
          </div>
        ))}
      </div>

      {/* Chat Section */}
      {selectedBookingId && (
        <div className="mt-6 p-4 bg-white border rounded-lg shadow max-w-3xl">
          <h3 className="text-lg font-semibold mb-3">
            Chat about booking: {selectedBookingId}
          </h3>
          <BookingChat
            key={selectedBookingId}
            bookingId={selectedBookingId}
            token={authToken}
          />
        </div>
      )}

      {/* Debug Section - keep if you still want it */}
      <div className="mt-6 p-4 bg-gray-100 border rounded text-sm">
        <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
        <p>Selected Booking ID: {selectedBookingId || "None"}</p>
        <p>Auth Token: {authToken ? "Present" : "Missing"}</p>
        <p>Current User: {currentUser?.name || "Not loaded"}</p>
        <p>Bookings Count: {bookings.length}</p>
        {bookings.map((b, index) => (
          <div key={index}>
            Booking {index + 1}: Status={b.status}, ID={b._id}
          </div>
        ))}
      </div>
    </div>
  );
}
