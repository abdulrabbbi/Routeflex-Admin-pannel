import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MdCheck, MdClose } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { TableSkeleton } from "../../components/ui/shared/Skeleton";
import TablePager from "../../components/ui/shared/TablePager";
import { EmptyStateRow } from "../../components/ui/shared/EmptyStateRow";
import Tag from "../../components/ui/shared/Tag";
import OrderDetail from "./OrderDetail";

const MIN_ROWS = 10;
type Job = any;

function avatarFromName(name: string) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
      {letter || "?"}
    </div>
  );
}

function formatPrice(n?: number) {
  if (typeof n !== "number") return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n}`;
  }
}

function placedBy(job: Job) {
  const business = job?.route?.business;
  if (business) {
    const name = business?.name || business?.businessName || "Business User";
    const email = business?.email;
    return { name, email, type: "Business" as const };
  }
  const guest = job?.route?.guestDetails || {};
  const fullName =
    [guest.firstName, guest.lastName].filter(Boolean).join(" ") || "Guest User";
  return { name: fullName, email: guest.email, type: "Individual" as const };
}

function fmtDateTime(job: Job) {
  const dt = job?.createdAt || job?.route?.pickupTime;
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "—";
  }
}

export default function OrdersTable({
  rows,
  loading = false,
  error,
  page,
  totalPages,
  limit,
  onLimitChange,
  onPrev,
  onNext,
  selected,
  allChecked,
  onToggleAll,
  onToggleRow,
  isEligible,
  onApprove,
  onReject,
  getViewUrl = (id: string) => `/orders/${id}`,
}: {
  rows: Job[];
  loading?: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  limit: number;
  onLimitChange: (n: number) => void;
  onPrev: () => void;
  onNext: () => void;
  selected: Record<string, boolean>;
  allChecked: boolean;
  onToggleAll: () => void;
  onToggleRow: (id: string, checked: boolean) => void;
  isEligible: (job: Job) => boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  getViewUrl?: (id: string) => string;
}) {
  const displayRows = useMemo(() => {
    if (loading) return [];
    const pad = Math.max(MIN_ROWS - rows.length, 0);
    return [...rows, ...Array.from({ length: pad }).map(() => ({} as Job))];
  }, [rows, loading]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const openDrawer = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto w-full bg-white rounded-2xl border shadow-sm">
        <table className="min-w-[860px] w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#f0fdf4] text-[#22c55e] text-xs uppercase">
              <th className="w-8 px-2 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={onToggleAll}
                  disabled={rows.filter(isEligible).length === 0 || loading}
                  title={
                    rows.filter(isEligible).length === 0
                      ? "No eligible rows to select"
                      : "Select all"
                  }
                />
              </th>
              <th className="px-3 py-3 whitespace-nowrap">Order</th>
              <th className="px-3 py-3 whitespace-nowrap">Customer Name</th>
              <th className="px-3 py-3 whitespace-nowrap">Date & Time</th>
              <th className="px-3 py-3 whitespace-nowrap">Category</th>
              <th className="px-3 py-3 whitespace-nowrap">Price</th>
              <th className="px-3 py-3 whitespace-nowrap">Action</th>
            </tr>
          </thead>

          {loading ? (
            <TableSkeleton rows={MIN_ROWS} columns={7} />
          ) : error ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-red-600">
                  {error}
                </td>
              </tr>
            </tbody>
          ) : rows.length === 0 ? (
            <tbody>
              <EmptyStateRow
                colSpan={7}
                title="No orders found"
                hint="Try changing filters or refreshing."
              />
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-100">
              {displayRows.map((job, idx) => {
                if (!job || !job._id) {
                  return (
                    <tr key={`pad-${idx}`}>
                      {Array.from({ length: 7 }).map((_, c) => (
                        <td key={c} className="px-3 py-4">
                          <div className="h-4 w-24 bg-gray-50 rounded" />
                        </td>
                      ))}
                    </tr>
                  );
                }

                const pb = placedBy(job);
                const categoryColor = pb.type === "Business" ? "green" : "yellow";
                const eligible = isEligible(job);
                const idShort = `#${(job._id || "").slice(-4) || "----"}`;

                return (
                  <tr key={job._id} className="hover:bg-gray-50 text-center">
                    <td className="w-8 px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        disabled={!eligible}
                        checked={!!selected[job._id]}
                        onChange={(e) => onToggleRow(job._id, e.target.checked)}
                      />
                    </td>

                    <td className="px-3 py-3 font-semibold cursor-pointer text-gray-900">
                      <div onClick={() => openDrawer(job._id)}>{idShort}</div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {avatarFromName(pb.name)}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{pb.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                      {fmtDateTime(job)}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <Tag color={categoryColor as any}>{pb.type}</Tag>
                    </td>

                    <td className="px-3 py-3 text-gray-800 whitespace-nowrap">
                      {formatPrice(job?.route?.price)}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-center">
                        {eligible && (
                          <>
                            <button
                              onClick={() => onReject(job._id)}
                              className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                              title="Reject"
                            >
                              <MdClose size={16} />
                            </button>
                            <button
                              onClick={() => onApprove(job._id)}
                              className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Approve"
                            >
                              <MdCheck size={16} />
                            </button>
                          </>
                        )}
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-emerald-600"
                          title="View Details"
                          onClick={() => openDrawer(job._id)}
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>

        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="border rounded-lg px-2 py-1.5 text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>

          <TablePager
            page={page}
            totalPages={totalPages}
            onPrev={onPrev}
            onNext={onNext}
            disabled={loading}
          />
        </div>
      </div>

      {/* Drawer (like TrackOrderDrawer) */}
      {selectedOrderId && (
        <OrderDetail
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          orderId={selectedOrderId}
        />
      )}
    </>
  );
}
