import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'admin' | 'user' | 'manager'

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const homePath =
    role === 'admin' ? '/admin' :
    role === 'manager' ? '/manager' :
    '/user';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between bg-white text-slate-900">
        <div className="flex items-center gap-6">
          <Link
            to={token ? homePath : '/'}
            className="font-extrabold text-xl text-sky-700"
          >
            ParkingApp
          </Link>

          {/* 🔹 user-only features in navbar */}
          {token && role === 'user' && (
            <>
              <Link
                to="/user"
                className="text-sm font-medium hover:text-sky-600"
              >
                Explore
              </Link>
              <Link
                to="/my-bookings"
                className="text-sm font-medium hover:text-sky-600"
              >
                My Bookings
              </Link>
              <Link
                to="/chats"   // 👉 change to your actual user chat route
                className="text-sm font-medium hover:text-sky-600"
              >
                Chat
              </Link>
            </>
          )}

          {/* admin / manager links */}
          {token && role === 'admin' && (
            <Link to="/admin" className="text-sm hover:text-sky-600">
              Admin Dashboard
            </Link>
          )}
          {token && role === 'manager' && (
            <Link to="/manager" className="text-sm hover:text-sky-600">
              Manager Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-3 py-1 rounded hover:bg-slate-100 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
