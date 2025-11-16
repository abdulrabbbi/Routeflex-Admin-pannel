import React from "react";

type RowsPerPageSelectorProps = {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  className?: string;
};

const RowsPerPageSelector: React.FC<RowsPerPageSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-gray-600 whitespace-nowrap">Rows:</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border rounded-lg px-2 py-1.5 text-sm disabled:opacity-50 min-w-[72px]"
        disabled={disabled}
        aria-label="Rows per page"
      >
        {[10, 20, 50].map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </select>
    </div>
  );
};

export default RowsPerPageSelector;

