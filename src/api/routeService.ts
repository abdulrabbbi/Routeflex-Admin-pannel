import apiClient from "./api";
import { CreateBusinessRoutePayload } from "../types/route";

export const createBusinessRoute = async (
  payload: CreateBusinessRoutePayload
) => {
  try {
    const response = await apiClient.post("/routes/business/routes", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdminRoutes = async (
  limit: number = 10,
  page: number = 1
) => {
  try {
     const response = await apiClient.get(`/routes/admin/routes`, {
    params: { limit, page },
  });
    return response.data;
  } catch (error) {
    throw error;
  }
};
