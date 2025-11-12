"use client";
import React from "react";
import { RangeFilter } from "../../../../types/deliveries";
import { SegmentedToggle } from "../../../ui/shared/SegmentedToggle";

export const DeliveriesHeader: React.FC<{
  filter: RangeFilter;
  setFilter: (v: RangeFilter) => void;
  limit: number;
  setLimit: (n: number) => void;
  onExport: () => void;
  disabled?: boolean;
}> = ({ filter, setFilter, limit, setLimit, onExport, disabled }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
      <h2 className="text-2xl font-bold text-[#22c55e] text-center md:text-left break-words">
        Completed Orders
      </h2>

      {/* Controls */}
      <div className="w-full md:w-auto">
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Segmented toggle: allow horizontal scroll on tiny screens to prevent wrapping */}
          <div className="max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SegmentedToggle
              value={filter}
              onChange={setFilter}
              disabled={disabled}
            />
          </div>

          {/* Rows selector */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-sm text-gray-600 whitespace-nowrap">
              Rows:
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 text-sm disabled:opacity-50 min-w-[72px]"
              disabled={disabled}
              aria-label="Rows per page"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={onExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
            disabled={disabled}
          >
            ⬇️ Export (.csv)
          </button>
        </div>
      </div>
    </div>
  );
};
