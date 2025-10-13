import React from "react";

type Props = {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  accent?: "green" | "blue" | "orange" | "rose" | "gray";
};

const colorMap: Record<NonNullable<Props["accent"]>, string> = {
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  rose: "bg-rose-100 text-rose-700",
  gray: "bg-gray-100 text-gray-700",
};

export default function SystemStatCard({
  label,
  value,
  icon,
  accent = "gray",
}: Props) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorMap[accent]} shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
