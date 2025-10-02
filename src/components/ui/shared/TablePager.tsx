import React from "react";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
};

const TablePager: React.FC<Props> = ({
  page,
  totalPages,
  onPrev,
  onNext,
  disabled = false,
  className = "",
}) => {
  const safePage = Math.max(page || 1, 1);
  const safeTotal = Math.max(totalPages || 1, 1);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled || safePage <= 1}
        className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <span className="text-sm text-gray-600">
        Page <strong>{safePage}</strong> of <strong>{safeTotal}</strong>
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={disabled || safePage >= safeTotal}
        className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
};

export default React.memo(TablePager);
