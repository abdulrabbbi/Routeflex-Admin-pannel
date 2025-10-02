import React, { useMemo, useState } from "react";
import { FiEye, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { TableSkeleton } from "../../components/ui/shared/Skeleton";
import TablePager from "../../components/ui/shared/TablePager";
import { TypeBadge, RatingStars } from "../feedback/Atoms";

// If you already export this type from your API layer, import it instead:
export type Feedback = {
  _id: string;
  type: "bug" | "feature" | "service" | "payment" | "delivery" | "other";
  subject?: string;
  message?: string;
  rating?: number;
  createdAt: string;
};

type Props = {
  items: Feedback[];
  loading?: boolean;

  // pagination
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;

  // actions
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;

  // visuals
  minRows?: number; // default 10
};

const HEADERS = ["ID#", "Type", "Subject", "Rating", "Created", "Actions"];

const FeedbackTable: React.FC<Props> = ({
  items,
  loading = false,
  page,
  totalPages,
  onPrev,
  onNext,
  onView,
  onDelete,
  deletingId,
  minRows = 10,
}) => {
  // how many pad rows to render to preserve min height
  const padCount = useMemo(
    () => Math.max(0, minRows - (Array.isArray(items) ? items.length : 0)),
    [items, minRows]
  );

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="min-w-full">
        <thead>
          <tr className="bg-[#f0fdf4]">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-sm font-medium text-[#22c55e] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        {loading ? (
          <tbody>
            <TableSkeleton
              rows={minRows}
              columns={HEADERS.length}
              cellClassName="px-6 py-4"
            />
          </tbody>
        ) : items.length === 0 ? (
          <tbody>
            {/* empty-state row */}
            <tr>
              <td
            colSpan={HEADERS.length}
            className="px-6 py-10 text-center text-gray-500"
              >
            No feedback found.
              </td>
            </tr>
            {/* pad rows to keep min height */}
            {Array.from({ length: Math.max(0, minRows - 1) }).map((_, i) => (
              <tr key={`pad-empty-${i}`} className="border-t">
            {Array.from({ length: HEADERS.length }).map((__, c) => (
              <td key={c} className="px-6 py-4">
                <div className="h-4" />
              </td>
            ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody className="divide-y divide-gray-100">
            {items.map((f) => {
              const idShort = f._id.slice(-6).toUpperCase();
              const created = new Date(f.createdAt).toLocaleString();

              return (
            <tr key={f._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-[#1e1e38] font-mono">
                {idShort}
              </td>

              <td className="px-6 py-4 text-sm">
                <TypeBadge value={f.type} />
              </td>

              <td className="px-6 py-4 text-sm text-[#1e1e38]">
                <div className="line-clamp-1">{f.subject || "—"}</div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  {f.message || "—"}
                </div>
              </td>

              <td className="px-6 py-4">
                <RatingStars value={f.rating ?? 0} />
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">{created}</td>

                <td className="px-6 py-4 text-sm relative">
                <button
                  onClick={() =>
                  setMenuOpenId(menuOpenId === f._id ? null : f._id)
                  }
                  className="inline-flex items-center rounded-md border px-2 py-1.5 hover:bg-gray-50"
                  aria-haspopup="menu"
                  aria-expanded={menuOpenId === f._id}
                  aria-label="More actions"
                >
                  <FiMoreVertical />
                </button>

                {menuOpenId === f._id && (
                  <div
                  role="menu"
                  className="absolute right-6 mt-2 w-44 rounded-lg border bg-white shadow-lg ring-1 ring-black/5 z-10"
                  >
                  <button
                    onClick={() => {
                    setMenuOpenId(null);
                    onView(f._id);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    role="menuitem"
                  >
                    <FiEye /> View
                  </button>
                  <button
                    onClick={() => onDelete(f._id)}
                    disabled={deletingId === f._id}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                    deletingId === f._id
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50"
                    }`}
                    role="menuitem"
                  >
                    <FiTrash2 />
                    {deletingId === f._id ? "Deleting…" : "Delete"}
                  </button>
                  </div>
                )}
                </td>
            </tr>
              );
            })}

            {/* pad rows to preserve min height when less than minRows */}
            {padCount > 0 &&
              Array.from({ length: padCount }).map((_, r) => (
            <tr key={`pad-${r}`} className="border-t">
              {Array.from({ length: HEADERS.length }).map((__, c) => (
                <td key={c} className="px-6 py-4">
                  <div className="h-4" />
                </td>
              ))}
            </tr>
              ))}
          </tbody>
        )}
      </table>

      {/* Footer / Pager (right aligned) */}
      <div className="px-6 py-4 flex items-center justify-end">
        <TablePager
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default React.memo(FeedbackTable);
