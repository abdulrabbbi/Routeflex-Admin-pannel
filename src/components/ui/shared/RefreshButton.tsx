"use client";

import React from "react";
import { IoRefresh } from "react-icons/io5";

type RefreshButtonProps = {
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string;
  children?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "onDark";
};

/**
 * RefreshButton
 * - Shows a spinner when loading
 * - Disables interactions while loading
 * - Accessible with aria-busy and aria-live
 */
const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
  title = "Refresh",
  children,
  variant = "default",
}) => {
  const isDisabled = disabled || loading;
  const base = "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
  const stylesByVariant: Record<NonNullable<RefreshButtonProps["variant"]>, string> = {
    default: "border bg-white text-gray-700 hover:bg-gray-50",
    primary: "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700",
    success: "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
    onDark: "border border-white/30 bg-white/10 text-white hover:bg-white/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-live="polite"
      title={title}
      className={[base, stylesByVariant[variant], isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer", className].join(" ")}
    >
      {loading ? (
        // Spinner
        <svg
          className="h-4 w-4 animate-spin text-current"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        <IoRefresh className="h-4 w-4 transition-transform duration-200" />
      )}
      <span>{children ?? "Refresh"}</span>
    </button>
  );
};

export default RefreshButton;
