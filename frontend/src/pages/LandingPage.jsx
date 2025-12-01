import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-500 p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Left Content Panel */}
        <div
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/40 
          hover:shadow-[0_0_35px_rgba(255,255,255,0.9)] transition-all duration-300"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Smart Parking System built using the MERN stack.
          </p>

          <h2 className="text-3xl font-bold text-indigo-600 text-center mb-4">
            Welcome to ParkingApp 🚗
          </h2>

          <p className="text-gray-600 text-center mb-6">
            Manage bookings, parking lots & smart parking services efficiently.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-105 shadow-xl transition-all"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/register")}
              className="w-full bg-white text-indigo-600 border border-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-50 hover:scale-105 transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Right Illustration Image */}
        <div className="flex justify-center">
          <img
            src="/car-illustration.png"
            alt="smart parking illustration"
            className="w-80 md:w-[480px] drop-shadow-2xl"
          />
        </div>

      </div>
    </div>
  );
}
