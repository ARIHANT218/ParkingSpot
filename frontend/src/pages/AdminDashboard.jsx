import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        setError('');
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { title: "Active Users", value: stats?.activeUsers ?? 0, color: "bg-sky-400" },
    { title: "Parking Managers", value: stats?.parkingManagers ?? 0, color: "bg-sky-300" },
    { title: "Total Bookings", value: stats?.totalBookings ?? 0, color: "bg-sky-400" },
    { title: "Total Revenue", value: `₹${stats?.totalRevenue ?? 0}`, color: "bg-sky-300" },
  ];

  return (
    <div className="p-8 min-h-screen pt-20 bg-sky-50 dark:bg-slate-900 transition">
          <h1 className="text-3xl font-extrabold text-sky-700 mb-6 text-center">
        Admin Dashboard
      </h1>

      {error && <div className="mb-4 p-3 text-red-800 bg-red-200 rounded-lg">{error}</div>}
      {loading && <div className="text-gray-500 mb-4">Loading statistics…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-2xl shadow-md p-6 cursor-pointer transform transition 
                        hover:scale-105 hover:shadow-xl hover:bg-sky-500 hover:text-white`}
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="text-4xl font-bold mt-3">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
