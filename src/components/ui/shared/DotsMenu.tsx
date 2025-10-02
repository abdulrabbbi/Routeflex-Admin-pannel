import React, { useEffect, useRef, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

type Item = { label: string; onClick: () => void; danger?: boolean; disabled?: boolean };

export default function DotsMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="h-9 w-9 inline-flex items-center justify-center rounded-full border hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <FiMoreVertical />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-40 rounded-xl border bg-white shadow-lg z-20 overflow-hidden"
        >
          {items.map((it, idx) => (
            <button
              key={idx}
              onClick={() => { if (!it.disabled) { it.onClick(); setOpen(false); } }}
              disabled={it.disabled}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 ${
                it.danger ? "text-red-600" : "text-gray-800"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
