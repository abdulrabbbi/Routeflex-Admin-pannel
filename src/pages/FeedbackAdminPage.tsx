import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiDownload,
  FiRefreshCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import FeedbackDetailDrawer from "../components/feedback/FeedbackDetailDrawer";
import {
  Feedback,
  FeedbackType,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
} from "../api/feedbackService";
import FeedbackTable from "../components/feedback/FeedbackTable";

type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;

const types: (FeedbackType | "all")[] = [
  "all",
  "bug",
  "feature",
  "service",
  "payment",
  "delivery",
  "other",
];
const ratingOptions: RatingFilter[] = ["all", 5, 4, 3, 2, 1];

const FeedbackAdminPage: React.FC = () => {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [type, setType] = useState<FeedbackType | "all">("all");
  const [rating, setRating] = useState<RatingFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<10 | 20 | 50>(10);
  const [totalPages, setTotalPages] = useState(1);

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
      const headers = [
        "ID",
        "Type",
        "Subject",
        "Rating",
        "Name",
        "Email",
        "Created At",
        "Page",
      ];
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
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header + Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-lg font-semibold text-[#1e1e38]">
              User Feedback
            </h1>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
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
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search subject/message"
                className="w-full pl-9 pr-9 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {q && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setQ("")}
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
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === "all"
                    ? "All types"
                    : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            {/* Rating */}
            <select
              value={String(rating)}
              onChange={(e) => {
                setPage(1);
                const v =
                  e.target.value === "all"
                    ? "all"
                    : (Number(e.target.value) as RatingFilter);
                setRating(v);
              }}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            >
              {ratingOptions.map((r) => (
                <option key={String(r)} value={String(r)}>
                  {r === "all" ? "All ratings" : `${r}★`}
                </option>
              ))}
            </select>

            {/* Rows per page */}
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <FeedbackTable
            items={items}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onView={openDetail}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 text-xs text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            Showing <strong>{items.length}</strong> row(s) • Page{" "}
            <strong>{page}</strong> of{" "}
            <strong>{Math.max(totalPages, 1)}</strong>
          </span>
        </div>
      </div>

      {/* Detail Drawer */}
      <FeedbackDetailDrawer
        open={open}
        detail={detail}
        onClose={() => setOpen(false)}
        onDelete={onDelete}
        deletingId={deletingId}
      />
    </div>
  );
};

export default FeedbackAdminPage;
