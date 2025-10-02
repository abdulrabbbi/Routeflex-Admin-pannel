import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { MdCheck, MdClose } from "react-icons/md";
import { TableSkeleton } from "../../components/ui/shared/Skeleton";
import TablePager from "../../components/ui/shared/TablePager";
import { EmptyStateRow } from "../../components/ui/shared/EmptyStateRow";
import Tag from "../../components/ui/shared/Tag";

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

function StatusChip(job: Job) {
  if (job?.status === "cancelled") return <Tag color="red">Cancelled</Tag>;
  if (job?.approvalStatus === "rejected") return <Tag color="red">Rejected</Tag>;
  if (job?.approvalStatus === "approved") return <Tag color="green">Approved</Tag>;
  if (job?.approvalStatus === "pending" && job?.status !== "available")
    return <Tag color="yellow">Pending</Tag>;

  switch (job?.status) {
    case "available":
      return <Tag color="gray">Available</Tag>;
    case "accepted":
      return <Tag color="blue">Accepted</Tag>;
    case "in-progress":
      return <Tag color="indigo">In-progress</Tag>;
    case "completed":
      return <Tag color="green">Completed</Tag>;
    default:
      return <Tag color="gray">{job?.status || "—"}</Tag>;
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

  // selection + actions
  selected,
  allChecked,
  onToggleAll,
  onToggleRow,
  isEligible,
  onApprove,
  onReject,

  // view link
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
  // min-height: pad with blank rows when not loading
  const displayRows = useMemo(() => {
    if (loading) return [];
    const pad = Math.max(MIN_ROWS - rows.length, 0);
    return [...rows, ...Array.from({ length: pad }).map(() => ({} as Job))];
  }, [rows, loading]);

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border">
      <table className="min-w-[860px] w-full">
        <thead>
          <tr className="bg-[#f0fdf4] text-[#22c55e] text-xs uppercase">
            <th className=" pr-11 py-3">
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
            <th className="px-4 py-3 text-left">Order</th>
            <th className="px-4 py-3 text-left">Placed By</th>
            <th className="px-4 py-3 text-left">Date & Time</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Price</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>

        {/* Loading */}
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
              // padded placeholders
              if (!job || !job._id) {
                return (
                  <tr key={`pad-${idx}`}>
                    {Array.from({ length: 7 }).map((_, c) => (
                      <td key={c} className="px-4 py-4">
                        <div className="h-4 w-28 bg-gray-50 rounded" />
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
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="pl-10 py-4">
                    <input
                      type="checkbox"
                      disabled={!eligible}
                      checked={!!selected[job._id]}
                      onChange={(e) => onToggleRow(job._id, e.target.checked)}
                      title={
                        eligible ? "Select row" : "Not eligible for bulk actions"
                      }
                    />
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-semibold text-gray-900">{idShort}</span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {avatarFromName(pb.name)}
                      <div>
                        <div className="font-medium text-gray-900">{pb.name}</div>
                        <div className="text-gray-500 text-sm">{pb.email || "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-800">{fmtDateTime(job)}</td>

                  <td className="px-4 py-4">
                    <Tag color={categoryColor as any}>{pb.type}</Tag>
                  </td>

                  <td className="px-4 py-4 text-gray-800">
                    {formatPrice(job?.route?.price)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {eligible ? (
                        <>
                          <button
                            onClick={() => onReject(job._id)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                            title="Reject"
                          >
                            <MdClose size={18} />
                          </button>
                          <button
                            onClick={() => onApprove(job._id)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Approve"
                          >
                            <MdCheck size={18} />
                          </button>
                        </>
                      ) : (
                        <div className="min-w-[96px] text-right">
                          {StatusChip(job)}
                        </div>
                      )}

                      <Link
                        to={getViewUrl(job._id)}
                        className="h-9 inline-flex items-center justify-center px-3 rounded-full border hover:bg-gray-50"
                        title="More"
                      >
                        More
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </table>

      {/* Footer: pager */}
      <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
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
  );
}
