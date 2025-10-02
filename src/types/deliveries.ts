export type RangeFilter = "daily" | "weekly" | "monthly";

export interface Delivery {
  deliveryId: string;
  driverId: string;
  driverFullName: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  deliveryStatus: string;
  paymentStatus?: string;
  distance?: number; // km
  packageCategory?: string;
}

export interface DeliveriesApiResponse {
  status?: string;
  total?: number;
  results?: number;
  page?: number;
  totalPages?: number;
  data: {
    deliveries: Delivery[];
    totalPages?: number;
    total?: number;
  };
}
