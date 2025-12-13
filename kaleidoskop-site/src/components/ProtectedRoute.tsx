import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface ProtectedRouteProps {
  allowedFor: 'auth' | 'guest' | 'admin';
}

export default function ProtectedRoute({ allowedFor }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.user.user);
  
  const isAuth = Boolean(token);
  const isAdmin = user?.is_superuser === true;

  if (allowedFor === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (allowedFor === 'auth' && !isAuth) {
    return <Navigate to="/" replace />;
  }

  if (allowedFor === 'guest' && isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}