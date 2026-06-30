import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Giriş yapılmamışsa login'e yönlendir, dönüş adresini sakla
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
