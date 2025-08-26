import { createBrowserRouter, Outlet } from "react-router-dom";
import ProtectedRoute from "../middlewares/ProtectedRoute";
import DashboardLayout from "../layouts/SiteLayout";
import DashboardContent from "../pages/MainDashboard";
import TrackingPage from "../pages/TrackingPage";
import PaymentsPage from "../pages/PaymentPage";
import ParcelTrackingPage from "../pages/ParcelTrackingPage";
import LoginPage from "../pages/Auth/Login";
import SettingsPage from "../pages/Settings";
import DriverDetailsPage from "../pages/DriverDetailsPage";
import UserTypesPage from "../pages/UserTypesPage";
import FeedbackAdminPage from "../pages/FeedbackAdminPage";
import RatingsAdminPage from "../pages/RatingsAdminPage";
import RatingDetailsPage from "../pages/RatingDetailsPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetail from "../components/orders/OrderDetail";
import JobAssignmentPage from "../components/orders/JobAssignmentPage";

const ErrorFallback = () => (
  <div className="min-h-screen grid place-items-center p-6">
    <div className="max-w-md text-center space-y-3">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-gray-600">
        The page you requested doesn't exist or has moved.
      </p>
      <a
        href="/"
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Go to Dashboard
      </a>
    </div>
  </div>
);

const Router = () =>
  createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <DashboardLayout />,
          errorElement: <ErrorFallback />,
          children: [
            { index: true, element: <DashboardContent /> },
            { path: "tracking", element: <TrackingPage /> },
            { path: "tracking/driver/:id", element: <DriverDetailsPage /> },
            { path: "parcel-tracking", element: <ParcelTrackingPage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "orders/:id", element: <OrderDetail /> },
            { path: "orders/assign", element: <JobAssignmentPage /> },
            { path: "user-types", element: <UserTypesPage /> },
            { path: "feedbacks", element: <FeedbackAdminPage /> },
            { path: "ratings", element: <RatingsAdminPage /> },
            { path: "ratings/:id", element: <RatingDetailsPage /> },
            { path: "payments", element: <PaymentsPage /> },
            { path: "settings", element: <SettingsPage /> },
          ],
        },
      ],
    },

    // 🔓 public auth branch
    {
      path: "/auth",
      element: <Outlet />,
      children: [{ path: "login", element: <LoginPage /> }],
    },
  ]);

export default Router;
