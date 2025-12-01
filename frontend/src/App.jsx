// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ParkingDetails from "./pages/ParkingDetails";
import UserBookings from "./pages/UserBookings";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import MapLoader from "./components/MapLoader";
import MapView from "./pages/MapView";

import LandingPage from "./pages/LandingPage";

import BookingChat from "./pages/BookingChat";

// NEW manager pages
import ManagerLayout from "./pages/ManagerLayout";
import ManagerAddParking from "./pages/ManagerAddParking";
import ManagerParkingLots from "./pages/ManagerParkingLots";
import ManagerChats from "./pages/ManagerChats";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <MapLoader>
              <MapView />
            </MapLoader>
          }
        />
                          <Route
                path="/bookings/:bookingId/chat"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <BookingChat />
                  </ProtectedRoute>
                }
              />

        <Route
          path="/parking/:id"
          element={
            <ProtectedRoute>
              <ParkingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
             <ProtectedRoute allowedRoles={["user"]}>
              <UserBookings />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Manager routes (nested under /manager) */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          {/* default: show parking lots page */}
          <Route index element={<ManagerParkingLots />} />
          <Route path="add-parking" element={<ManagerAddParking />} />
          <Route path="parking-lots" element={<ManagerParkingLots />} />
          <Route path="chats" element={<ManagerChats />} />
        </Route>

        

        {/* 🔹 Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
