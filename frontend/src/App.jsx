import React, { useState, useEffect } from 'react';
import AdminLogin from './pages/AdminLogin';
import SideBar from './components/SideBar';
import Dashboard from './pages/Dashboard';
import ManageParking from './pages/ManageParking';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // In a real app, you should verify the token with the backend here
      setIsAdminLoggedIn(true);
    }
    setIsLoading(false);
  }, []);
  
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentPage('Dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'ManageParking':
        return <ManageParking />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  

  return (
    <div className="flex min-h-screen bg-gray-900">
      <SideBar setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
