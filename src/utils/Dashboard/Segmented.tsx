import React from "react";

export type RangeType = "daily" | "weekly" | "monthly";

interface SegmentedProps {
  value: RangeType;
  onChange: (v: RangeType) => void;
}

const Segmented: React.FC<SegmentedProps> = ({ value, onChange }) => {
  const opts: RangeType[] = ["daily", "weekly", "monthly"];

  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {opts.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3.5 py-2 text-sm font-medium rounded-lg transition ${
            value === opt
              ? "bg-[#22c55e] text-white shadow"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default Segmented;
