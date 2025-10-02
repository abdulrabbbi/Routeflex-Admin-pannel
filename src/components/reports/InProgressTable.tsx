import React from "react";
import { FiInbox } from "react-icons/fi";
import TablePager from "../../components/ui/shared/TablePager";
import { TableSkeleton } from "../../components/ui/shared/Skeleton"; 

export type InProgressRow = {
  sequence: string;            // "01"
  driver: string;              // "John Doe"
  pickupAt: string;            // "15:33"
  dropoffLocation: string;     // "A | B | C" (pipe-separated)
  timeLeft: string | "N/A";    // "Time remaining 2h 5m" | "Overdue by 3h 2m" | "N/A" | "Due now"
};

export type InProgressMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
};

type Props = {
  title?: string;
  rows: InProgressRow[];
  meta: InProgressMeta;
  loading?: boolean;

  onLimitChange: (limit: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

// helpers
const timeLeftClass = (label: string | "N/A") => {
  if (!label || label === "N/A") return "text-gray-500";
  const t = label.toLowerCase();
  if (t.startsWith("overdue by")) return "text-rose-600";                 // red
  if (t.startsWith("time remaining") || t === "due now") return "text-blue-600"; // blue/positive
  return "text-gray-700";
};

const InProgressTable: React.FC<Props> = ({
  title = "Orders in Process",
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
                {["No#", "Driver", "Pickup at", "Dropoff Location", "Remaining / overdue"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#22c55e] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton keeps table layout stable during fetch
                <TableSkeleton columns={5} rows={Math.min(meta.limit || 10, 10)} />
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                        <FiInbox className="h-6 w-6 text-gray-400" />
                      </span>
                      <p className="font-medium text-gray-700">No orders in progress for this range</p>
                      <p className="text-sm text-gray-500 mt-1">Try switching the range or check back later.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((d, i) => (
                  <tr key={`${d.sequence}-${i}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.sequence}</td>
                    <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.driver}</td>
                    <td className="px-6 py-4 text-sm text-[#1e1e38]">{d.pickupAt}</td>
                    <td className="px-6 py-4 text-sm text-[#1e1e38]">
                      <div className="space-y-1">
                        {(d.dropoffLocation || "")
                          .split("|")
                          .map((loc, idx) =>
                            loc.trim() ? (
                              <div key={idx} className="text-gray-700">• {loc.trim()}</div>
                            ) : null
                          )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${timeLeftClass(d.timeLeft)}`}>{d.timeLeft}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong>{rows.length}</strong> of <strong>{meta.total}</strong> in-progress
          </span>
        </div>
      </div>
    </section>
  );
};

export default InProgressTable;
