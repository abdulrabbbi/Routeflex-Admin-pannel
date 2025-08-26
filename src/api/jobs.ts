import apiClient from "./api";

export type JobStatus =
  | "available"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface ListJobsParams {
  page?: number;
  limit?: number;
  status?: string; 
  approvalStatus?: string; 
  q?: string; 
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export const listAdminJobs = async (params: ListJobsParams = {}) => {
  const { page = 1, limit = 10, status, approvalStatus, q } = params;
  const res = await apiClient.get("/jobs/admin/jobs/available", {
    params: { page, limit, status, approvalStatus, q },
  });
  return res.data;
};

export const approveJob = async (jobId: string) => {
  const res = await apiClient.patch(`/jobs/admin/jobs/${jobId}/approve`);
  return res.data?.data?.job ?? res.data?.data ?? res.data;
};

export const rejectJob = async (jobId: string, reason?: string) => {
  const res = await apiClient.patch(`/jobs/admin/jobs/${jobId}/reject`, {
    reason,
  });
  return res.data?.data?.job ?? res.data?.data ?? res.data;
};

export interface Business {
  _id: string;
  name?: string;
  businessName?: string;
  email?: string;
  phone?: string;
}

export interface GuestDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface Address {
  street?: string;
  city?: string;
  postCode?: string;
  country?: string;
}

export interface EndLocation {
  formattedAddress?: string;
  description?: string;
  distanceText?: string;
  durationText?: string;
}

export interface Route {
  _id: string;
  startAddress?: Address;
  pickupTime?: string; // ISO string
  deliveryTime?: string; // ISO string
  endLocations?: EndLocation[];
  business?: Business;
  guestDetails?: GuestDetails;
  price?: number;
  status?: string;
}

export interface Job {
  _id: string;
  route?: Route;
  status: JobStatus;
  approvalStatus: ApprovalStatus;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
}

export const getJobById = async (jobId: string): Promise<Job> => {
  const { data } = await apiClient.get(`/jobs/admin/jobs/${jobId}`);
  const job = data?.data?.job;
  if (!job) throw new Error(data?.message ?? "Job not found");
  return job as Job;
};
