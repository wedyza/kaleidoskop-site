import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addNotification } from "../features/notifications/notificationsSlice";

interface ProtectedRouteProps {
  allowedFor: "auth" | "guest" | "admin";
}

export default function ProtectedRoute({ allowedFor }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.user.user);

  const isAuth = Boolean(token);
  const isAdmin = user?.is_superuser === true;
  const dispatch = useAppDispatch();

  if (allowedFor === "admin" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (allowedFor === "auth" && !isAuth) {
    dispatch(
      addNotification({
        title: "Требуется авторизация",
        message: "Пожалуйста, войдите в систему",
        type: "warning",
      }),
    );
    return <Navigate to="/" replace />;
  }

  if (allowedFor === "guest" && isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
