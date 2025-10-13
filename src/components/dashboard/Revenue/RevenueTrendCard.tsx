import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "react-hot-toast";
import { getRevenueTrend, RevenueTrendData } from "../../../api/adminService";

type Props = {
  className?: string;
  initialMonths?: 6 | 12 | 18 | 24;
  currency?: string; // "£" | "$" | "€"
  driverId?: string;
  businessId?: string;
};

const monthsPresets: Array<6 | 12 | 18 | 24> = [6, 12, 18, 24];

const Stat: React.FC<{
  label: string;
  value: string;
  tone?: "green" | "indigo" | "emerald";
}> = ({ label, value, tone = "indigo" }) => {
  const color =
    tone === "green"
      ? "text-green-600"
      : tone === "emerald"
      ? "text-emerald-600"
      : "text-indigo-600";
  return (
    <div className="px-2">
      <div className={`text-2xl md:text-3xl font-extrabold ${color}`}>
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
};

export default function RevenueTrendCard({
  className = "",
  initialMonths = 12,
  currency = "£",
  driverId,
  businessId,
}: Props) {
  const [months, setMonths] = useState<number>(initialMonths);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<RevenueTrendData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const payload = await getRevenueTrend({
        months,
        driver: driverId || undefined,
        business: businessId || undefined,
      });
      setData(payload);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to load revenue trend";
      setErr(msg);
      toast.error(msg);
      setData({
        summary: { thisMonthRevenue: 0, avgOrderValue: 0, successRate: 0 },
        series: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months, driverId, businessId]);

  const series = useMemo(() => data?.series ?? [], [data]);
  const summary = data?.summary ?? {
    thisMonthRevenue: 0,
    avgOrderValue: 0,
    successRate: 0,
  };

  const fmtMoney = (n: number) =>
    `${currency}${Intl.NumberFormat().format(Math.round(n))}`;
  const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {monthsPresets.map((m) => (
            <button
              key={m}
              className={`px-3 py-1.5 text-sm rounded-md ${
                months === m
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setMonths(m)}
            >
              {m === 6 ? "6M" : m === 12 ? "12M" : m === 18 ? "18M" : "24M"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-6 mb-3">
        <Stat
          label="This Month"
          value={fmtMoney(summary.thisMonthRevenue)}
          tone="green"
        />
        <Stat label="Avg Order" value={fmtMoney(summary.avgOrderValue)} />
        <Stat
          label="Success Rate"
          value={fmtPct(summary.successRate)}
          tone="emerald"
        />
      </div>

      {/* Error */}
      {err && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {err}
        </div>
      )}

      {/* Chart */}
      <div className="h-[300px] md:h-[360px]">
        {loading ? (
          <div className="h-full w-full grid place-items-center">
            <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(v: any, name: any) =>
                  name === "revenue" ? fmtMoney(Number(v)) : v
                }
                labelFormatter={(l) => `Month: ${l}`}
              />
              {/* Area for revenue */}
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#f97316" // orange-500
                fill="#fed7aa" // orange-200
                fillOpacity={0.25}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Showing last <b>{months}</b> month(s)
        {driverId ? ` • Driver: ${driverId}` : ""}
        {businessId ? ` • Business: ${businessId}` : ""}.
      </p>
    </div>
  );
}
