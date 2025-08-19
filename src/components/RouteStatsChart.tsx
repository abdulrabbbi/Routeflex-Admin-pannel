import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { FiDollarSign, FiRefreshCcw, FiAlertCircle } from "react-icons/fi";
import { MdRoute } from "react-icons/md";

type RangeType = "daily" | "weekly" | "monthly" | "yearly";

type ApiResult = {
  completed: number;
  available: number;
  inProgress: number;
  totalRevenue: number;
  totalDistance: number;
};

const STATUS_ORDER = ["Completed", "In Progress", "Available"] as const;
const STATUS_COLORS: Record<(typeof STATUS_ORDER)[number], string> = {
  Completed: "#16a34a",     // emerald-600
  "In Progress": "#2563eb", // blue-600
  Available: "#6b7280",     // gray-500
};

const fmtInt = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtKm = (n: number) =>
  `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    n || 0
  )} km`;

const Segmented = ({
  value,
  onChange,
}: {
  value: RangeType;
  onChange: (r: RangeType) => void;
}) => {
  const opts: RangeType[] = ["daily", "weekly", "monthly", "yearly"];
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {opts.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3.5 py-2 text-sm font-medium rounded-lg transition ${
            value === opt
              ? "bg-emerald-500 text-white shadow"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt[0].toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm text-sm">
      <div className="font-medium text-gray-900">{label}</div>
      <div className="text-gray-700">{fmtInt(item.value)}</div>
    </div>
  );
};

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
    <div className="h-72 bg-gray-100 rounded" />
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-xl p-4">
    <div className="flex items-center gap-2 text-red-700">
      <FiAlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
    >
      <FiRefreshCcw className="w-4 h-4" />
      Retry
    </button>
  </div>
);

const KPI = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="flex-1 min-w-[220px] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold text-gray-500">{title}</div>
        <div className="mt-1 text-2xl font-extrabold text-gray-900">{value}</div>
      </div>
      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">{icon}</div>
    </div>
  </div>
);

const RouteStatsChart = () => {
  const [range, setRange] = useState<RangeType>(() => {
    const saved = sessionStorage.getItem("routeStatsRange") as RangeType | null;
    return saved ?? "monthly";
  });
  const [stats, setStats] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchStats = async (signal?: AbortSignal) => {
    setLoading(true);
    setErr("");
    try {
      const res = await apiClient.get(`/routes/admin/routes/report`, {
        params: { range },
        signal,
      });
      const result: ApiResult = res?.data?.data?.result || {
        completed: 0,
        available: 0,
        inProgress: 0,
        totalRevenue: 0,
        totalDistance: 0,
      };
      setStats(result);
      setUpdatedAt(new Date());
    } catch (e: any) {
      if (e?.name !== "CanceledError" && e?.message !== "canceled") {
        setErr("Failed to load order statistics.");
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("routeStatsRange", range);
    const ctl = new AbortController();
    fetchStats(ctl.signal);
    return () => ctl.abort();
  }, [range]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return STATUS_ORDER.map((name) => ({
      name,
      value:
        name === "Completed"
          ? stats.completed
          : name === "In Progress"
          ? stats.inProgress
          : stats.available,
      color: STATUS_COLORS[name],
    }));
  }, [stats]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📊 Orders Overview</h2>
          <p className="text-sm text-gray-500">
            Counts by status •{" "}
            <span className="capitalize">{range}</span>{" "}
            {updatedAt && (
              <span className="text-gray-400">
                • Updated {updatedAt.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Segmented value={range} onChange={setRange} />
      </div>

      {/* Error */}
      {err && <ErrorState message={err} onRetry={() => fetchStats()} />}

      {/* Chart */}
      <div className="mt-4">
        {loading ? (
          <Skeleton />
        ) : (
          <>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {chartData.map((d) => (
                <div key={d.name} className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ background: d.color }}
                  />
                  <span className="text-gray-700">{d.name}:</span>
                  <span className="font-semibold text-gray-900">{fmtInt(d.value)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* KPIs */}
      {!loading && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <KPI
            title="Total Revenue"
            value={fmtMoney(stats.totalRevenue)}
            icon={<FiDollarSign className="h-6 w-6" />}
          />
          <KPI
            title="Total Distance"
            value={fmtKm(Number(stats.totalDistance ?? 0))}
            icon={<MdRoute className="h-6 w-6" />}
          />
        </div>
      )}
    </div>
  );
};

export default RouteStatsChart;
