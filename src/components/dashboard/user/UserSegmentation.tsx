import React, { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FiUsers } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { getBusinessStats, getCustomerStats } from "../../../api/adminService";
import { STATUS_COLORS } from "../../ui/shared/theme/charts";

/* Light theme for cards */
const C_RING_BG = "#f3f4f6"; // gray-100 for chart base ring
const C_MUTED = "#6b7280";   // gray-500 for subtle text

/* Palette from your shared tokens */
const COLOR_BUSINESS = STATUS_COLORS.completed.fill;    // green
const COLOR_INDIVIDUAL = STATUS_COLORS.inProgress.fill; // amber
const TAB_RING = STATUS_COLORS.inProgress.fill;         // amber

type TabKey = "overview" | "growth";
type Props = { className?: string };

const numberFmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });

/* Small tab button */
const SegTab: React.FC<{
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-sm font-semibold transition
      ${active ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
  >
    {children}
  </button>
);

/* Key-value row */
const Row: React.FC<{
  dotColor: string;
  label: string;
  value: string | number;
  valueClass?: string;
}> = ({ dotColor, label, value, valueClass = "" }) => (
  <div className="flex items-center justify-between py-1.5 sm:py-2">
    <div className="flex items-center gap-3">
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
      <span className="text-gray-600">{label}</span>
    </div>
    <span className={`font-semibold text-gray-900 ${valueClass}`}>{value}</span>
  </div>
);

const Skeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-7 w-44 rounded bg-gray-200" />
    <div className="mt-5 h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px] w-full rounded-xl bg-gray-200" />
  </div>
);

const UserSegmentation: React.FC<Props> = ({ className = "" }) => {
  const [tab, setTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [business, setBusiness] = useState<{ count: number; verified: number; pending: number }>(
    { count: 0, verified: 0, pending: 0 }
  );
  const [individual, setIndividual] = useState<{ count: number; verified: number }>(
    { count: 0, verified: 0 }
  );

  const mountedRef = useRef(false);

  const fetchAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [b, c] = await Promise.all([getBusinessStats(), getCustomerStats()]);
      setBusiness(b);
      setIndividual(c);
      sessionStorage.setItem("seg:businessCount", String(b.count));
      sessionStorage.setItem("seg:individualCount", String(c.count));
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to load user stats";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchAll();
  }, []);

  const donut = useMemo(
    () => [
      { name: "Businesses", value: business.count, color: COLOR_BUSINESS },
      { name: "Individuals", value: individual.count, color: COLOR_INDIVIDUAL },
    ],
    [business.count, individual.count]
  );

  const growth = useMemo(() => {
    const prevB = Number(sessionStorage.getItem("seg:businessCount") || 0);
    const prevI = Number(sessionStorage.getItem("seg:individualCount") || 0);
    const deltaB = business.count - prevB;
    const deltaI = individual.count - prevI;
    const totalPrev = prevB + prevI || 1;
    const totalNow = business.count + individual.count;
    const rate = ((totalNow - totalPrev) / totalPrev) * 100;
    return {
      newUsersToday: Math.max(0, deltaB + deltaI),
      activeThisWeek: totalNow,
      growthRatePct: isFinite(rate) ? rate : 0,
    };
  }, [business.count, individual.count]);

  const totalUsers = business.count + individual.count;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm ${className} mx-auto`}>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 lg:mb-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100"
                  style={{ color: TAB_RING }}>
              <FiUsers />
            </span>
            <h3 className="text-lg lg:text-xl font-semibold">User Segmentation</h3>
          </div>

          {/* Tabs (wraps on small) */}
          <div className="flex flex-wrap gap-2 rounded-xl p-1 bg-gray-100 border border-gray-200">
            <SegTab active={tab === "overview"} onClick={() => setTab("overview")}>
              Overview
            </SegTab>
            <SegTab active={tab === "growth"} onClick={() => setTab("growth")}>
              Growth
            </SegTab>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : err ? (
          <div className="rounded-lg px-4 py-3 border border-red-200 bg-red-50 text-red-700">
            {err}
          </div>
        ) : tab === "overview" ? (
          <>
            {/* Wide layout: 12 columns */}
            <div className="grid gap-8 lg:gap-10 lg:grid-cols-12 items-center">
              {/* Chart */}
              <div className="lg:col-span-7">
                <div className="relative h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {/* base plate */}
                      <Pie
                        data={[{ value: 1 }]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={86}
                        outerRadius={110}
                        isAnimationActive={false}
                      >
                        <Cell fill={C_RING_BG} />
                      </Pie>

                      {/* donut */}
                      <Pie
                        data={donut}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={114}
                        outerRadius={148}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {donut.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(val: any, name: any) => [numberFmt(Number(val)), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center total label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-extrabold text-gray-900">
                        {numberFmt(totalUsers)}
                      </div>
                      <div className="text-xs md:text-sm" style={{ color: C_MUTED }}>
                        Total Users
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="lg:col-span-5">
                <div className="space-y-6">
                  <Row dotColor={COLOR_BUSINESS} label="Businesses" value={numberFmt(business.count)} />
                  <Row dotColor={COLOR_INDIVIDUAL} label="Individuals" value={numberFmt(individual.count)} />

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div
                      className="rounded-xl p-4 md:p-5 border bg-gray-50"
                    >
                      <p className="text-xs" style={{ color: C_MUTED }}>
                        Business Verified
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {numberFmt(business.verified)}{" "}
                        <span className="text-xs" style={{ color: C_MUTED }}>
                          (
                          {business.count
                            ? Math.round((business.verified / business.count) * 100)
                            : 0}
                          %)
                        </span>
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 md:p-5 border bg-gray-50"
                    >
                      <p className="text-xs" style={{ color: C_MUTED }}>
                        Business Pending
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {numberFmt(business.pending)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Growth tab (kept airy)
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8 pt-1">
            {[
              { label: "New Users (since last view)", value: `+${numberFmt(growth.newUsersToday)}`, color: "#111827" },
              { label: "Active This Week", value: numberFmt(growth.activeThisWeek), color: "#111827" },
              { label: "Growth Rate", value: `${growth.growthRatePct >= 0 ? "+" : ""}${growth.growthRatePct.toFixed(1)}%`, color: "#059669" },
            ].map((card, i) => (
              <div key={i} className="rounded-2xl p-5 lg:p-6 border border-gray-200 bg-white">
                <p className="text-sm" style={{ color: C_MUTED }}>{card.label}</p>
                <p className="mt-2 text-3xl lg:text-4xl font-extrabold" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
            ))}

            <div className="sm:col-span-3 grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { label: "Businesses", value: business.count },
                { label: "Individuals", value: individual.count },
                { label: "Total Users", value: totalUsers },
              ].map((b, i) => (
                <div key={i} className="rounded-xl p-4 md:p-5 border border-gray-200 bg-gray-50">
                  <p className="text-xs" style={{ color: C_MUTED }}>{b.label}</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{numberFmt(b.value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UserSegmentation);
