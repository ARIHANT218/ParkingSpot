import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('/users/register', { name, email, password, role });

      const data = res.data;
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      // prefer explicit role field, fallback to token payload
      if (data?.user?.role) {
        localStorage.setItem('role', data.user.role);
      } else if (data?.role) {
        localStorage.setItem('role', data.role);
      } else if (data?.token) {
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          localStorage.setItem('role', payload.role || 'user');
        } catch {
          localStorage.setItem('role', 'user');
        }
      }

      navigate('/');
    } catch (err) {
      console.error('signup error:', err.response || err);
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4"> Sign Up </h1>
        {message && <p className="text-red-500 mb-2">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded w-full mb-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-2"
            required
          />
          <select value={role} onChange={e => setRole(e.target.value)} className="border p-2 rounded w-full mb-4">
            <option value="user">User (book parking)</option>
            <option value="parking_manager">Parking Manager (upload parking)</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
