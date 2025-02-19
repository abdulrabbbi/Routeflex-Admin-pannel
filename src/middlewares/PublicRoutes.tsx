import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode'; // Fix: Ensure jwtDecode is correctly imported

interface DecodedToken {
   role: string;
   exp: number;
}

export const PublicRoute = ({ children }: { children: any }) => {
   const token = localStorage.getItem('authToken');

   if (token) {
      // try {
      //    const decoded = jwtDecode<DecodedToken>(token);

      //    if (decoded.exp * 1000 > Date.now()) {
      //       // Redirect to appropriate route based on the role
      //       if (decoded.role === 'admin') {
      //          return <Navigate to="/dashboard" replace />;
      //       }
      //       return <Navigate to="/" replace />;
      //    }

      //    localStorage.removeItem('authToken');
      // } catch (error) {
      //    localStorage.removeItem('authToken');
      // }
   }

   // Return children properly as JSX
   return <>{children}</>;
};
