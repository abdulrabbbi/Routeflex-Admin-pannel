import apiClient from "./api";

export type FeedbackType = "bug" | "feature" | "service" | "payment" | "delivery" | "other";

export type UserRef =
  | string
  | {
      _id: string;
      email?: string;
      role?: string;
      name?: string;
      firstName?: string;
      lastName?: string;
    };

export interface FeedbackMeta {
  userAgent?: string;
  appVersion?: string;
  any?: any;
}

export interface Feedback {
  _id: string;
  user?: UserRef;
  type: FeedbackType;
  subject: string;
  message: string;
  rating?: number;
  name?: string;
  email?: string;
  pagePath?: string;
  meta?: FeedbackMeta;
  createdAt: string;
}

export interface GetAllFeedbackResponse {
  status: "success";
  results: number;
  page: number;
  totalPages: number;
  data: { feedback: Feedback[]; meta?: any };
}

export async function getAllFeedback(params: {
  page?: number;
  limit?: number;
  type?: FeedbackType | "all";
  rating?: number;
  q?: string;
  sort?: string;
}) {
  const { page = 1, limit = 10, type, rating, q, sort } = params || {};
  const res = await apiClient.get<GetAllFeedbackResponse>("/feedback", {
    params: {
      page,
      limit,
      ...(type && type !== "all" ? { type } : {}),
      ...(rating ? { rating } : {}),
      ...(q ? { q } : {}),
      ...(sort ? { sort } : {}),
    },
  });
  return res.data;
}

export async function getFeedbackById(id: string) {
  const res = await apiClient.get<{ status: "success"; data: { feedback: Feedback } }>(`/feedback/${id}`);
  return res.data.data.feedback;
}

export async function deleteFeedback(id: string) {
  await apiClient.delete(`/feedback/${id}`);
}
