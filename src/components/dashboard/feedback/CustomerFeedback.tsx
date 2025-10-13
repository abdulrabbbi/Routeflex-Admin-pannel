import React, { useEffect, useMemo, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { getFeedbackStats, FeedbackPayload } from "../../../api/adminService";
import { FEEDBACK_COLORS } from "../../ui/shared/theme/charts";

type Props = { className?: string };

const StatRow: React.FC<{
  label: "Positive" | "Neutral" | "Negative";
  value: number; // 0..100
  color: string; // bar color
}> = ({ label, value, color }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-gray-700">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-gray-900">
        {Math.round(value)}%
      </span>
    </div>
  );
};

export default function CustomerFeedback({ className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FeedbackPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const payload = await getFeedbackStats();
        setData(payload);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || "Failed to load feedback stats";
        setErr(msg);
        toast.error(msg);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // donut series (order matters for colors)
  const donut = useMemo(() => {
    const p = data?.percentages || { positive: 0, neutral: 0, negative: 0 };
    return [
      {
        name: "Positive",
        value: p.positive,
        key: "positive",
        color: FEEDBACK_COLORS.positive.fill,
      },
      {
        name: "Neutral",
        value: p.neutral,
        key: "neutral",
        color: FEEDBACK_COLORS.neutral.fill,
      },
      {
        name: "Negative",
        value: p.negative,
        key: "negative",
        color: FEEDBACK_COLORS.negative.fill,
      },
    ];
  }, [data]);

  const stars = useMemo(
    () =>
      (data?.stars || [])
        .slice() // copy
        .sort((a, b) => b.stars - a.stars), // 5 → 1
    [data]
  );

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Customer Feedback
      </h3>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {err}
        </div>
      )}

      {/* top: donut + progress rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-[220px]">
          {loading ? (
            <div className="h-full w-full grid place-items-center">
              <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="90%"
                  stroke="#fff"
                  strokeWidth={2}
                  paddingAngle={2}
                >
                  {donut.map((d, i) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* progress bars */}
        <div className="space-y-4">
          <StatRow
            label="Positive"
            value={data?.percentages.positive ?? 0}
            color={FEEDBACK_COLORS.positive.fill}
          />
          <StatRow
            label="Neutral"
            value={data?.percentages.neutral ?? 0}
            color={FEEDBACK_COLORS.neutral.fill}
          />
          <StatRow
            label="Negative"
            value={data?.percentages.negative ?? 0}
            color={FEEDBACK_COLORS.negative.fill}
          />
        </div>
      </div>

      {/* divider */}
      <hr className="my-5 border-gray-200" />

      {/* bottom: star buckets */}
      <div className="grid grid-cols-5 gap-4">
        {stars.map((s) => (
          <div key={s.stars} className="flex flex-col items-center">
            <AiFillStar className="text-yellow-400 w-6 h-6" />
            <div className="text-xs text-gray-600 mt-1">{s.stars}★</div>
            <div className="text-sm font-semibold text-gray-900">
              {s.count.toLocaleString()}
            </div>
          </div>
        ))}
        {!stars.length && !loading && (
          <div className="col-span-5 text-center text-gray-500">
            No ratings yet.
          </div>
        )}
      </div>
    </div>
  );
}
