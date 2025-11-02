// import { createBrowserRouter, Outlet } from "react-router-dom";
// import ProtectedRoute from "../middlewares/ProtectedRoute";
// import DashboardLayout from "../layouts/SiteLayout";
// import DashboardContent from "../pages/MainDashboard";
// import TrackingPage from "../pages/TrackingPage";
// import PaymentsPage from "../pages/PaymentPage";
// import ParcelTrackingPage from "../pages/ParcelTrackingPage";
// import LoginPage from "../pages/Auth/Login";
// import SettingsPage from "../pages/Settings";
// import DriverDetailsPage from "../pages/DriverDetailsPage";
// import UserTypesPage from "../pages/UserTypesPage";
// import FeedbackAdminPage from "../pages/FeedbackAdminPage";
// import RatingsAdminPage from "../pages/RatingsAdminPage";
// import RatingDetailsPage from "../pages/RatingDetailsPage";
// import OrdersPage from "../pages/OrdersPage";
// import OrderDetail from "../components/orders/OrderDetail";
// import JobAssignmentPage from "../components/orders/JobAssignmentPage";

// const ErrorFallback = () => (
//   <div className="min-h-screen grid place-items-center p-6">
//     <div className="max-w-md text-center space-y-3">
//       <h1 className="text-2xl font-bold">Page not found</h1>
//       <p className="text-gray-600">
//         The page you requested doesn't exist or has moved.
//       </p>
//       <a
//         href="/"
//         className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
//       >
//         Go to Dashboard
//       </a>
//     </div>
//   </div>
// );

// const Router = () =>
//   createBrowserRouter([
//     {
//       path: "/",
//       element: <ProtectedRoute />,
//       children: [
//         {
//           element: <DashboardLayout />,
//           errorElement: <ErrorFallback />,
//           children: [
//             { index: true, element: <DashboardContent /> },
//             { path: "tracking", element: <TrackingPage /> },
//             { path: "tracking/driver/:id", element: <DriverDetailsPage /> },
//             { path: "parcel-tracking", element: <ParcelTrackingPage /> },
//             { path: "orders", element: <OrdersPage /> },
//             { path: "orders/:id", element: <OrderDetail /> },
//             { path: "orders/assign", element: <JobAssignmentPage /> },
//             { path: "user-types", element: <UserTypesPage /> },
//             { path: "feedbacks", element: <FeedbackAdminPage /> },
//             { path: "ratings", element: <RatingsAdminPage /> },
//             { path: "ratings/:id", element: <RatingDetailsPage /> },
//             { path: "payments", element: <PaymentsPage /> },
//             { path: "settings", element: <SettingsPage /> },
//           ],
//         },
//       ],
//     },

//     // 🔓 public auth branch
//     {
//       path: "/auth",
//       element: <Outlet />,
//       children: [{ path: "login", element: <LoginPage /> }],
//     },
//   ]);

// export default Router;



import React, { Suspense } from "react";
import { createBrowserRouter, Outlet, Link } from "react-router-dom";

// Light, reusable fallback (keeps layout stable while chunks load)
const RouteFallback = () => (
  <div className="min-h-[40vh] grid place-items-center p-6">
    <div className="text-center text-gray-600">Loading…</div>
  </div>
);

// Friendlier 404 that uses <Link> (no full reload)
const ErrorFallback = () => (
  <div className="min-h-screen grid place-items-center p-6">
    <div className="max-w-md text-center space-y-3">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-gray-600">
        The page you requested doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Go to Dashboard
      </Link>
    </div>
  </div>
);

// Wrap any branch with Suspense
const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);

const Router = () =>
  createBrowserRouter([
    // ======= PROTECTED APP =======
    {
      path: "/",
      // Protect the entire app branch, but lazy-load the guard
      lazy: async () => {
        const { default: ProtectedRoute } = await import(
          "../middlewares/ProtectedRoute"
        );
        return {
          Component: ({ children }: { children?: React.ReactNode }) =>
            withSuspense(
              // cast to any to avoid type mismatch with ProtectedProps that don't include `children`
              React.createElement(ProtectedRoute as any, null, children)
            ),
        };
      },
      children: [
        {
          // Dashboard layout (shell) — keep this light!
          element: withSuspense(
            // Layout is lazy too
            React.createElement(
              React.lazy(() => import("../layouts/SiteLayout"))
            )
          ),
          errorElement: <ErrorFallback />,
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("../pages/MainDashboard")).default,
              }),
            },
            {
              path: "tracking",
              lazy: async () => ({
                Component: (await import("../pages/TrackingPage")).default,
              }),
            },
            {
              path: "tracking/driver/:id",
              lazy: async () => ({
                Component: (await import("../pages/DriverDetailsPage")).default,
              }),
            },
            {
              path: "parcel-tracking",
              lazy: async () => ({
                Component: (await import("../pages/ParcelTrackingPage")).default,
              }),
            },
            {
              path: "orders",
              lazy: async () => ({
                Component: (await import("../pages/OrdersPage")).default,
              }),
            },
            {
              path: "orders/:id",
              lazy: async () => ({
                Component: (await import("../components/orders/OrderDetail"))
                  .default,
              }),
            },
            {
              path: "orders/assign",
              lazy: async () => ({
                Component: (
                  await import("../components/orders/JobAssignmentPage")
                ).default,
              }),
            },
            {
              path: "user-types",
              lazy: async () => ({
                Component: (await import("../pages/UserTypesPage")).default,
              }),
            },
            {
              path: "feedbacks",
              lazy: async () => ({
                Component: (await import("../pages/FeedbackAdminPage")).default,
              }),
            },
            {
              path: "ratings",
              lazy: async () => ({
                Component: (await import("../pages/RatingsAdminPage")).default,
              }),
            },
            {
              path: "ratings/:id",
              lazy: async () => ({
                Component: (await import("../pages/RatingDetailsPage")).default,
              }),
            },
            {
              path: "payments",
              lazy: async () => ({
                Component: (await import("../pages/PaymentPage")).default,
              }),
            },
            {
              path: "settings",
              lazy: async () => ({
                Component: (await import("../pages/Settings")).default,
              }),
            },

            // Catch-all inside the layout
            { path: "*", element: <ErrorFallback /> },
          ],
        },
      ],
    },

    // ======= PUBLIC AUTH =======
    {
      path: "/auth",
      element: withSuspense(<Outlet />),
      children: [
        {
          path: "login",
          lazy: async () => ({
            Component: (await import("../pages/Auth/Login")).default,
          }),
        },
      ],
    },

    // ======= GLOBAL CATCH-ALL =======
    { path: "*", element: <ErrorFallback /> },
  ]);

export default Router;
