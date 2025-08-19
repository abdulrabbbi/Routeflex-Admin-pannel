// components/ratings/RatingsTable.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiEye,
  FiMessageSquare,
  FiTrash2,
  FiX,
  FiMoreVertical,
} from "react-icons/fi";
import { toast } from "react-toastify";
import apiClient from "../../api/api";
import { type RatingRow } from "../../api/rating";

/* ----------------------------- helpers / atoms ----------------------------- */

function StarRow({ score = 0 }: { score: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          width="16"
          height="16"
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

function fmtDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* ----------------------------- response drawer ----------------------------- */

type ResponseDrawerProps = {
  open: boolean;
  onClose: () => void;
  rating?: RatingRow | null;
  onSubmitted?: () => void | Promise<void>;
};

const ResponseDrawer: React.FC<ResponseDrawerProps> = ({
  open,
  onClose,
  rating,
  onSubmitted,
}) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // reset textarea each time drawer opens
    if (open) setText("");
  }, [open]);

  const title = useMemo(
    () => `Respond to rating ${rating?._id?.slice(-6)?.toUpperCase() ?? ""}`,
    [rating?._id]
  );

  const handleSubmit = async () => {
    if (!rating?._id || !text.trim()) {
      toast.warn("Please enter a response.");
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post(`/ratings/${rating._id}/response`, {
        message: text.trim(),
      });
      toast.success("Response sent.");
      onClose();
      await onSubmitted?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to send response.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const from =
    typeof rating?.fromUser === "string"
      ? rating?.fromUser
      : rating?.fromUser?.email || (rating?.fromUser as any)?._id || "-";

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <FiX />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="text-sm">
            <div className="text-gray-500">From</div>
            <div className="text-gray-800 break-all">{from}</div>
          </div>

          <div className="text-sm">
            <div className="text-gray-500">Score</div>
            <StarRow score={rating?.score || 0} />
          </div>

          <div className="text-sm">
            <div className="text-gray-500">Comment</div>
            <div className="text-gray-800 whitespace-pre-wrap">
              {rating?.commentsPreview || (rating as any)?.comments || "-"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Your response
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a helpful, professional response…"
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Your response may be visible to the user.
            </p>
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className={clsx(
              "inline-flex items-center rounded-lg px-3 py-2 text-sm text-white",
              submitting || !text.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {submitting ? "Sending…" : "Send response"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- table --------------------------------- */

type RatingsTableProps = {
  items?: RatingRow[];
  loading?: boolean;
  onRefresh?: () => void | Promise<void>;
};

export default function RatingsTable({
  items = [],
  loading,
  onRefresh,
}: RatingsTableProps) {
  const [openFor, setOpenFor] = useState<RatingRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // close any open menu on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!tableRef.current) return;
      if (!tableRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this rating? This cannot be undone.");
    if (!ok) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`/ratings/${id}`);
      toast.success("Rating deleted.");
      setMenuOpenId(null);
      await onRefresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete rating.");
    } finally {
      setDeletingId(null);
    }
  };

  const headers = [
    "ID#",
    "Score",
    "Comments",
    "From",
    "To",
    "Delivery",
    "Status",
    "Created",
    "Actions",
  ];

  return (
    <div ref={tableRef} className="overflow-x-auto">
      <table className="min-w-[1000px] w-full">
        <thead>
          <tr className="bg-[#f0fdf4]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-sm font-medium text-[#22c55e] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* Loading skeleton */}
        {loading ? (
          <tbody>
            {Array.from({ length: 6 }).map((_, r) => (
              <tr key={r} className="border-b">
                {Array.from({ length: headers.length }).map((__, c) => (
                  <td key={c} className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : items.length === 0 ? (
          <tbody>
            <tr>
              <td
                colSpan={headers.length}
                className="py-10 text-center text-gray-500"
              >
                No ratings found.
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="divide-y divide-gray-100">
            {items.map((r) => {
              const idShort = r._id?.slice(-6)?.toUpperCase() || "-";
              const created = fmtDate(r.createdAt);
              const from =
                typeof r.fromUser === "string"
                  ? r.fromUser
                  : r.fromUser?.email || (r.fromUser as any)?._id || "-";
              const to =
                typeof r.toUser === "string"
                  ? r.toUser
                  : r.toUser?.email || (r.toUser as any)?._id || "-";
              const deliveryId = r.delivery?._id || "-";
              const deliveryStatus = r.delivery?.status || "-";
              const comment = r.commentsPreview || (r as any).comments || "-";
              const menuOpen = menuOpenId === r._id;

              return (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-[#1e1e38] font-mono">
                    {idShort}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StarRow score={r.score} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1e1e38]">
                    <div className="line-clamp-2 max-w-[380px]">{comment}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1e1e38]">
                    <div className="line-clamp-1 break-all">{from}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1e1e38]">
                    <div className="line-clamp-1 break-all">{to}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{deliveryId}</td>
                  <td className="px-6 py-4 text-sm text-[#1e1e38]">
                    {deliveryStatus}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {created}
                  </td>

                  {/* Actions with 3-dots menu */}
                  <td className="px-6 py-4 text-sm relative">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpen ? null : (r._id as string))
                      }
                      className="inline-flex items-center rounded-md border px-2 py-1.5 hover:bg-gray-50"
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      aria-label="More actions"
                    >
                      <FiMoreVertical />
                    </button>

                    {menuOpen && (
                      <div
                        role="menu"
                        className="absolute right-6 mt-2 w-44 rounded-lg border bg-white shadow-lg ring-1 ring-black/5 z-10"
                      >
                        <Link
                          to={`/ratings/${r._id}`}
                          onClick={() => setMenuOpenId(null)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          role="menuitem"
                        >
                          <FiEye /> View
                        </Link>
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            setOpenFor(r);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          role="menuitem"
                        >
                          <FiMessageSquare /> Respond
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          disabled={deletingId === r._id}
                          className={clsx(
                            "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                            deletingId === r._id
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-50"
                          )}
                          role="menuitem"
                        >
                          <FiTrash2 />
                          {deletingId === r._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </table>

      {/* Respond drawer */}
      <ResponseDrawer
        open={!!openFor}
        onClose={() => setOpenFor(null)}
        rating={openFor}
        onSubmitted={onRefresh}
      />
    </div>
  );
}
