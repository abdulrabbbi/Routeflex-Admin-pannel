import React from "react";

type SkeletonProps = {
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  width?: number | string;
  height?: number | string;
};

const radius = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  rounded = "lg",
  width = "100%",
  height = 12,
}) => {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };
  return (
    <div
      className={`animate-pulse bg-gray-200 ${radius[rounded]} ${className}`}
      style={style}
      aria-hidden
    />
  );
};

/**
 * Five “box” placeholders – great for top summary cards.
 * Responsive grid: 1/2/3/5 columns across breakpoints.
 */
export const BoxesSkeleton5: React.FC<{
  className?: string;
  boxClassName?: string;
}> = ({ className = "", boxClassName = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`border rounded-2xl p-4 bg-white`}>
          {/* title line */}
          <Skeleton width="50%" height={14} className="mb-2" />
          {/* big number */}
          <Skeleton width="70%" height={24} className={`mb-3 ${boxClassName}`} />
          {/* small footer line */}
          <Skeleton width="40%" height={10} />
        </div>
      ))}
    </div>
  );
};

/**
 * Table skeleton – renders skeleton rows in a <tbody>.
 * Use when table data is loading.
 */
export const TableSkeleton: React.FC<{
  columns: number;
  rows?: number;
  cellHeight?: number;
  cellClassName?: string;   // ← NEW
}> = ({ columns, rows = 5, cellHeight = 16, cellClassName = "px-4 py-3" }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={`sk-row-${r}`} className="animate-pulse">
          {Array.from({ length: columns }).map((__, c) => (
            <td key={`sk-cell-${r}-${c}`} className={cellClassName}>
              <Skeleton height={cellHeight} className="w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};


export const SkeletonStatCard: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-100">
    <div className="flex justify-between items-center animate-pulse">
      <div className="space-y-3 w-full">
        <div className="h-3 w-32 bg-gray-200 rounded" />
        <div className="h-6 w-44 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-xl" />
    </div>
  </div>
);