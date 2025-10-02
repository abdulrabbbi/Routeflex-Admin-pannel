import React from "react";
import { FiInbox } from "react-icons/fi";
import TablePager from "../../components/ui/shared/TablePager";
import { TableSkeleton } from "../../components/ui/shared/Skeleton";

// ---- Types expected by this table ----
export type DeliveredRow = {
  sequence: string;           // "01"
  driver: string;             // "John Doe"
  pickupAt: string;           // "09:53"
  deliveredAt: string;        // "11:16"
  dropoffLocation?: string;   // optional, not shown in current table
  timeLeft: string | "N/A";   // "Early by 10m" | "Late by 5m" | "On time" | "N/A"
  hours: string | "N/A";      // "2 hrs" | "N/A"
  status: "Completed" | string;
};

export type DeliveredMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
};

type Props = {
  title?: string;
  rows: DeliveredRow[];
  meta: DeliveredMeta;
  loading?: boolean;

  onLimitChange: (limit: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

// ---- helpers ----
const timeLeftClass = (label: string | "N/A") => {
  if (!label || label === "N/A") return "text-gray-500";
  const t = label.toLowerCase();
  if (t.startsWith("late by")) return "text-rose-600";
  if (t.startsWith("early by") || t === "on time") return "text-emerald-600";
  return "text-gray-700";
};

const statusBadge = (label: string | "N/A") => {
  if (!label || label === "N/A") {
    return { bg: "bg-gray-100", text: "text-gray-600", textLabel: "Completed" };
  }
  const t = label.toLowerCase();
  if (t === "on time" || t.startsWith("early by")) {
    return { bg: "bg-emerald-50", text: "text-emerald-700", textLabel: "On time" };
  }
  if (t.startsWith("late by")) {
    return { bg: "bg-amber-50", text: "text-amber-700", textLabel: "Late" };
  }
  return { bg: "bg-gray-100", text: "text-gray-600", textLabel: "Completed" };
};

const DeliveredTable: React.FC<Props> = ({
  title = "Orders Delivered",
  rows,
  meta,
  loading = false,
  onLimitChange,
  onPrev,
  onNext,
}) => {
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={meta.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <TablePager
            page={meta.page}
            totalPages={meta.totalPages}
            onPrev={onPrev}
            onNext={onNext}
            disabled={loading}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                {[
                  "OR#",
                  "Driver",
                  "Pickup at",
                  "Delivered at",
                  "Lateness / earliness",
                  "Hours",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-[#22c55e] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Stable layout while loading
                <TableSkeleton columns={7} rows={Math.min(meta.limit || 10, 10)} />
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                        <FiInbox className="h-6 w-6 text-gray-400" />
                      </span>
                      <p className="font-medium text-gray-700">
                        No deliveries completed in this range
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Try a different range or check back later.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((d, i) => {
                  const badge = statusBadge(d.timeLeft);
                  return (
                    <tr key={`${d.sequence}-${i}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.sequence}</td>
                      <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.driver}</td>
                      <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.pickupAt}</td>
                      <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.deliveredAt}</td>
                      <td className={`px-6 py-4 text-sm ${timeLeftClass(d.timeLeft)}`}>{d.timeLeft}</td>
                      <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.hours}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.textLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong>{rows.length}</strong> of{" "}
            <strong>{meta.total}</strong> delivered
          </span>
        </div>
      </div>
    </section>
  );
};

export default DeliveredTable;
