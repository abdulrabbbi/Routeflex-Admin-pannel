import React, { Suspense } from "react";
import { createBrowserRouter, Outlet, Link } from "react-router-dom";

// Lightweight fallback while chunks load
const RouteFallback = () => (
  <div className="min-h-[40vh] grid place-items-center p-6">
    <div className="text-center text-gray-600">Loading…</div>
  </div>
);

// 404 that uses <Link> (no full reload)
const ErrorFallback = () => (
  <div className="min-h-screen grid place-items-center p-6">
    <div className="max-w-md text-center space-y-3">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-gray-600">The page you requested doesn't exist or has moved.</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Go to Dashboard
      </Link>
    </div>
  </div>
);

// Wrap any element branch with Suspense
const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);

const Router = () =>
  createBrowserRouter([
    // ======= PROTECTED APP =======
    {
      path: "/",
      // Lazy-load the auth guard itself
      lazy: async () => {
        const { default: ProtectedRoute } = await import("../middlewares/ProtectedRoute");
        return {
          Component: ({ children }: { children?: React.ReactNode }) =>
            withSuspense(React.createElement(ProtectedRoute as any, null, children)),
        };
      },
      children: [
        {
          // App shell/layout — keep light; it’s lazy too
          element: withSuspense(React.createElement(React.lazy(() => import("../layouts/SiteLayout")))),
          errorElement: <ErrorFallback />,
          children: [
            // Dashboard (index)
            {
              index: true,
              lazy: async () => ({
                Component: (await import("../pages/MainDashboard")).default,
              }),
            },

            // Tracking
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
              path: "tracking/driver/:id/profile/overview",
              lazy: async () => ({
                Component: (await import("../pages/DriverProfile")).default,
              }),
            },

            // Drivers admin
            {
              path: "pending-drivers",
              lazy: async () => ({
                Component: (await import("../components/drivers/PendingDriverTable")).default,
              }),
            },
            {
              path: "banned-drivers",
              lazy: async () => ({
                Component: (await import("../components/drivers/BannedDriversTable")).default,
              }),
            },

            // Parcel tracking + subroutes
            {
              path: "parcel-tracking",
              lazy: async () => ({
                Component: (await import("../pages/ParcelTrackingPage")).default,
              }),
            },
            {
              path: "parcel-tracking/completed",
              lazy: async () => ({
                Component: (await import("../components/deliveries/CompletedDeliveries")).default,
              }),
            },
            {
              path: "parcel-tracking/cancelled",
              lazy: async () => ({
                Component: (await import("../components/deliveries/CancelledDeliveries")).default,
              }),
            },

            // Orders
            {
              path: "orders",
              lazy: async () => ({
                Component: (await import("../pages/OrdersPage")).default,
              }),
            },
            {
              path: "pending-assignments",
              lazy: async () => ({
                Component: (await import("../components/orders/PendingOrder")).default,
              }),
            },
            {
              path: "ongoing-order",
              lazy: async () => ({
                Component: (await import("../components/orders/ProgressOrder")).default,
              }),
            },
            {
              path: "orders/assign",
              lazy: async () => ({
                Component: (await import("../components/orders/JobAssignmentPage")).default,
              }),
            },

            // User types (pass props to lazy component)
            {
              path: "user-types/individual",
              lazy: async () => {
                const mod = await import("../pages/UserTypesPage");
                const Page = mod.default;
                return {
                  Component: () => <Page role="individual" title="Individual Users" />,
                };
              },
            },
            {
              path: "user-types/business",
              lazy: async () => {
                const mod = await import("../pages/UserTypesPage");
                const Page = mod.default;
                return {
                  Component: () => <Page role="business" title="Business Users" />,
                };
              },
            },

            // Feedback & ratings
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

            // Payments & settings
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

            // Catch-all inside the shell
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
