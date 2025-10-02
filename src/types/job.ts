export type JobStatus = "available" | "accepted" | "in-progress" | "completed" | "cancelled";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Job = {
  _id: string;
  status: JobStatus;
  approvalStatus?: ApprovalStatus;
  createdAt?: string;
  route?: {
    _id: string;
    price?: number;           // currency
    distance?: number;        // km
    business?: { email?: string } | null;
    pickupTime?: string;
    deliveryTime?: string;
    polyline?: string;
  };
};
