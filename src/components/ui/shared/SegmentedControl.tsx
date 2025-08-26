import React from "react";

type Item = { key: string; label: string };
type Props = {
  items: Item[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
};

export default function SegmentedControl({ items, value, onChange, className }: Props) {
  return (
    <div
      className={`inline-flex items-center rounded-full border border-emerald-200 bg-white p-1 ${className || ""}`}
      role="tablist"
      aria-label="Orders/Drivers toggle"
    >
      {items.map((it, idx) => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key)}
            className={[
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              active
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-emerald-600 hover:bg-emerald-50"
            ].join(" ")}
            style={{
              borderTopLeftRadius: idx === 0 ? 999 : 999,
              borderBottomLeftRadius: idx === 0 ? 999 : 999,
              borderTopRightRadius: idx === items.length - 1 ? 999 : 999,
              borderBottomRightRadius: idx === items.length - 1 ? 999 : 999
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
