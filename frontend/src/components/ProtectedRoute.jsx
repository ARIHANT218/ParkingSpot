import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, admin }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />; // Not logged in
  if (admin && role !== 'admin') return <Navigate to="/" />; // Not admin

  return children;
}
