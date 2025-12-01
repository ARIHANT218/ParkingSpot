import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [managerCode, setManagerCode] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const body = { name, email, password, role };
      if (role === "manager") body.managerCode = managerCode;

      const res = await axios.post('/users/register', body);
      localStorage.setItem("token", res.data.token);

      const payload = JSON.parse(atob(res.data.token.split('.')[1]));
      localStorage.setItem("role", payload.role);
      if (payload.role === "admin") navigate("/admin");
      else if (payload.role === "manager") navigate("/manager");
      else navigate("/user");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-500 p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/40 
        hover:shadow-[0_0_35px_rgba(255,255,255,0.9)] transition-all duration-300">

        <h1 className="text-3xl font-extrabold text-center text-indigo-600 mb-4">
          Create Account
        </h1>

        {message && <p className="text-red-600 text-center mb-2">{message}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-3 rounded-lg w-full mb-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-3 rounded-lg w-full mb-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-3 rounded-lg w-full mb-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Radio roles */}
        <div className="flex gap-4 mb-3 text-gray-700 font-medium">
          <label>
            <input type="radio" checked={role === "user"} onChange={() => setRole("user")} /> User
          </label>
          <label>
            <input type="radio" checked={role === "manager"} onChange={() => setRole("manager")} /> Manager
          </label>
        </div>

        {/* Manager code field */}
        {role === "manager" && (
          <input
            type="text"
            placeholder="Enter Manager Code"
            value={managerCode}
            onChange={e => setManagerCode(e.target.value)}
            className="border p-3 rounded-lg w-full mb-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}

        <button
          onClick={handleRegister}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-105 shadow-xl transition-all mb-3"
        >
          Register
        </button>

        <button className="text-indigo-700 font-semibold w-full hover:underline"
          onClick={() => navigate('/login')}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
