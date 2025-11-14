import apiClient from "./api";
import {
  DeliveriesApiResponse,
  RangeFilter,
  TrackOrderResponse,
} from "../types/deliveries";

export type RangeType = "daily" | "weekly" | "monthly";

export interface GetParcelReportsParams {
  range?: RangeType;
  page?: number;
  limit?: number;
  deliveredPage?: number;
  deliveredLimit?: number;
  inProgressPage?: number;
  inProgressLimit?: number;
}

export const getParcelReports = async (params: GetParcelReportsParams = {}) => {
  const {
    range = "daily",
    page,
    limit,
    deliveredPage,
    deliveredLimit,
    inProgressPage,
    inProgressLimit,
  } = params;

  const response = await apiClient.get(`/deliveries/parcel-reports`, {
    params: {
      range,
      page,
      limit,
      deliveredPage,
      deliveredLimit,
      inProgressPage,
      inProgressLimit,
    },
  });

  return response.data;
};

export type Role = "individual" | "business";

export interface BaseUser {
  _id?: string;
  id?: string;
  email?: string;
  profilePicture?: string;
  role?: Role;
  isVerified?: boolean;
  phone?: string;
  createdAt?: string;
}

export interface BusinessUser extends BaseUser {
  businessName?: string;
  contactPerson?: string;
}

export interface IndividualUser extends BaseUser {
  fullName?: string;
}

export interface UsersResponse<T = BaseUser> {
  status?: string;
  results?: number;
  page?: number;
  totalPages?: number;
  data?: { users?: T[] };
}

/** Generic fetcher for any role (used by the page) */
export const getUsersByRole = async <T extends BaseUser = BaseUser>(
  role: Role,
  limit: number = 10,
  page: number = 1
): Promise<UsersResponse<T>> => {
  const { data } = await apiClient.get<UsersResponse<T>>(`/users`, {
    params: { role, limit, page },
  });
  return data;
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
// pending drivers
export const getPendingDrivers = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await apiClient.get(`/users/drivers/pending`, {
      params: { page, limit, emailVerified: false },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get active driver
export const getActiveDriver = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiClient.get(`/users/drivers/active`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDriverById = async (id: string) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
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

export const getDriverTracking = async (driverTrackingId: string) => {
  try {
    const response = await apiClient.get(`/deliveries/driver-tracking`, {
      params: { driverTrackingId },
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getDeliveries = async (
  limit: number = 10,
  page: number = 1,
  range: RangeFilter = "daily",
  status?: "completed" | "cancelled"
): Promise<DeliveriesApiResponse> => {
  const { data } = await apiClient.get<DeliveriesApiResponse>(
    `/deliveries/deliveries`,
    { params: { limit, page, range, status } }
  );
  return data;
};

export const deleteDelivery = async (deliveryId: string) => {
  return await apiClient.delete(`/deliveries/${deliveryId}`);
};

// ✅  for in-progress delivery list
export const getInProgressDeliveries = async (
  limit: number = 10,
  page: number = 1
): Promise<DeliveriesApiResponse> => {
  const { data } = await apiClient.get<DeliveriesApiResponse>(
    `/deliveries/deliveries/in-progress`,
    { params: { limit, page } }
  );
  return data;
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

export const getTrackOrder = async (deliveryId: string) => {
  const { data } = await apiClient.get<TrackOrderResponse>(
    `/deliveries/track-order/${deliveryId}`
  );
  return data.data;
};

export const getNotifications = async (
  limit: number = 10,
  page: number = 1
) => {
  try {
    const response = await apiClient.get(`/notifications`, {
      params: {
        limit,
        page,
      },
    });
    return response.data.data.notifications;
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("Failed to mark notification as read", error);
    throw error;
  }
};

// approve driver
export const approveDriver = async (id: string) => {
  try {
    const response = await apiClient.patch(`/users/drivers/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// reject driver
export const rejectDriver = async (id: string, reason?: string) => {
  try {
    const response = await apiClient.patch(`/users/drivers/${id}/reject`, {
      reason, // optional: include a rejection reason if your backend accepts it
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// banned Driver
export const getBannedDrivers = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(`/users/drivers/banned`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
