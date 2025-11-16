"use client";
import React from "react";
import { RangeFilter } from "../../../../types/deliveries";
import { SegmentedToggle } from "../../../ui/shared/SegmentedToggle";
import { useLocation } from "react-router-dom";
import RowsPerPageSelector from "../../../ui/shared/RowsPerPageSelector";

export const DeliveriesHeader: React.FC<{
  title?: string;
  filter: RangeFilter;
  setFilter: (v: RangeFilter) => void;
  limit: number;
  setLimit: (n: number) => void;
  onExport: () => void;
  disabled?: boolean;
}> = ({
  title = "Completed Orders",
  filter,
  setFilter,
  limit,
  setLimit,
  onExport,
  disabled,
}) => {
  const { pathname } = useLocation();

  // hide controls on /ongoing-order
  const hideControls = pathname === "/ongoing-order";

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-[#22c55e] text-center md:text-left break-words">
          {title}
        </h2>

        {/* Right side: rows + filters + export */}
        <div className="w-full md:w-auto">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            {/* Rows selector */}
            <div className="w-full sm:w-auto">
              <RowsPerPageSelector
                value={limit}
                onChange={setLimit}
                disabled={disabled}
              />
            </div>

            {/* Controls – hidden on /ongoing-order */}
            {!hideControls && (
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Segmented toggle with horizontal scroll on tiny screens */}
                <div className="w-full sm:w-auto max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <SegmentedToggle
                    value={filter}
                    onChange={setFilter}
                    disabled={disabled}
                  />
                </div>

                {/* Export button */}
                <button
                  onClick={onExport}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                  disabled={disabled}
                >
                  ⬇️ Export (.csv)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
