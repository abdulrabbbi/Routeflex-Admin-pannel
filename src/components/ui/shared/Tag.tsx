import React from "react";

const COLORS = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-700",
  indigo: "bg-indigo-100 text-indigo-700",
} as const;

export default function Tag({
  color = "gray",
  className = "",
  children,
}: {
  color?: keyof typeof COLORS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${COLORS[color]} ${className}`}>
      {children}
    </span>
  );
}
