import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('/users/login', { email, password });

     
      console.log('login response:', res.data);

     
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }

      // store role: prefer explicit field, else try to decode token payload
      if (res.data?.role) {
        localStorage.setItem('role', res.data.role);
      } else if (res.data?.token) {
        try {
          const payload = JSON.parse(atob(res.data.token.split('.')[1]));
          const roleFromToken = payload.role || payload?.role === 'admin' ? payload.role : null;
          if (roleFromToken) {
            localStorage.setItem('role', roleFromToken);
          } else {
            // fallback default
            localStorage.setItem('role', 'user');
          }
        } catch (err) {
          console.warn('failed to decode token for role fallback', err);
          localStorage.setItem('role', 'user');
        }
      } else {
        localStorage.setItem('role', 'user');
      }

      navigate('/');
    } catch (err) {
      console.error('login error:', err.response || err);
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4"> Login </h1>
        {message && <p className="text-red-500 mb-2">{message}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          Login
        </button>
      </div>
    </div>
  );
}
