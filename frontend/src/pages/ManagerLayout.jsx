// src/pages/ManagerLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function ManagerLayout() {
  const linkBase =
    "px-3 py-2 rounded text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-800";
  const active =
    "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600";

  return (
    <div className="p-6 min-h-screen bg-sky-50 dark:bg-sky-900 transition">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Manager Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Manage your parking lots, bookings & chats
            </p>
          </div>
        </header>

        {/* Manager navigation tabs */}
        <nav className="mb-4 flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
          <NavLink
            to="parking-lots"
            end
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? active
                  : "text-slate-700 dark:text-slate-200 bg-white dark:bg-sky-800"
              }`
            }
          >
            My Parking Lots
          </NavLink>

          <NavLink
            to="add-parking"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? active
                  : "text-slate-700 dark:text-slate-200 bg-white dark:bg-sky-800"
              }`
            }
          >
            Add Parking
          </NavLink>

          <NavLink
            to="chats"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? active
                  : "text-slate-700 dark:text-slate-200 bg-white dark:bg-sky-800"
              }`
            }
          >
            Chats
          </NavLink>
        </nav>

        {/* Child pages render here */}
        <Outlet />
      </div>
    </div>
  );
}
