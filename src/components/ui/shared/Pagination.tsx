import React from "react";

export const Pagination: React.FC<{
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}> = ({ page, totalPages, onPrev, onNext, disabled }) => (
  <div className="flex items-center justify-between gap-3">
    <button
      disabled={page <= 1 || disabled}
      onClick={onPrev}
      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
    >
      ← Previous
    </button>
    <span className="text-sm text-gray-600">
      Page <strong>{page}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
    </span>
    <button
      disabled={page >= totalPages || disabled || totalPages === 0}
      onClick={onNext}
      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
    >
      Next →
    </button>
  </div>
);
