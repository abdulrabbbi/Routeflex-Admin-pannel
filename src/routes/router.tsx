

import { PublicRoute } from "../middlewares/PublicRoutes";
import { LoginProtectedRoutes } from "../middlewares/LoginProtectedRoutes";
import { OwnerProtectedRoutes } from "../middlewares/OwnerProtectedRoutes";
import SiteLayout from "../layouts/SiteLayout";
import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/SiteLayout";
import DashboardContent from "../pages/MainDashboard";
import TrackingPage from "../pages/TrackingPage";
import RouteListing from "../pages/RouteListing";
import PaymentsPage from "../pages/PaymentPage";
import ParcelTrackingPage from "../pages/ParcelTrackingPage";

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
               path: '/route-listing',
               element: <RouteListing />,
            },
            {
               path: '/payments',
               element: <PaymentsPage />,
            },
            {
               path: '/parcel-tracking',
               element: <ParcelTrackingPage />,
            },

         ],
      },

   ]);
};

export default Router;
