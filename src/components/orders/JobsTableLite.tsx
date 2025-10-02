import React from "react";
import DotsMenu from "../../components/ui/shared/DotsMenu";
import Tag from "../../components/ui/shared/Tag";
import { currency } from "../../utils/number";
import type { Job } from "../../types/job";
import { EmptyStateRow } from "../../components/ui/shared/EmptyStateRow";

// ✅ import the shared skeleton rows
import { TableSkeleton } from "../../components/ui/shared/Skeleton";

function StatusChip(job: Job) {
  if (job.status === "cancelled") return <Tag color="red">Cancelled</Tag>;
  if (job.approvalStatus === "rejected") return <Tag color="red">Rejected</Tag>;
  if (job.approvalStatus === "approved")
    return <Tag color="green">Approved</Tag>;
  if (job.approvalStatus === "pending" && job.status !== "available")
    return <Tag color="yellow">Pending</Tag>;

  switch (job.status) {
    case "available":
      return <Tag color="gray">Available</Tag>;
    case "accepted":
      return <Tag color="blue">Accepted</Tag>;
    case "in-progress":
      return <Tag color="indigo">In-progress</Tag>;
    case "completed":
      return <Tag color="green">Completed</Tag>;
    default:
      return <Tag color="gray">{job.status || "—"}</Tag>;
  }
}

export default function JobsTableLite({
  rows,
  loading,
  onView,
  onAssign,
}: {
  rows: Job[];
  loading: boolean;
  onView: (jobId: string) => void;
  onAssign: (jobId: string) => void;
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl border">
      <table className="min-w-[820px] w-full">
        <thead>
          <tr className="bg-[#f0fdf4] text-[#22c55e] text-xs uppercase">
            <th className="px-4 py-3 text-left">Order</th>
            <th className="px-4 py-3 text-left">Price</th>
            <th className="px-4 py-3 text-left">Distance (km)</th>
            <th className="px-4 py-3 text-left">Customer Email</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-0">
                <div className=" grid place-items-center text-center px-4">
                  <EmptyStateRow colSpan={6} title="No jobs found" hint="Try refreshing." />
                </div>
              </td>
            </tr>
          ) : (
            // when we have some rows, pad to a minimum of 10
            (() => {
              const MIN_ROWS = 10;
              const padCount = Math.max(0, MIN_ROWS - rows.length);
              const displayRows = [...rows, ...Array(padCount).fill(null)];

              return displayRows.map((job, idx) => {
                // Placeholder rows
                if (!job) {
                  return (
                    <tr key={`pad-${idx}`} className="hover:bg-transparent">
                      <td className="px-4 py-4">
                        <div
                          className="h-4 w-20 bg-gray-50 rounded animate-pulse"
                          aria-hidden
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="h-4 w-16 bg-gray-50 rounded animate-pulse"
                          aria-hidden
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="h-4 w-24 bg-gray-50 rounded animate-pulse"
                          aria-hidden
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="h-4 w-44 bg-gray-50 rounded animate-pulse"
                          aria-hidden
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="h-6 w-20 bg-gray-50 rounded-full animate-pulse"
                          aria-hidden
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <div
                            className="h-8 w-16 bg-gray-50 rounded-md animate-pulse"
                            aria-hidden
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }

                // Real data rows
                const idShort = `#${job._id.slice(-6).toUpperCase()}`;
                const price = currency(job.route?.price);
                const distance =
                  typeof job.route?.distance === "number"
                    ? job.route.distance.toFixed(2)
                    : "—";
                const email = job.route?.business?.email || "—";

                return (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {idShort}
                    </td>
                    <td className="px-4 py-4 text-gray-800">{price}</td>
                    <td className="px-4 py-4 text-gray-800">{distance}</td>
                    <td className="px-4 py-4 text-gray-800">{email}</td>
                    <td className="px-4 py-4">{StatusChip(job)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <DotsMenu
                          items={[
                            {
                              label: "Assign to Driver",
                              onClick: () => onAssign(job._id),
                            },
                            { label: "View", onClick: () => onView(job._id) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              });
            })()
          )}
        </tbody>
      </table>
    </div>
  );
}
