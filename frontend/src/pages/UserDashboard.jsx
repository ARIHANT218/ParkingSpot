import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import ParkingCard from "../components/ParkingCard";

export default function UserDashboard() {
  const [parkingLots, setParkingLots] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isUser = role === "user";

  const fetchParking = async () => {
    try {
      setLoading(true);
      setError("");
      const query = city.trim()
        ? `?city=${encodeURIComponent(city.trim())}`
        : "";
      const res = await axios.get(`/parking${query}`);
      setParkingLots(res.data || []);
    } catch (err) {
      console.error("fetchParking error:", err);
      setError("Failed to load parking lots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-10">
      <div className="max-w-6xl mx-auto mb-6">
        {/* 🔹 Top user actions bar – visible only for role === 'user' */}
        {isUser && (
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={() => navigate("/my-bookings")}
              className="px-4 py-2 text-sm font-semibold rounded-full bg-sky-600 text-white
                         shadow hover:bg-sky-700 hover:shadow-md transition"
            >
              My Bookings
            </button>
            <button
              onClick={() => navigate("/chats")}  // 👉 change to your actual chat route
              className="px-4 py-2 text-sm font-semibold rounded-full bg-emerald-500 text-white
                         shadow hover:bg-emerald-600 hover:shadow-md transition"
            >
              Chat
            </button>
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-sky-700 mb-4">
          Find a Parking Spot
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search by city (e.g. Delhi, Mumbai...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <button
            onClick={fetchParking}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-sky-600 text-white
                       shadow-md hover:bg-sky-700 hover:shadow-lg transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        {loading && (
          <p className="text-gray-500 text-sm mb-4">Loading parking lots…</p>
        )}

        {!loading && parkingLots.length === 0 && !error && (
          <p className="text-gray-500 text-sm">
            No parking lots found. Try a different city.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parkingLots.map((lot) => (
            <ParkingCard key={lot._id} lot={lot} />
          ))}
        </div>
      </div>
    </div>
  );
}
