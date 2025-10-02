import React from "react";

/** Empty full-width row inside a table */
export const EmptyTable = ({ message, colSpan = 6 }: { message: string; colSpan?: number }) => (
  <tbody>
    <tr>
      <td colSpan={colSpan} className="h-40">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-500">{message}</div>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
);

/** Skeleton rows for loading state */
export const RowSkeleton = ({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) => (
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

/** Type pill */
export const TypeBadge: React.FC<{ value: string }> = ({ value }) => {
  const map: Record<string, string> = {
    bug: "bg-red-50 text-red-600",
    feature: "bg-indigo-50 text-indigo-600",
    service: "bg-sky-50 text-sky-600",
    payment: "bg-amber-50 text-amber-700",
    delivery: "bg-emerald-50 text-emerald-700",
    other: "bg-gray-100 text-gray-700",
  };
  const cls = map[value] || map.other;
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{value}</span>;
};

/** Simple star renderer (readonly) */
export const RatingStars: React.FC<{ value?: number }> = ({ value }) => {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`w-4 h-4 ${i < n ? "fill-amber-400" : "fill-gray-200"}`}
        >
          <path d="M9.049 2.927a1 1 0 011.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.923-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.175 0l-2.802 2.036c-.784.57-1.838-.195-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
      {value ? <span className="ml-1 text-xs text-gray-500">{value}/5</span> : null}
    </div>
  );
};


