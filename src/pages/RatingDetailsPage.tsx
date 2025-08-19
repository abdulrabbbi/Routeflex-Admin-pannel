// pages/RatingDetailsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRatingById, type RatingRow } from "../api/rating";
import { FaArrowLeft } from "react-icons/fa";

function StarRow({ score = 0 }: { score: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill={n <= score ? "#f59e0b" : "none"}
          stroke="#f59e0b"
        >
          <path
            strokeWidth="1.5"
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
      ))}
    </div>
  );
}

function fmt(iso?: string) {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

const RatingDetailsPage: React.FC = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState<RatingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await getRatingById(id);
        setRating(r);
      } catch (e: any) {
        setErr(e?.response?.data?.message || "Failed to load rating.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const delivery = (rating as any)?.delivery || null;
  const deliveryId = delivery?._id || "-";
  const deliveryStatus = delivery?.status || "-";
  const deliveryCreated = delivery?.createdAt ? fmt(delivery.createdAt) : "-";

  const fromUserText = useMemo(() => {
    const u = (rating as any)?.fromUser;
    if (!u) return "-";
    if (typeof u === "string") return u;
    return u.email || u._id || "-";
  }, [rating]);

  const toUserText = useMemo(() => {
    const u = (rating as any)?.toUser;
    if (!u) return "-";
    if (typeof u === "string") return u;
    return u.email || u._id || "-";
  }, [rating]);

  const toUserAgg = useMemo(() => {
    const u = (rating as any)?.toUser;
    if (u && typeof u !== "string") {
      return {
        rating: typeof u.rating === "number" ? u.rating : undefined,
        ratingCount: typeof u.ratingCount === "number" ? u.ratingCount : undefined,
      };
    }
    return {};
  }, [rating]);

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (err) return <div className="p-6 text-red-500">{err}</div>;
  if (!rating) return <div className="p-6 text-gray-500">Not found.</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-[#dcfce7] transition-colors"
              aria-label="Go back"
            >
              <FaArrowLeft className="w-5 h-5 text-[#22c55e]" />
            </button>
            <div className="text-xl font-semibold text-[#1e1e38]">Rating Details</div>
          </div>
          <Link
            to="/ratings"
            className="text-sm text-emerald-600 hover:underline"
          >
            Back to ratings
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Left: Rating card */}
          <div className="rounded-xl border p-4">
            <div className="text-sm text-gray-500">Created</div>
            <div className="font-medium">{fmt((rating as any).createdAt)}</div>

            <div className="mt-4">
              <div className="text-sm text-gray-500">Score</div>
              <StarRow score={(rating as any).score || 0} />
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-500">Comments</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {(rating as any).comments || (rating as any).commentsPreview || "-"}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              {(rating as any).isAnonymous ? "Submitted anonymously" : "User visible"}
            </div>
          </div>

          {/* Right: Meta cards */}
          <div className="grid gap-4">
            {/* Delivery */}
            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-500">Delivery</div>
              <div className="font-mono text-sm break-all">{deliveryId}</div>

              <div className="mt-3 text-sm">
                <div className="text-gray-500">Status</div>
                <div className="text-gray-800">{deliveryStatus}</div>
              </div>

              <div className="mt-3 text-sm">
                <div className="text-gray-500">Created</div>
                <div className="text-gray-800">{deliveryCreated}</div>
              </div>

              {deliveryId !== "-" && (
                <div className="mt-4">
                  <Link
                    to={`/parcel-tracking?delivery=${deliveryId}`}
                    className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-white hover:opacity-90 text-sm"
                  >
                    Open delivery
                  </Link>
                </div>
              )}
            </div>

            {/* From / To */}
            <div className="rounded-xl border p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-sm">
                  <div className="text-gray-500">From</div>
                  <div className="text-gray-800 break-all">{fromUserText}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500">To</div>
                  <div className="text-gray-800 break-all">{toUserText}</div>
                </div>
              </div>

              {(toUserAgg as any).rating !== undefined || (toUserAgg as any).ratingCount !== undefined ? (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {"rating" in (toUserAgg as any) && (
                    <div>
                      <div className="text-gray-500">Recipient rating</div>
                      <div className="text-gray-800">{(toUserAgg as any).rating}</div>
                    </div>
                  )}
                  {"ratingCount" in (toUserAgg as any) && (
                    <div>
                      <div className="text-gray-500">Ratings received</div>
                      <div className="text-gray-800">{(toUserAgg as any).ratingCount}</div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer quick actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Link
            to={`/ratings/${(rating as any)._id}`}
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Permalink
          </Link>
          {deliveryId !== "-" && (
            <Link
              to={`/parcel-tracking?delivery=${deliveryId}`}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 text-sm"
            >
              Go to delivery
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingDetailsPage;
