import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  getOrdersOverview,
  OrdersOverviewData,
  OrdersOverviewParams,
} from "../../../api/adminService";
import { STATUS_COLORS } from "../../ui/shared/theme/charts";


const Pill: React.FC<{ label: string; value: number; className?: string }> = ({
  label,
  value,
  className = "",
}) => (
  <div
    className={`flex-1 min-w-[140px] bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-100 ${className}`}
  >
    <p className="text-xs font-semibold text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
  </div>
);

type RangePreset = 7 | 30 | 90 | 180;

type Props = {
  className?: string;
  initialDays?: RangePreset;
  initialDriverId?: string;
  initialBusinessId?: string;
};

const rangeOptions: { label: string; days: RangePreset }[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "6M", days: 180 },
];

export default function OrdersOverview({
  className = "",
  initialDays = 7,
  initialDriverId = "",
  initialBusinessId = "",
}: Props) {
  const [days, setDays] = useState<RangePreset>(initialDays);
  const [driver, setDriver] = useState(initialDriverId);
  const [business, setBusiness] = useState(initialBusinessId);

  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<OrdersOverviewData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchData = async (extra?: Partial<OrdersOverviewParams>) => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getOrdersOverview({
        days,
        driver: driver || undefined,
        business: business || undefined,
        ...extra,
      });
      setPayload(data);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Failed to load orders overview";
      setErr(msg);
      toast.error(msg);
      setPayload({
        summary: { completed: 0, inProgress: 0, cancelled: 0 },
        series: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const series = useMemo(() => payload?.series ?? [], [payload]);
  const summary = payload?.summary ?? {
    completed: 0,
    inProgress: 0,
    cancelled: 0,
  };

  // Tooltip + legend helpers
  const nameMap: Record<string, string> = {
    completed: "Completed",
    inProgress: "In Progress",
    cancelled: "Cancelled",
    total: "Total",
  };

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 ${className}`}
      aria-label="Orders Overview"
    >
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Orders Overview</h3>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Preset ranges */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1 w-fit">
            {rangeOptions.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDays(opt.days)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  days === opt.days
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {err}
        </div>
      )}

      {/* Summary pills */}
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <Pill label="Completed" value={summary.completed} />
        <Pill label="In Progress" value={summary.inProgress} />
        <Pill label="Cancelled" value={summary.cancelled} />
      </div>

      {/* Chart */}
      <div className="h-[300px] md:h-[360px]">
        {loading ? (
          <div className="h-full w-full grid place-items-center">
            <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series}>
              {/* Patterns to increase distinction (especially for color-blind users) */}
              <defs>
                <pattern
                  id="cancelHatch"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                >
                  <path
                    d="M0,0 L6,6 M6,0 L0,6"
                    stroke={STATUS_COLORS.cancelled.stroke}
                    strokeWidth="1"
                  />
                </pattern>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={STATUS_COLORS.inProgress.fill}
                    stopOpacity="0.95"
                  />
                  <stop
                    offset="100%"
                    stopColor={STATUS_COLORS.inProgress.fill}
                    stopOpacity="0.7"
                  />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={STATUS_COLORS.completed.fill}
                    stopOpacity="0.95"
                  />
                  <stop
                    offset="100%"
                    stopColor={STATUS_COLORS.completed.fill}
                    stopOpacity="0.7"
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dow"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, key: any) => {
                  // Show label mapping and numeric values
                  const label = nameMap[key as string] || key;
                  return [value, label];
                }}
              />
              <Legend
                formatter={(v: any) => nameMap[v as string] || v}
                wrapperStyle={{ fontSize: 12 }}
              />

              {/* Bars */}
              <Bar
                dataKey="completed"
                name="completed"
                stackId="a"
                fill="url(#completedGrad)"
                stroke={STATUS_COLORS.completed.stroke}
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                opacity={0.95}
                isAnimationActive={false}
              />
              <Bar
                dataKey="inProgress"
                name="inProgress"
                stackId="a"
                fill="url(#progressGrad)"
                stroke={STATUS_COLORS.inProgress.stroke}
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                opacity={0.95}
                isAnimationActive={false}
              />
              <Bar
                dataKey="cancelled"
                name="cancelled"
                stackId="a"
                fill="url(#cancelHatch)"
                stroke={STATUS_COLORS.cancelled.stroke}
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                opacity={0.9}
                isAnimationActive={false}
              />

              {/* Total line */}
              <Line
                type="monotone"
                name="total"
                dataKey={(d: any) => d.completed + d.inProgress + d.cancelled}
                dot={false}
                stroke={STATUS_COLORS.total.stroke}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Showing last <b>{days}</b> day(s)
        {driver ? ` • Driver: ${driver}` : ""}
        {business ? ` • Business: ${business}` : ""}.
      </p>
    </div>
  );
}
