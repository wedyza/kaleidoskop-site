import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface ProtectedRouteProps {
  allowedFor: 'auth' | 'guest';
}

export default function ProtectedRoute({ allowedFor }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token);
  const isAuth = Boolean(token);

  if (allowedFor === 'auth' && !isAuth) {
    return <Navigate to="/" replace />;
  }

  if (allowedFor === 'guest' && isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
