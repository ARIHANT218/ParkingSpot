import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ParkingDetails from './pages/ParkingDetails';
import UserBookings from './pages/UserBookings';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MapLoader from './components/MapLoader';
import MapView from './pages/MapView';



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }/>
                
        <Route path="/map" element={
          <MapLoader>
            <MapView />
          </MapLoader>
        } />

        <Route path="/parking/:id" element={
          <ProtectedRoute>
            <ParkingDetails />

          </ProtectedRoute>
        }/>
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <UserBookings />

          </ProtectedRoute>
        }/>
        <Route path="/admin" element={
          <ProtectedRoute admin={true}>
            <AdminDashboard />
           
            
          </ProtectedRoute>
        }/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
