import { useMemo, useState } from "react";
import { FiDownload, FiRefreshCcw, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { PaymentReport } from "../api/paymentService";

type StatusFilter = "all" | "pending" | "received";

const EmptyTable = ({ message, colSpan = 5 }: { message: string; colSpan?: number }) => (
  <tbody>
    <tr>
      <td colSpan={colSpan} className="h-40">
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          {message}
        </div>
      </td>
    </tr>
  </tbody>
);

const RowSkeleton = ({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) => (
  <tbody className="divide-y divide-gray-100">
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} className="animate-pulse">
        {Array.from({ length: cols }).map((__, c) => (
          <td key={`${r}-${c}`} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

const Badge = ({ text, tone }: { text: string; tone: "green" | "red" }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      tone === "green" ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-red-50 text-red-600"
    }`}
  >
    {text}
  </span>
);

const Pager = ({
  page,
  canPrev,
  canNext,
  onPrev,
  onNext,
  disabled,
}: {
  page: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}) => (
  <div className="inline-flex items-center gap-2">
    <button
      onClick={onPrev}
      disabled={!canPrev || disabled}
      className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
    >
      ← Prev
    </button>
    <span className="text-sm text-gray-600">Page {page}</span>
    <button
      onClick={onNext}
      disabled={!canNext || disabled}
      className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
    >
      Next →
    </button>
  </div>
);

const DriversPaymentTable = ({
  data,
  loading,
  page,
  limit,
  canNext,
  onPrev,
  onNext,
  onLimitChange,
  onRefresh,
  onMarkPaid,
}: {
  data: PaymentReport[];
  loading: boolean;
  page: number;
  limit: 10 | 20 | 50;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onLimitChange: (limit: 10 | 20 | 50) => void;
  onRefresh: () => void;
  onMarkPaid: (row: PaymentReport) => Promise<void> | void;
}) => {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const canPrev = page > 1;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((row) => {
      const byText =
        !term ||
        row.driver?.toLowerCase().includes(term) ||
        String(row.sequence ?? "").toLowerCase().includes(term);

      const byStatus =
        status === "all"
          ? true
          : status === "pending"
          ? String(row.paymentReceived).toLowerCase() === "pending"
          : String(row.paymentReceived).toLowerCase() === "received";

      return byText && byStatus;
    });
  }, [data, q, status]);

  const exportCSV = () => {
    try {
      const headers = ["No#", "Driver", "Delivery Status", "Payment Received by Sender"];
      const rows = filtered.map((r) => [
        r.sequence ?? "-",
        r.driver ?? "-",
        r.deliveryStatus ?? "-",
        r.paymentReceived ?? "-",
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
      a.download = `drivers-payments-page${page}-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("CSV export failed.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1e1e38]">Drivers to be Paid</h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search driver / No#"
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

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
            </select>

            {/* Rows */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows:</label>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value) as 10 | 20 | 50)}
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
              canPrev={canPrev}
              canNext={canNext}
              onPrev={onPrev}
              onNext={onNext}
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
              {["No#", "Driver", "Delivery Status", "Payment Received by Sender", "Action"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-sm font-medium text-[#22c55e] uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          {loading ? (
            <RowSkeleton rows={6} cols={5} />
          ) : filtered.length === 0 ? (
            <EmptyTable message="No drivers found for the current filters." colSpan={5} />
          ) : (
            <tbody className="divide-y divide-gray-100">
              {filtered.map((driver, index) => {
                const isPending =
                  String(driver.paymentReceived).toLowerCase() === "pending";
                return (
                  <tr
                    key={`${driver.sequence}-${index}`}
                    className={`${index % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"} hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 text-sm text-[#1e1e38]">
                      {driver.sequence ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1e1e38]">
                      {driver.driver ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        text={driver.deliveryStatus ?? "—"}
                        tone={
                          String(driver.deliveryStatus).toLowerCase() === "completed"
                            ? "green"
                            : "red"
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex w-2 h-2 rounded-full align-middle ${
                          isPending ? "bg-red-500" : "bg-[#22c55e]"
                        }`}
                      />
                      <span className="ml-2 text-sm text-[#1e1e38]">
                        {driver.paymentReceived ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onMarkPaid(driver)}
                        disabled={!isPending}
                        className={`px-4 py-2 text-sm rounded-lg transition ${
                          isPending
                            ? "bg-[#22c55e] text-white hover:bg-[#1ea550]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {isPending ? "Mark as Paid" : "Paid"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-xs text-gray-500 flex items-center justify-between">
        <span>
          Showing <strong>{filtered.length}</strong> row(s)
          {q ? " (filtered)" : ""} • Page <strong>{page}</strong>
        </span>
      </div>
    </div>
  );
};

export default DriversPaymentTable;
