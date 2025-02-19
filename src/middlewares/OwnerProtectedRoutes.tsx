
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
   role: string;
   exp: number;
}

export const OwnerProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
   const token = localStorage.getItem('authToken');
   const location = useLocation();

   if (!token) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
   }

   try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (decoded.exp * 1000 < Date.now()) {
         localStorage.removeItem('authToken');
         return <Navigate to="/auth/login" state={{ from: location }} replace />;
      }

      // Check if user is admin
      if (decoded.role !== 'admin') {
         return <Navigate to="/" replace />;
      }

      return <>{children}</>;
   } catch (error) {
      localStorage.removeItem('authToken');
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
   }
};