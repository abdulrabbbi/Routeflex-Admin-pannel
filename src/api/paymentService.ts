import apiClient from "../api/api";

export type PaymentFilter = "daily" | "weekly" | "monthly" | "yearly";

export interface PaymentReport {
  sequence: string;
  driverId: string;
  deliveryId: string;
  driver: string;
  deliveryStatus: string;
  paymentReceived: string; // "Pending" | "Received"
  amount: number;
  driverEarnings: number;
  platformFee: number;
  completedAt: string;
}

export const fetchPaymentReport = async (
  page: number = 1,
  limit: number = 10,
  filter: PaymentFilter = "monthly"
): Promise<PaymentReport[]> => {
  try {
    const response = await apiClient.get("/deliveries/payment-report", {
      params: { page, limit, filter },
    });
    return response.data?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch payment report", error);
    return [];
  }
};

export interface PaymentStats {
  filter?: string;
  parcelsOnMove: { current: number; total: number };
  paymentReceived: { current: number; total: number };
  driversPendingPayment: { current: number; total: number };
  // backend may send either "inRange" (your new response) or "last7Days" (older)
  inRange?: { completedParcels: number; totalPayments: number; activeDrivers: number };
  last7Days?: { completedParcels: number; totalPayments: number; activeDrivers: number };
}

export const fetchPaymentStats = async (
  filter: PaymentFilter = "monthly"
): Promise<PaymentStats | null> => {
  try {
    const response = await apiClient.get("/deliveries/payment-stats", {
      params: { filter },
    });
    return response.data?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch payment stats", error);
    return null;
  }
};
