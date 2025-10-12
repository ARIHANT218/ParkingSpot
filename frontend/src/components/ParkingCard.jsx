// src/components/ParkingCard.jsx
import { Link } from 'react-router-dom';

export default function ParkingCard({ lot }) {
  return (
    <div className="p-4 rounded-xl shadow card bg-white dark:bg-sky-800 text-slate-900 dark:text-slate-100">
      <h2 className="font-bold text-lg">{lot.name}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">{lot.city} - {lot.location}</p>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-sm">Price/hr: <span className="font-semibold">₹{lot.pricePerHour}</span></p>
          <p className="text-sm">Slots: <span className="font-semibold">{lot.availableSlots}</span></p>
        </div>
        <Link to={`/parking/${lot._id}`} className="bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700 transition">View</Link>
      </div>
    </div>
  );
}
