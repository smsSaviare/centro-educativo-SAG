// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if(!token) return <Navigate to="/login" />;
  if(requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" />;
  return children;
};
export default PrivateRoute;
