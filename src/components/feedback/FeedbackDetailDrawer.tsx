import React, { useMemo } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import { TypeBadge, RatingStars } from "./Atoms";
import { labelForUser } from "../../utils/labelForUser";

// Reuse your API type if exported from feedbackService
export type Feedback = {
  _id: string;
  type: "bug" | "feature" | "service" | "payment" | "delivery" | "other";
  subject?: string;
  message?: string;
  rating?: number;
  name?: string;
  email?: string;
  user?: unknown;         // whatever your labelForUser handles
  pagePath?: string;
  meta?: {
    userAgent?: string;
    appVersion?: string;
  };
  createdAt: string;
};

type Props = {
  open: boolean;
  detail: Feedback | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
};

const fmtDateTime = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const FeedbackDetailDrawer: React.FC<Props> = ({
  open,
  detail,
  onClose,
  onDelete,
  deletingId,
}) => {
  const isDeleting = deletingId === detail?._id;

  // pre-calc derived display values
  const idShort = useMemo(
    () => (detail?._id ? detail._id.slice(-6).toUpperCase() : "—"),
    [detail?._id]
  );
  const created = useMemo(() => fmtDateTime(detail?.createdAt), [detail?.createdAt]);
  const subject = detail?.subject || "—";
  const message = detail?.message || "—";
  const fromLine = useMemo(() => {
    const name = detail?.name?.trim();
    const email = detail?.email?.trim();
    if (!name && !email) return "—";
    if (name && email) return `${name} • ${email}`;
    return name || email || "—";
  }, [detail?.name, detail?.email]);

  const userLabel = useMemo(
    () => (detail?.user ? labelForUser(detail.user) : undefined),
    [detail?.user]
  );

  if (!open || !detail) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* panel */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#1e1e38]">
              Feedback Details
            </h2>
            <div className="text-xs text-gray-500 mt-0.5">
              ID <span className="font-mono">{idShort}</span> • {created}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border hover:bg-gray-50"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-6">
          {/* Top summary */}
          <div>
            <div className="flex items-center gap-2">
              <TypeBadge value={detail.type} />
              <span className="text-xs text-gray-500">{created}</span>
            </div>

            <h3 className="mt-2 text-xl font-bold text-[#1e1e38] break-words">
              {subject}
            </h3>

            <div className="mt-1">
              <RatingStars value={detail.rating ?? 0} />
            </div>
          </div>

          {/* Message */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Message</h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
          </div>

          {/* From / Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 border rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-1">From</h5>
              <p className="text-sm text-gray-800">{fromLine}</p>
              {userLabel && (
                <p className="text-xs text-gray-500 font-mono mt-1">
                  user: {userLabel}
                </p>
              )}
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-1">
                Context
              </h5>
              <p className="text-sm text-gray-800 break-all">
                {detail.pagePath || "—"}
              </p>
              {detail.meta?.userAgent && (
                <p className="text-xs text-gray-500 mt-1">
                  UA: {detail.meta.userAgent}
                </p>
              )}
              {detail.meta?.appVersion && (
                <p className="text-xs text-gray-500">
                  App: {detail.meta.appVersion}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onDelete(detail._id)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm rounded-lg border text-red-600 hover:bg-red-50 disabled:opacity-60 inline-flex items-center gap-2"
            >
              <FiTrash2 />
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default React.memo(FeedbackDetailDrawer);
