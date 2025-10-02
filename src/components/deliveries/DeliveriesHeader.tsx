"use client";

import React from "react";
import { RangeFilter } from "../../types/deliveries";
import { SegmentedToggle } from "./SegmentedToggle";

export const DeliveriesHeader: React.FC<{
  filter: RangeFilter;
  setFilter: (v: RangeFilter) => void;
  limit: number;
  setLimit: (n: number) => void;
  onExport: () => void;
  disabled?: boolean;
}> = ({ filter, setFilter, limit, setLimit, onExport, disabled }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">Parcels</h2>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedToggle
          value={filter}
          onChange={setFilter}
          disabled={disabled}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm disabled:opacity-50"
            disabled={disabled}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
          disabled={disabled}
        >
          ⬇️ Export (.csv)
        </button>
      </div>
    </div>
  );
};
