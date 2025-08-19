"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";

import ConfirmModal from "../components/ConfirmModal";
import { getDeliveries, deleteDelivery } from "../api/deliveryService";

type RangeFilter = "daily" | "weekly" | "monthly";

interface Delivery {
  deliveryId: string;
  driverId: string;
  driverFullName: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  deliveryStatus: string;      // "completed" | "in-progress" | "pending" | ...
  paymentStatus?: string;      // "pending" | "paid" | "failed" | ...
  distance?: number;           // km
  packageCategory?: string;
}

interface DeliveriesApiResponse {
  status?: string;
  total?: number;              // total items across pages (fallback)
  results?: number;
  page?: number;
  totalPages?: number;         // sometimes present
  data: {
    deliveries: Delivery[];
    totalPages?: number;       // sometimes nested
    total?: number;            // sometimes nested
  };
}

const SegmentedToggle: React.FC<{
  value: RangeFilter;
  onChange: (v: RangeFilter) => void;
}> = ({ value, onChange }) => {
  const options: Array<{ id: RangeFilter; label: string }> = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
  ];
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            value === opt.id
              ? "bg-[#22c55e] text-white shadow"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

function statusPillClasses(status: string) {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "delivered")
    return "bg-green-100 text-green-700";
  if (s === "in-progress" || s === "processing")
    return "bg-blue-100 text-blue-700";
  if (s === "pending")
    return "bg-yellow-100 text-yellow-700";
  if (s === "failed" || s === "cancelled")
    return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

const DeliveriesTable: React.FC = React.memo(() => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<RangeFilter>("daily");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDeliveries = useCallback(
    async (pageNum: number = 1, selectedFilter: RangeFilter = filter, lm: number = limit) => {
      try {
        setIsLoading(true);
        setErr("");
        const res: DeliveriesApiResponse = await getDeliveries(lm, pageNum, selectedFilter);

        const items = res?.data?.deliveries ?? [];
        setDeliveries(items);

        // Prefer provided totalPages; otherwise derive from total
        const reportedTotalPages =
          res?.totalPages ??
          res?.data?.totalPages ??
          (typeof res?.total === "number"
            ? Math.max(1, Math.ceil(res.total / lm))
            : typeof res?.data?.total === "number"
            ? Math.max(1, Math.ceil((res.data.total as number) / lm))
            : 1);

        setTotalPages(reportedTotalPages);
        setPage(res?.page ?? pageNum);
      } catch (error) {
        setDeliveries([]);
        setTotalPages(1);
        setErr("Failed to fetch deliveries");
        toast.error("Failed to fetch deliveries");
      } finally {
        setIsLoading(false);
      }
    },
    [filter, limit]
  );

  // initial + when filter/limit changes → reset to page 1
  useEffect(() => {
    fetchDeliveries(1, filter, limit);
  }, [fetchDeliveries, filter, limit]);

  const handleFilterChange = (value: RangeFilter) => {
    setFilter(value);
    // fetch happens via useEffect
  };

  const onPrev = () => page > 1 && fetchDeliveries(page - 1, filter, limit);
  const onNext = () => page < totalPages && fetchDeliveries(page + 1, filter, limit);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDelivery(deleteId);
      toast.success("Delivery deleted successfully");
      // If we removed the last item on a page (and not first page), go back one page
      if (deliveries.length === 1 && page > 1) {
        fetchDeliveries(page - 1, filter, limit);
      } else {
        fetchDeliveries(page, filter, limit);
      }
    } catch {
      toast.error("Failed to delete delivery");
    } finally {
      setModalOpen(false);
      setDeleteId(null);
    }
  };

  // CSV export
  const handleExport = () => {
    try {
      const headers = [
        "Parcel ID",
        "Driver ID",
        "Driver Name",
        "Pickup Address",
        "Delivery Address",
        "Distance (km)",
        "Package Category",
        "Delivery Status",
        "Payment Status",
      ];

      const rows = deliveries.map((d) => [
        d.deliveryId || "-",
        (d.driverId || "").slice(-6).toUpperCase(),
        d.driverFullName || "-",
        d.pickupAddress || "-",
        d.deliveryAddress || "-",
        typeof d.distance === "number" ? d.distance.toFixed(2) : "-",
        d.packageCategory || "-",
        d.deliveryStatus || "-",
        d.paymentStatus || "-",
      ]);

      const csv = [headers, ...rows]
        .map((r) =>
          r
            .map((cell) => {
              const s = String(cell ?? "");
              const escaped = s.replace(/"/g, '""');
              return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.href = url;
      a.download = `deliveries-${filter}-page${page}-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const tableBody = useMemo(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
            Loading...
          </td>
        </tr>
      );
    }

    if (err) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-red-600">
            {err}
          </td>
        </tr>
      );
    }

    if (!deliveries.length) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
            No deliveries found
          </td>
        </tr>
      );
    }

    return deliveries.map((d) => (
      <tr key={d.deliveryId} className="hover:bg-gray-50">
        <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">{d.deliveryId}</td>
        <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
          {(d.driverId || "").slice(-6).toUpperCase()}
        </td>
        <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
          {d.driverFullName || "-"}
        </td>

        {/* Delivery Status */}
        <td className="px-4 py-4 text-sm text-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusPillClasses(d.deliveryStatus)}`}>
            {d.deliveryStatus || "-"}
          </span>
        </td>

        {/* Payment (md+) */}
        <td className="px-4 py-4 text-sm text-center hidden md:table-cell">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusPillClasses(d.paymentStatus || "")}`}>
            {d.paymentStatus || "-"}
          </span>
        </td>

        {/* Distance (md+) */}
        <td className="px-4 py-4 text-sm text-center hidden md:table-cell">
          {typeof d.distance === "number" ? `${d.distance.toFixed(2)} km` : "-"}
        </td>

        {/* Package Category */}
        <td className="px-4 py-4 text-sm text-center">{d.packageCategory || "-"}</td>

        {/* Actions */}
        <td className="px-4 py-4 text-sm text-center">
          <button
            onClick={() => handleDeleteClick(d.deliveryId)}
            className="p-2 rounded hover:bg-gray-100 text-red-500"
            aria-label="Delete delivery"
          >
            <FiTrash2 className="mx-auto" />
          </button>
        </td>
      </tr>
    ));
  }, [isLoading, err, deliveries]);

  return (
    <div className="p-6">
      {/* Confirm modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Delivery"
        message="Are you sure you want to delete this delivery? This action cannot be undone."
      />

      {/* Header (title + controls) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Parcels</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter */}
          <SegmentedToggle value={filter} onChange={handleFilterChange} />

          {/* Rows */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium"
          >
            ⬇️ Export (.csv)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Parcel ID</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Driver ID</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Driver Name</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Status</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center hidden md:table-cell">
                  Payment
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center hidden md:table-cell">
                  Distance
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Package</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{tableBody}</tbody>
          </table>
        </div>

        {/* Footer: pagination + summary */}
        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <button
                disabled={page <= 1 || isLoading}
                onClick={onPrev}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page <strong>{page}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
              </span>
              <button
                disabled={page >= totalPages || isLoading || totalPages === 0}
                onClick={onNext}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Showing <strong>{deliveries.length}</strong> item(s) • Range:{" "}
              <strong className="capitalize">{filter}</strong> • Limit {limit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DeliveriesTable;
