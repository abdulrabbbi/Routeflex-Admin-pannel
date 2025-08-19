import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiDownload, FiRefreshCcw, FiSearch, FiTrash2, FiX, FiEye } from "react-icons/fi";
import { labelForUser } from "../utils/labelForUser";

import {
  Feedback,
  FeedbackType,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
} from "../api/feedbackService";
import {
  EmptyTable,
  Pager,
  RowSkeleton,
  TypeBadge,
  RatingStars,
} from "../components/feedback/Atoms";

type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;

const types: (FeedbackType | "all")[] = ["all", "bug", "feature", "service", "payment", "delivery", "other"];
const ratingOptions: RatingFilter[] = ["all", 5, 4, 3, 2, 1];

const FeedbackAdminPage: React.FC = () => {
  // table state
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  // filters/paging
  const [q, setQ] = useState("");
  const [type, setType] = useState<FeedbackType | "all">("all");
  const [rating, setRating] = useState<RatingFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<10 | 20 | 50>(10);
  const [totalPages, setTotalPages] = useState(1);

  // detail drawer
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Feedback | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllFeedback({
        page,
        limit,
        type,
        rating: rating === "all" ? undefined : rating,
        q: q.trim() || undefined,
        sort: "-createdAt",
      });
      setItems(res.data.feedback || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load feedback.");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type, rating, q]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => load();

  const openDetail = async (id: string) => {
    try {
      const f = await getFeedbackById(id);
      setDetail(f);
      setOpen(true);
    } catch {
      toast.error("Failed to load feedback details.");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this feedback permanently?")) return;
    try {
      setDeletingId(id);
      await deleteFeedback(id);
      toast.success("Feedback deleted.");
      if (items.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        load();
      }
      if (detail?._id === id) {
        setOpen(false);
        setDetail(null);
      }
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    try {
      const headers = ["ID", "Type", "Subject", "Rating", "Name", "Email", "Created At", "Page"];
      const rows = items.map((r) => [
        r._id,
        r.type,
        r.subject?.replace(/\n/g, " ").slice(0, 200),
        r.rating ?? "",
        r.name ?? "",
        r.email ?? "",
        new Date(r.createdAt).toLocaleString(),
        r.pagePath ?? "",
      ]);
      const csv = [headers, ...rows]
        .map((r) =>
          r
            .map((cell) => {
              const s = String(cell ?? "");
              const esc = s.replace(/"/g, '""');
              return /[",\n]/.test(esc) ? `"${esc}"` : esc;
            })
            .join(",")
        )
        .join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.href = URL.createObjectURL(blob);
      a.download = `feedback-page${page}-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("CSV export failed.");
    }
  };

  const table = useMemo(() => items, [items]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg font-semibold text-[#1e1e38]">User Feedback</h1>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search subject/message"
                  className="pl-9 pr-9 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {q && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setQ("")}
                    aria-label="Clear"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {/* Type */}
              <select
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value as any);
                }}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All types" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>

              {/* Rating */}
              <select
                value={String(rating)}
                onChange={(e) => {
                  setPage(1);
                  const v = e.target.value === "all" ? "all" : (Number(e.target.value) as RatingFilter);
                  setRating(v);
                }}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                {ratingOptions.map((r) => (
                  <option key={String(r)} value={String(r)}>
                    {r === "all" ? "All ratings" : `${r}★`}
                  </option>
                ))}
              </select>

              {/* Rows */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Rows:</label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value) as 10 | 20 | 50);
                    setPage(1);
                  }}
                  className="border rounded-lg px-2 py-2 text-sm"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <button
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                <FiRefreshCcw className="w-4 h-4" /> Refresh
              </button>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                <FiDownload className="w-4 h-4" /> Export
              </button>

              <Pager
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#f0fdf4]">
                {["ID#", "Type", "Subject", "Rating", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-sm font-medium text-[#22c55e] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {loading ? (
              <RowSkeleton rows={6} cols={6} />
            ) : table.length === 0 ? (
              <EmptyTable message="No feedback found." colSpan={6} />
            ) : (
              <tbody className="divide-y divide-gray-100">
                {table.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#1e1e38] font-mono">
                      {f._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <TypeBadge value={f.type} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1e1e38]">
                      <div className="line-clamp-1">{f.subject}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{f.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <RatingStars value={f.rating} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(f.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openDetail(f._id)}
                          className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 inline-flex items-center gap-1"
                        >
                          <FiEye /> View
                        </button>
                        <button
                          onClick={() => onDelete(f._id)}
                          disabled={deletingId === f._id}
                          className="px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50 inline-flex items-center gap-1 disabled:opacity-60"
                        >
                          <FiTrash2 /> {deletingId === f._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-6 py-4 text-xs text-gray-500 flex items-center justify-between">
          <span>
            Showing <strong>{items.length}</strong> row(s) • Page <strong>{page}</strong> of{" "}
            <strong>{Math.max(totalPages, 1)}</strong>
          </span>
        </div>
      </div>

      {/* Detail Drawer */}
      {open && detail && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e1e38]">Feedback Details</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg border hover:bg-gray-50"
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <TypeBadge value={detail.type} />
                  <span className="text-xs text-gray-500">
                    {new Date(detail.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-[#1e1e38] break-words">
                  {detail.subject}
                </h3>
                <div className="mt-1">
                  <RatingStars value={detail.rating} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Message</h4>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{detail.message}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">From</h5>
                  <p className="text-sm text-gray-800">
                    {detail.name || "—"}
                    {detail.email ? <span className="text-gray-500"> • {detail.email}</span> : null}
                  </p>
                  {detail.user && (
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      user: {labelForUser(detail.user)}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 border rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Context</h5>
                  <p className="text-sm text-gray-800 break-all">{detail.pagePath || "—"}</p>
                  {detail.meta?.userAgent && (
                    <p className="text-xs text-gray-500 mt-1">UA: {detail.meta.userAgent}</p>
                  )}
                  {detail.meta?.appVersion && (
                    <p className="text-xs text-gray-500">App: {detail.meta.appVersion}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => onDelete(detail._id)}
                  disabled={deletingId === detail._id}
                  className="px-4 py-2 text-sm rounded-lg border text-red-600 hover:bg-red-50 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <FiTrash2 /> {deletingId === detail._id ? "Deleting…" : "Delete"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default FeedbackAdminPage;
