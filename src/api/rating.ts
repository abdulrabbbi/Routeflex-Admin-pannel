import apiClient from "./api";

export interface RatingRow {
  _id: string;
  score: number;
  commentsPreview?: string;      // ← matches your list payload
  comments?: string;             // detail pages may use full comments
  isAnonymous?: boolean;
  hasResponse?: boolean;
  createdAt: string;
  fromUser?: { _id: string; email?: string } | string | null;
  toUser?: { _id: string; email?: string } | string | null;
  delivery?: { _id: string; status?: string } | null;
}

export interface RatingsListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  sort?: string;
}

export async function getAllRatings(params: {
  page?: number;
  limit?: number;
  minScore?: number;
  maxScore?: number;
  q?: string;
  sort?: string;
}) {
  const { page = 1, limit = 10, minScore, maxScore, q, sort } = params || {};

  const res = await apiClient.get<{
    status: "success";
    meta: RatingsListMeta;
    data: RatingRow[];           // ← array at top level
  }>("/ratings", {
    params: {
      page,
      limit,
      ...(minScore ? { minScore } : {}),
      ...(maxScore ? { maxScore } : {}),
      ...(q ? { q } : {}),
      ...(sort ? { sort } : {}),
    },
  });

  // Normalize what the hook expects
  const items: RatingRow[] = Array.isArray(res.data.data) ? res.data.data : [];
  const meta: RatingsListMeta = res.data.meta;

  return { items, meta };
}

export async function getRatingById(id: string) {
  // keep flexible in case detail returns {data:{rating}} or {data:rating}
  const res = await apiClient.get<any>(`/ratings/${id}`);
  const maybe = res.data?.data ?? res.data;
  return maybe?.rating ?? maybe; // returns a single rating object
}

export async function deleteRating(id: string) {
  await apiClient.delete(`/ratings/${id}`);
}
