import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store.js';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const token = useAppSelector((s) => s.auth.token);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
