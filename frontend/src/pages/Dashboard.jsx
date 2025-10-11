import React, { useState, useEffect } from 'react';
import { getAllBookings, getParkingLots } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLots: 0,
    totalBookings: 0,
    occupiedLots: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, lotsRes] = await Promise.all([
          getAllBookings(),
          getParkingLots()
        ]);

        // Assuming your booking object has a status
        const activeBookings = bookingsRes.data.filter(b => b.status === 'active').length;

        setStats({
          totalLots: lotsRes.data.length,
          totalBookings: bookingsRes.data.length,
          occupiedLots: activeBookings
        });
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Parking Lots" value={stats.totalLots} />
        <StatCard title="Total Bookings" value={stats.totalBookings} />
        <StatCard title="Currently Occupied" value={stats.occupiedLots} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-lg text-gray-400 mb-2">{title}</h3>
    <p className="text-4xl font-bold text-indigo-400">{value}</p>
  </div>
);

export default Dashboard;
