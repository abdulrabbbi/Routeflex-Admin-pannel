import apiClient from "../api/api";

export interface PaymentReport {
  sequence: string;
  driverId: string;
  deliveryId: string;
  driver: string;
  deliveryStatus: string;
  paymentReceived: string;
  amount: number;
  driverEarnings: number;
  platformFee: number;
  completedAt: string;
}

export const fetchPaymentReport = async (
  page: number = 1,
  limit: number = 10
): Promise<PaymentReport[]> => {
  try {
    const response = await apiClient.get("/deliveries/payment-report", {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch payment report", error);
    return [];
  }
};
