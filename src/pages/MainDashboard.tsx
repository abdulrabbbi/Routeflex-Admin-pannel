import React, { useEffect, useMemo, useState } from "react";
import { MdLocalShipping, MdDirections } from "react-icons/md";
import JobAssignmentPage from "../components/JobAssignmentPage";
import RouteStatsChart from "../components/RouteStatsChart";
import { FiInbox } from "react-icons/fi";
import {
  getParcelReports,
  RangeType,
  GetParcelReportsParams,
} from "../api/deliveryService";

/* ---------- Types ---------- */
interface DeliveredType {
  sequence: string;
  driver: string;
  pickupAt: string;
  deliveredAt: string;
  dropoffLocation: string;
  timeLeft: string | number;
  hours: string;
  status: string;
}
interface InProgressType {
  sequence: string;
  driver: string;
  pickupAt: string;
  dropoffLocation: string;
  timeLeft: string | number;
  status: string;
}
interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
}

/* ---------- Helpers ---------- */
function parseLateEarly(s: string) {
  const lower = s.toLowerCase().trim();
  const isLate = lower.includes("late");
  const isEarly = lower.includes("early");
  let days = 0,
    hours = 0,
    mins = 0;
  const re = /(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m(?:in)?)?/i;
  const match = lower.match(re);
  if (match) {
    days = Number(match[1] || 0);
    hours = Number(match[2] || 0);
    mins = Number(match[3] || 0);
  } else {
    const m2 = lower.match(/(\d+)\s*m(?:in)?/);
    if (m2) mins = Number(m2[1]);
  }
  return { isLate, isEarly, days, hours, mins };
}

function formatMinutes(v: string | number): string {
  if (typeof v === "number") {
    const abs = Math.abs(v);
    const isLate = v > 0;
    const days = Math.floor(abs / 1440);
    const hours = Math.floor((abs % 1440) / 60);
    const mins = abs % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    parts.push(`${mins}m`);
    return `${parts.join(" ")} ${isLate ? "late" : "early"}`;
  }
  const info = parseLateEarly(v);
  const parts: string[] = [];
  if (info.days) parts.push(`${info.days}d`);
  if (info.hours) parts.push(`${info.hours}h`);
  if (info.mins || parts.length === 0) parts.push(`${info.mins}m`);
  return `${parts.join(" ")} ${
    info.isLate ? "late" : info.isEarly ? "early" : ""
  }`.trim();
}

function getTimeLeftClass(v: string | number): string {
  if (typeof v === "string") {
    const lower = v.toLowerCase();
    if (lower.includes("late")) return "text-red-600";
    if (lower.includes("early")) return "text-green-600";
    if (lower.includes("completed")) return "text-emerald-600";
    return "text-gray-600";
  }
  return Number(v) > 0 ? "text-red-600" : "text-green-600";
}

/* ---------- Small UI bits ---------- */
const Segmented: React.FC<{
  value: RangeType;
  onChange: (v: RangeType) => void;
}> = ({ value, onChange }) => {
  const opts: RangeType[] = ["daily", "weekly", "monthly"];
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {opts.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3.5 py-2 text-sm font-medium rounded-lg transition ${
            value === opt
              ? "bg-[#22c55e] text-white shadow"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
};

const TablePager: React.FC<{
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}> = ({ page, totalPages, onPrev, onNext, disabled }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={onPrev}
      disabled={disabled || page <= 1}
      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
    >
      ← Previous
    </button>
    <span className="text-sm text-gray-600">
      Page <strong>{Math.max(page, 1)}</strong> of{" "}
      <strong>{Math.max(totalPages || 1, 1)}</strong>
    </span>
    <button
      onClick={onNext}
      disabled={disabled || page >= (totalPages || 1)}
      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
    >
      Next →
    </button>
  </div>
);

/* ---------- Main Component ---------- */
const DashboardContent: React.FC = () => {
  // range
  const [range, setRange] = useState<RangeType>("daily");

  // delivered data + meta
  const [delivered, setDelivered] = useState<DeliveredType[]>([]);
  const [deliveredMeta, setDeliveredMeta] = useState<ListMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    results: 0,
  });

  // in-progress data + meta
  const [inProgress, setInProgress] = useState<InProgressType[]>([]);
  const [inProgressMeta, setInProgressMeta] = useState<ListMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    results: 0,
  });

  // ui states
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // restore range
  useEffect(() => {
    const stored = sessionStorage.getItem(
      "parcelReportRange"
    ) as RangeType | null;
    if (stored) setRange(stored);
  }, []);

  // persist range
  useEffect(() => {
    sessionStorage.setItem("parcelReportRange", range);
  }, [range]);

  // make one request that respects both paginations
  const fetchReports = async (opts?: Partial<GetParcelReportsParams>) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getParcelReports({
        range,
        // current pagination state (defaults)
        deliveredPage: deliveredMeta.page,
        deliveredLimit: deliveredMeta.limit,
        inProgressPage: inProgressMeta.page,
        inProgressLimit: inProgressMeta.limit,
        // overrides
        ...opts,
      });

      const data = res?.data;
      if (!data) throw new Error("Invalid data structure");

      setDelivered(Array.isArray(data.delivered) ? data.delivered : []);
      setInProgress(Array.isArray(data.inProgress) ? data.inProgress : []);

      // Meta (fallbacks if server not yet upgraded)
      const dMeta: ListMeta = {
        page: data.deliveredMeta?.page ?? 1,
        limit: data.deliveredMeta?.limit ?? deliveredMeta.limit,
        total: data.deliveredMeta?.total ?? data.delivered?.length ?? 0,
        totalPages: data.deliveredMeta?.totalPages ?? 1,
        results: data.deliveredMeta?.results ?? data.delivered?.length ?? 0,
      };
      const iMeta: ListMeta = {
        page: data.inProgressMeta?.page ?? 1,
        limit: data.inProgressMeta?.limit ?? inProgressMeta.limit,
        total: data.inProgressMeta?.total ?? data.inProgress?.length ?? 0,
        totalPages: data.inProgressMeta?.totalPages ?? 1,
        results: data.inProgressMeta?.results ?? data.inProgress?.length ?? 0,
      };

      setDeliveredMeta(dMeta);
      setInProgressMeta(iMeta);
    } catch (e: any) {
      setErr(e?.message || "Failed to load parcel data.");
      setDelivered([]);
      setInProgress([]);
      setDeliveredMeta((m) => ({
        ...m,
        total: 0,
        totalPages: 1,
        results: 0,
        page: 1,
      }));
      setInProgressMeta((m) => ({
        ...m,
        total: 0,
        totalPages: 1,
        results: 0,
        page: 1,
      }));
    } finally {
      setLoading(false);
    }
  };

  // initial + on range change -> reset both paginations and refetch
  useEffect(() => {
    setDeliveredMeta((m) => ({ ...m, page: 1 }));
    setInProgressMeta((m) => ({ ...m, page: 1 }));
    fetchReports({ deliveredPage: 1, inProgressPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // displayed totals in stat cards (prefer meta.total if available)
  const deliveredTotalDisplay = useMemo(
    () => (deliveredMeta.total ? deliveredMeta.total : delivered.length),
    [deliveredMeta.total, delivered.length]
  );
  const inProgressTotalDisplay = useMemo(
    () => (inProgressMeta.total ? inProgressMeta.total : inProgress.length),
    [inProgressMeta.total, inProgress.length]
  );

  /* ---- Handlers: delivered ---- */
  const onDeliveredPrev = () => {
    if (deliveredMeta.page <= 1 || loading) return;
    const page = deliveredMeta.page - 1;
    setDeliveredMeta((m) => ({ ...m, page }));
    fetchReports({ deliveredPage: page });
  };
  const onDeliveredNext = () => {
    if (deliveredMeta.page >= deliveredMeta.totalPages || loading) return;
    const page = deliveredMeta.page + 1;
    setDeliveredMeta((m) => ({ ...m, page }));
    fetchReports({ deliveredPage: page });
  };
  const onDeliveredLimit = (limit: number) => {
    setDeliveredMeta((m) => ({ ...m, limit, page: 1 }));
    fetchReports({ deliveredLimit: limit, deliveredPage: 1 });
  };

  /* ---- Handlers: in-progress ---- */
  const onInProgressPrev = () => {
    if (inProgressMeta.page <= 1 || loading) return;
    const page = inProgressMeta.page - 1;
    setInProgressMeta((m) => ({ ...m, page }));
    fetchReports({ inProgressPage: page });
  };
  const onInProgressNext = () => {
    if (inProgressMeta.page >= inProgressMeta.totalPages || loading) return;
    const page = inProgressMeta.page + 1;
    setInProgressMeta((m) => ({ ...m, page }));
    fetchReports({ inProgressPage: page });
  };
  const onInProgressLimit = (limit: number) => {
    setInProgressMeta((m) => ({ ...m, limit, page: 1 }));
    fetchReports({ inProgressLimit: limit, inProgressPage: 1 });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Keep as-is */}
      <RouteStatsChart />

      {/* Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <Segmented value={range} onChange={setRange} />
      </div>

      {/* Loading & Error */}
      {loading ? (
        <div className="text-gray-600">Loading dashboard...</div>
      ) : err ? (
        <div className="text-red-500">{err}</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Parcels Delivered
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {deliveredTotalDisplay}{" "}
                    <span className="text-green-600 font-semibold">
                      / {range}
                    </span>
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl shadow">
                  <MdLocalShipping className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Parcels on Move
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {inProgressTotalDisplay}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl shadow">
                  <MdDirections className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Delivered Table */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">Orders Delivered</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows:</label>
                  <select
                    value={deliveredMeta.limit}
                    onChange={(e) => onDeliveredLimit(Number(e.target.value))}
                    className="border rounded-lg px-2 py-1 text-sm"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <TablePager
                  page={deliveredMeta.page}
                  totalPages={deliveredMeta.totalPages}
                  onPrev={onDeliveredPrev}
                  onNext={onDeliveredNext}
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
                        "Time left",
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
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : delivered.length === 0 ? (
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
                      delivered.map((d, i) => (
                        <tr
                          key={`${d.sequence}-${i}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.sequence}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.driver}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.pickupAt}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.deliveredAt}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${getTimeLeftClass(
                              d.timeLeft
                            )}`}
                          >
                            {typeof d.timeLeft === "string"
                              ? formatMinutes(d.timeLeft)
                              : d.timeLeft}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.hours}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#16a34a]">
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* footer summary */}
              <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing <strong>{delivered.length}</strong> of{" "}
                  <strong>{deliveredMeta.total}</strong> delivered
                </span>
              </div>
            </div>
          </section>

          {/* In-Progress Table */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">Orders in Process</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows:</label>
                  <select
                    value={inProgressMeta.limit}
                    onChange={(e) => onInProgressLimit(Number(e.target.value))}
                    className="border rounded-lg px-2 py-1 text-sm"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <TablePager
                  page={inProgressMeta.page}
                  totalPages={inProgressMeta.totalPages}
                  onPrev={onInProgressPrev}
                  onNext={onInProgressNext}
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
                        "No#",
                        "Driver",
                        "Pickup at",
                        "Dropoff Location",
                        "Time Left",
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
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : inProgress.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16">
                          <div className="flex flex-col items-center justify-center text-center">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                              <FiInbox className="h-6 w-6 text-gray-400" />
                            </span>
                            <p className="font-medium text-gray-700">
                              No orders in progress for this range
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Try switching the range or check back later.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      inProgress.map((d, i) => (
                        <tr
                          key={`${d.sequence}-${i}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.sequence}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.driver}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            {d.pickupAt}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1e1e38]">
                            <div className="space-y-1">
                              {d.dropoffLocation?.split("|").map((loc, idx) => (
                                <div key={idx} className="text-gray-700">
                                  • {loc.trim()}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${getTimeLeftClass(
                              d.timeLeft
                            )}`}
                          >
                            {typeof d.timeLeft === "string"
                              ? formatMinutes(d.timeLeft)
                              : d.timeLeft}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* footer summary */}
              <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing <strong>{inProgress.length}</strong> of{" "}
                  <strong>{inProgressMeta.total}</strong> in-progress
                </span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Keep these components intact */}
      <JobAssignmentPage />
    </div>
  );
};

export default DashboardContent;
