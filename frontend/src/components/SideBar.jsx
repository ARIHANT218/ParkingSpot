import React from 'react';

const SideBar = ({ setCurrentPage, onLogout }) => {
  const navItems = ['Dashboard', 'Manage Parking'];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-5 text-2xl font-bold border-b border-gray-700">
        <span className="text-indigo-400">Parking</span>Spot
      </div>
      <nav className="flex-grow mt-5">
        <ul>
          {navItems.map((item) => (
            <li key={item} className="mb-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(item.replace(' ', ''));
                }}
                className="flex items-center px-5 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-5 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
