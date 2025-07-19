"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import RouteForm from "../components/RouteForm";
import OrderDetails from "../components/OrderDetails";
import ExistingRoutes from "../components/ExistingRoute";
import RouteListingMap from "../components/Maps/RouteListingMap";
import { createBusinessRoute, getAdminRoutes } from "../api/routeService";
import { toast } from "react-toastify";
import polyline from "@mapbox/polyline";

interface Address {
  street: string;
  city: string;
  postCode: string;
  country: string;
}

interface RoutePayload {
  startLocation: {
    address: Address;
    description: string;
  };
  endLocations: {
    address: string;
    description: string;
  }[];
  pickupTime: string;
  deliveryTime: string;
  packageType: string;
  packageCategory: string;
  packageSize: string;
  packageWeight: number;
}

interface ApiResponse {
  status: string;
  results: number;
  data: {
    routes: {
      pickupLocation: string;
      pickupTime: string;
      deliveryLocations: string[];
      deliveredAt: string;
      polyline?: string;
      startLocation?: {
        coordinates: [number, number];
      };
      endLocations?: Array<{
        location: {
          coordinates: [number, number];
        };
      }>;
    }[];
  };
}

interface FormattedRoute {
  id: number;
  pickup: {
    location: string;
    time: string;
  };
  delivery: {
    locations: string[];
    time: string;
  };
}

interface MapRouteData {
  polyline: [number, number][];
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}

const DEFAULT_MAP_ROUTES: [number, number][][] = [
  [
    [33.5973, 73.0479],
    [33.5985, 73.0493],
    [33.6001, 73.051],
  ],
];

const DEFAULT_START_LOCATION = { lat: 33.5973, lng: 73.0479 };
const DEFAULT_END_LOCATION = { lat: 33.6001, lng: 73.051 };

const RouteListing = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [showLoadMore, setShowLoadMore] = useState(true);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState({
    address: {
      street: "",
      city: "",
      postCode: "",
      country: "",
    },
    description: "",
    pickupDate: "",
    pickupTime: "",
  });

  const [endLocations, setEndLocations] = useState([
    { address: "", description: "Delivery 1" },
  ]);

  const [mapRouteData, setMapRouteData] = useState<MapRouteData | null>(null);
  const [orderDetails, setOrderDetails] = useState({
    packageType: "Box",
    packageCategory: "Electronics",
    packageSize: "",
    packageWeight: 1,
  });

  const fetchRoutes = useCallback(async () => {
    try {
      const isInitialLoad = apiResponse === null;
      if (isInitialLoad) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await getAdminRoutes(10, page); // Explicitly set limit to 10
      setApiResponse(response);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      setError("Failed to fetch routes. Please try again.");
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const loadMoreRoutes = useCallback(() => {
    if (apiResponse && apiResponse.data.routes.length < apiResponse.results) {
      setPage((prev) => prev + 1);
    }
  }, [apiResponse]);

  const formattedRoutes = useMemo<FormattedRoute[]>(() => {
    if (!apiResponse?.data?.routes) return [];
    return apiResponse.data.routes.map((route, index) => ({
      id: index + 1,
      pickup: {
        location: route.pickupLocation || "Unknown pickup location",
        time: route.pickupTime
          ? new Date(route.pickupTime).toLocaleString()
          : "Unknown time",
      },
      delivery: {
        locations: Array.isArray(route.deliveryLocations)
          ? route.deliveryLocations
          : [],
        time: route.deliveredAt
          ? new Date(route.deliveredAt).toLocaleString()
          : "Not delivered yet",
      },
    }));
  }, [apiResponse]);

  const handleNextPage = () => {
    if (apiResponse && apiResponse.data.routes.length === 10) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const isFirstPage = page === 1;
  const isLastPage = apiResponse
    ? apiResponse.data.routes.length < 10 ||
      apiResponse.data.routes.length >= apiResponse.results
    : true;

  const currentMapData = useMemo(() => {
    if (mapRouteData) {
      return {
        routes: [mapRouteData.polyline],
        startLocation: mapRouteData.start,
        endLocation: mapRouteData.end,
      };
    }
    return {
      routes: DEFAULT_MAP_ROUTES,
      startLocation: DEFAULT_START_LOCATION,
      endLocation: DEFAULT_END_LOCATION,
    };
  }, [mapRouteData]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!pickupLocation.pickupDate || !pickupLocation.pickupTime) {
        throw new Error("Please enter both pickup date and time.");
      }

      const combinedDateTime = new Date(
        `${pickupLocation.pickupDate}T${pickupLocation.pickupTime}:00Z`
      );

      if (isNaN(combinedDateTime.getTime())) {
        throw new Error("Invalid pickup date or time.");
      }

      const payload: RoutePayload = {
        startLocation: {
          address: pickupLocation.address,
          description: pickupLocation.description,
        },
        endLocations,
        pickupTime: combinedDateTime.toISOString(),
        deliveryTime: new Date(
          combinedDateTime.getTime() + 3 * 60 * 60 * 1000
        ).toISOString(),
        ...orderDetails,
      };

      const response = await createBusinessRoute(payload);
      const route = response.data.route;

      if (
        route.polyline &&
        route.startLocation?.coordinates &&
        route.endLocations?.[0]?.location.coordinates
      ) {
        const decodedPolyline = polyline.decode(route.polyline);
        const startCoords = route.startLocation.coordinates;
        const lastEndCoords = route.endLocations.at(-1)?.location.coordinates;

        setMapRouteData({
          polyline: decodedPolyline,
          start: { lat: startCoords[1], lng: startCoords[0] },
          end: { lat: lastEndCoords[1], lng: lastEndCoords[0] },
        });
      }

      toast.success("Route created successfully");
      setPage(1);
      await fetchRoutes();

      setPickupLocation((prev) => ({
        ...prev,
        address: {
          street: "",
          city: "",
          postCode: "",
          country: "",
        },
        pickupDate: "",
        pickupTime: "",
      }));
      setEndLocations([{ address: "", description: "First delivery" }]);
    } catch (err: any) {
      console.error("Error creating route:", err);
      const errorMessage =
        err?.response?.data?.message || err.message || "Error creating route";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [pickupLocation, endLocations, orderDetails, fetchRoutes]);

  const showLoadMore = useMemo(() => {
    return apiResponse && apiResponse.data.routes.length < apiResponse.results;
  }, [apiResponse]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <span className="loader mr-2"></span>
        <span>Loading routes...</span>
      </div>
    );
  }

  if (error && (!apiResponse || !apiResponse.data.routes.length)) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="text-red-500 text-center mb-4">
          <p className="text-xl font-semibold">Error loading routes</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => {
            setPage(1);
            fetchRoutes();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <span className="loader mr-2"></span>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-[#1e1e38]">Route Listing</h1>

        <div className="w-full">
          <RouteListingMap
            routes={currentMapData.routes}
            startLocation={currentMapData.startLocation}
            endLocation={currentMapData.endLocation}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <div className="space-y-8">
            <div className="space-y-8 w-full">
              <RouteForm
                pickupLocation={pickupLocation}
                deliveryLocations={endLocations}
                setPickupLocation={setPickupLocation}
                setDeliveryLocations={setEndLocations}
              />
              <OrderDetails
                orderDetails={orderDetails}
                setOrderDetails={setOrderDetails}
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-[30%] ml-auto mr-auto py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting && <span className="loader mr-2"></span>}
                {isSubmitting ? "Submitting..." : "Submit Route"}
              </button>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}

              <div className="bg-white rounded-lg shadow p-6">
                <div className="max-h-[70vh] overflow-y-auto mb-4">
                  <ExistingRoutes routes={formattedRoutes} />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={isFirstPage || isInitialLoading}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isFirstPage || isInitialLoading
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#22c55e] text-white hover:bg-[#1ea550]"
                    } transition-colors`}
                  >
                    <FiChevronLeft className="mr-2" />
                    Previous
                  </button>

                  <div className="text-sm text-gray-600">
                    Page {page} • Showing {apiResponse?.data.routes.length} of{" "}
                    {apiResponse?.results} routes
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={isLastPage || isInitialLoading}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isLastPage || isInitialLoading
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#22c55e] text-white hover:bg-[#1ea550]"
                    } transition-colors`}
                  >
                    Next
                    <FiChevronRight className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteListing;
