import React from "react";
import { RangeFilter } from "../../types/deliveries";

export const SegmentedToggle: React.FC<{
  value: RangeFilter;
  onChange: (v: RangeFilter) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const options: Array<{ id: RangeFilter; label: string }> = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
  ];
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 ${
            value === opt.id
              ? "bg-[#22c55e] text-white shadow"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
