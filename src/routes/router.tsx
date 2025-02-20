

import { PublicRoute } from "../middlewares/PublicRoutes";
import { LoginProtectedRoutes } from "../middlewares/LoginProtectedRoutes";
import { OwnerProtectedRoutes } from "../middlewares/OwnerProtectedRoutes";
import SiteLayout from "../layouts/SiteLayout";
import { createBrowserRouter, Outlet } from "react-router-dom";
import DashboardLayout from "../layouts/SiteLayout";
import DashboardContent from "../pages/MainDashboard";
import TrackingPage from "../pages/TrackingPage";
import RouteListing from "../pages/RouteListing";
import PaymentsPage from "../pages/PaymentPage";
import ParcelTrackingPage from "../pages/ParcelTrackingPage";
import LoginPage from "../pages/Auth/Login";
import SettingsPage from "../pages/Settings";

const Router = () => {

   return createBrowserRouter([

      {
         path: "/",
         element: (
            <DashboardLayout />
         ),
         children: [
            {
               index: true,
               element: <DashboardContent />,
            },
            {
               path: '/tracking',
               element: <TrackingPage />,
            },
            {
               path: '/parcel-tracking',
               element: <ParcelTrackingPage />,
            },
            {
               path: '/route-listing',
               element: <RouteListing />,
            },
            {
               path: '/payments',
               element: <PaymentsPage />,
            },
            {
               path: '/settings',
               element: <SettingsPage />,
            },

         ],
      },
      {
         path: '/auth',
         element: (
            <Outlet />
         ),
         children: [
            {
               index: true,
               path: 'login',
               element: <LoginPage />
            }
         ]
      }

   ]);
};

export default Router;
