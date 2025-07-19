import apiClient from "./api";

export const getParcelReports = async () => {
  try {
    const response = await apiClient.get("/deliveries/parcel-reports");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDrivers = async (limit: number = 10, page: number = 1) => {
  try {
    const response = await apiClient.get(`/users`, {
      params: { role: "driver", limit, page },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDriver = async (id: string) => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    throw error;
  }
};

export const verifyDriverDocs = async (id: string) => {
  try {
    await apiClient.patch(`/support/drivers/${id}/verify-docs`);
  } catch (error) {
    throw error;
  }
};

export const getDriverTracking = async (driverId: string) => {
  try {
    const response = await apiClient.get(`/deliveries/driver-tracking`, {
      params: { driverId },
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getDeliveries = async (limit: number = 10, page: number = 1) => {
  try {
    const response = await apiClient.get(`/deliveries/deliveries`, {
      params: {
        limit,
        page,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDelivery = async (deliveryId: string) => {
  return await apiClient.delete(`/deliveries/${deliveryId}`);
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string> => {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  const data = await res.json();
  return (
    data.city ||
    data.locality ||
    data.principalSubdivision ||
    "Unknown Location"
  );
};

export const getParcelTracking = async (orderId: string) => {
  try {
    const response = await apiClient.get(`/deliveries/track-order/${orderId}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
