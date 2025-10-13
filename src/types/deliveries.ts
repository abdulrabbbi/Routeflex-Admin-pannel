export type RangeFilter =
  | "daily"
  | "weekly"
  | "monthly"
  | "six_months"  
  | "yearly";

export interface DeliveryRowApi {
  parcelId: string;
  driverId: string | null;
  driverName: string;
  status: "completed" | string;
  payment: "pending" | "paid" | string;
  distance: number;
  package: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  completedAt?: string | null;
}

export interface DeliveriesApiResponse {
  status?: string;
  total?: number;
  results?: number;
  page?: number;
  totalPages?: number;
  data: {
    deliveries: DeliveryRowApi[];
  };
}

/** Track order (drawer) */
export interface TrackOrderResponse {
  status: "success";
  data: {
    orderNumber: string;
    parcelPickedBy: string;
    currentTaskDetails: {
      pickupLocation: string;
      pickupTime: string;         // "HH:mm"
      deliveryLocation: string;
      deliveryTime: string;       // "HH:mm"
    };
    prices: {
      routePrice: number | null;
      routeListPrice: number | null;
      driverEarnings: number | null;
      platformFee: number | null;
    };
    delivery: {
      _id: string;
      job: string;
      business: string;
      status: string;
      paymentStatus: string;
      createdAt: string;
      updatedAt: string;
      completedAt?: string;
      packages: any[];
      scans: any[];
      liveEnabled: boolean;
      liveLocation: any;
      lastKnownLocation: any;
      locationHistory: Array<{
        type: "Point";
        coordinates: [number, number];
        at?: string;
      }>;
      photos?: {
        startDriverPhoto?: string;
        startParcelPhoto?: string;
        endDriverPhoto?: string;
        proofPhoto?: string;
      };
    };
    driver: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      profilePicture?: string;
      trackingId?: string;
    };
    route: {
      _id: string;
      price: number | null;
      distance: number;
      pickupTime?: string;
      deliveryTime?: string;
      start: {
        address?: {
          street?: string;
          city?: string;
          postCode?: string;
          country?: string;
        };
        description?: string;
        location?: { type: "Point"; coordinates: [number, number] };
      };
      stops: Array<{
        location?: { type: "Point"; coordinates: [number, number] };
        formattedAddress?: string;
        description?: string;
        distanceText?: string;
        durationText?: string;
        distanceValue?: number;
        durationValue?: number;
        received?: boolean;
      }>;
      polyline?: string;
      package?: {
        type?: string;
        category?: string;
        size?: string;
        weight?: number;
      };
      isEmergency?: boolean;
      status?: string;
      qrCode?: string;
      timestamps?: {
        startedAt?: string;
        completedAt?: string;
        createdAt?: string;
        updatedAt?: string;
      };
    };
  };
}
