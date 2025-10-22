// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';


export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'admin' or 'user'

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between bg-white dark:bg-sky-900 text-slate-900 dark:text-slate-100 transition">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-extrabold text-xl text-sky-700 dark:text-sky-accent">ParkingApp</Link>
          <Link to="/" className="hidden md:inline text-sm hover:underline">Explore</Link>
          {token && role === 'user' && (
            <Link to="/my-bookings" className="text-sm hover:underline">My Bookings</Link>

          )}
          {token && role === 'admin' && (
            <Link to="/admin" className="text-sm hover:underline">Admin Dashboard</Link>

          )}
                {/* Map */}
          <Link to="/map" className="text-sm hover:underline">Map</Link>
           
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {token ? (
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
          ) : (
            <>
              <Link to="/login" className="text-sm px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-sky-800 transition">Login</Link>
              <Link to="/register" className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
