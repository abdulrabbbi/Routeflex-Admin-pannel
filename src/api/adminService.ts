import apiClient from "./api";

export type Role = "admin" | "business" | "driver" | "individual";

export type RoleCount = {
  role: Role;
  count: number;
};

export type SystemStatsResponse = {
  status: "success";
  data: {
    totalUsers: number;
    rolesCount: RoleCount[];
  };
};

export const getSystemStats = async (): Promise<
  SystemStatsResponse["data"]
> => {
  const { data } = await apiClient.get<SystemStatsResponse>(
    "/admin/stats/system"
  );
  // normalize (defensive)
  return {
    totalUsers: data?.data?.totalUsers ?? 0,
    rolesCount: Array.isArray(data?.data?.rolesCount)
      ? data.data.rolesCount
      : [],
  };
};

/** Generic fetcher for any role (you asked for this shape) */
export type BaseUser = { _id: string; email?: string; role: Role };
export type UsersResponse<T extends BaseUser = BaseUser> = {
  page: number;
  totalPages: number;
  data: { users: T[] };
  status?: string;
  results?: number;
};

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


// ---- Orders Overview ----
export type OrdersOverviewPoint = {
  date: string;         // "YYYY-MM-DD"
  dow: "Sun"|"Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat";
  completed: number;
  inProgress: number;
  cancelled: number;
};

export type OrdersOverviewData = {
  summary: { completed: number; inProgress: number; cancelled: number };
  series: OrdersOverviewPoint[];
};

export type OrdersOverviewParams = {
  days?: number;         // e.g. 7 | 30 | 90 | 180
  driver?: string;       // ObjectId
  business?: string;     // ObjectId
};

export const getOrdersOverview = async (
  params: OrdersOverviewParams = {}
): Promise<OrdersOverviewData> => {
  const { data } = await apiClient.get<{ status: "success"; data: OrdersOverviewData }>(
    "/admin/stats/orders-overview",
    { params }
  );
  return data.data;
};



export type FeedbackBuckets = { [stars: string]: number }; // "1"..."5"

export type FeedbackPayload = {
  total: number;
  buckets: FeedbackBuckets;
  percentages: { positive: number; neutral: number; negative: number };
  stars: { stars: 1|2|3|4|5; count: number }[];
};

export async function getFeedbackStats(): Promise<FeedbackPayload> {
  const { data } = await apiClient.get<{ status: string; data: FeedbackPayload }>(
    "/admin/stats/feedback"
  );
  return data.data;
}



export type TopDriver = {
  id: string;
  name: string;
  rating: number;
  ratingCount: number;
  verified: boolean;
  profilePicture: string | null;
  joinedAt?: string;
};

export type TopDriversResponse = {
  status: string;
  data: {
    drivers: TopDriver[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
};

export type GetTopDriversParams = {
  page?: number;
  limit?: number;
  minRating?: number;
  verified?: boolean;
  search?: string;
  sort?: "rating" | "count" | "recent";
};

export async function getTopDrivers(params: GetTopDriversParams = {}) {
  const { data } = await apiClient.get<TopDriversResponse>(
    "/admin/stats/top-drivers",
    { params }
  );
  return data.data;
}



export type RevenuePoint = {
  ym: string;        // "YYYY-MM"
  month: string;     // "Jan"
  revenue: number;
  completed: number;
  cancelled: number;
  total: number;
  successRate: number; // 0..1
};

export type RevenueTrendData = {
  summary: {
    thisMonthRevenue: number;
    avgOrderValue: number;
    successRate: number; // 0..1
  };
  series: RevenuePoint[];
};

export async function getRevenueTrend(params: {
  months?: number;           // 1..24
  business?: string;
  driver?: string;
}) {
  const { data } = await apiClient.get<{ status: string; data: RevenueTrendData }>(
    "/admin/stats/revenue-trend",
    { params }
  );
  return data.data;
}


// --- types
export type BusinessStats = { count: number; verified: number; pending: number };
export type CustomerStats = { count: number; verified: number };

// --- calls
export const getBusinessStats = async (): Promise<BusinessStats> => {
  const { data } = await apiClient.get<{ status: string; data: BusinessStats }>(
    "/admin/stats/businesses"
  );
  return data.data;
};

export const getCustomerStats = async (): Promise<CustomerStats> => {
  const { data } = await apiClient.get<{ status: string; data: CustomerStats }>(
    "/admin/stats/customers"
  );
  return data.data;
};