import React, { useEffect, useMemo, useState } from "react";
import { approveJob, getJobById, rejectJob } from "../../api/jobs";
import { toast } from "react-toastify";
import { MdCheck, MdClose } from "react-icons/md";
import { IoClose } from "react-icons/io5";

type Job = any;

const Pill = ({
  color,
  children,
}: {
  color: "green" | "yellow" | "red" | "blue" | "indigo" | "gray";
  children: React.ReactNode;
}) => {
  const map = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    gray: "bg-gray-100 text-gray-700",
  } as const;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${map[color]}`}
    >
      {children}
    </span>
  );
};

const fmtDT = (v?: string) => (v ? new Date(v).toLocaleString() : "—");
const fmtGBP = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(n)
    : "—";

type OrderDetailProps = {
  open: boolean;
  onClose: () => void;
  orderId: string;
};

export default function OrderDetail({ open, onClose, orderId }: OrderDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getJobById(orderId);
        if (!cancelled) setJob(data);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, open]);

  const r = useMemo(() => job?.route || {}, [job]);
  const canApproveReject =
    job?.approvalStatus === "pending" && job?.status === "available";

  const statusChip = useMemo(() => {
    if (!job) return null;
    if (job.status === "cancelled") return <Pill color="red">Cancelled</Pill>;
    if (job.approvalStatus === "rejected")
      return <Pill color="red">Rejected</Pill>;
    if (job.approvalStatus === "approved")
      return <Pill color="green">Approved</Pill>;
    if (job.approvalStatus === "pending" && job.status !== "available")
      return <Pill color="yellow">Pending</Pill>;

    switch (job.status) {
      case "accepted":
        return <Pill color="blue">Accepted</Pill>;
      case "in-progress":
        return <Pill color="indigo">In-progress</Pill>;
      case "completed":
        return <Pill color="green">Completed</Pill>;
      default:
        return <Pill color="gray">{job.status || "—"}</Pill>;
    }
  }, [job]);

  const placedBy = useMemo(() => {
    if (!r) return null;
    if (r.business) {
      return {
        type: "Business",
        name: r.business?.name || r.business?.businessName || "Business User",
        email: r.business?.email || "—",
        phone: r.business?.phone || "—",
      };
    }
    const g = r.guestDetails || {};
    const name =
      [g.firstName, g.lastName].filter(Boolean).join(" ") || "Guest User";
    return {
      type: "Individual",
      name,
      email: g.email || "—",
      phone: g.phone || "—",
    };
  }, [r]);

  const approve = async () => {
    if (!canApproveReject)
      return toast.error("This order is not eligible to approve.");
    const t = toast.loading("Approving…");
    try {
      await approveJob(orderId);
      toast.success("Approved");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Approve failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const reject = async () => {
    if (!canApproveReject)
      return toast.error("This order is not eligible to reject.");
    const reason = window.prompt("Reason (optional):") || undefined;
    const t = toast.loading("Rejecting…");
    try {
      await rejectJob(orderId, reason);
      toast.success("Rejected");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      toast.dismiss(t);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[720px] bg-white shadow-2xl rounded-l-2xl overflow-y-auto transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : job ? (
            <>
              {/* Main Info */}
              <div className="border rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Route Info
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <p><span className="font-medium">Order ID:</span> {job._id}</p>
                  <p><span className="font-medium">Approval:</span> {job.approvalStatus}</p>
                  <p><span className="font-medium">Pickup:</span> {fmtDT(r?.pickupTime || job?.createdAt)}</p>
                  <p><span className="font-medium">Delivery:</span> {fmtDT(r?.deliveryTime)}</p>
                  <p><span className="font-medium">From:</span> {r?.startAddress?.city || "—"}</p>
                  <p><span className="font-medium">Stops:</span> {r?.endLocations?.length || 0}</p>
                  <p><span className="font-medium">Category:</span> {r?.business ? "Business" : "Individual"}</p>
                  <p><span className="font-medium">Price:</span> {fmtGBP(r?.price)}</p>
                </div>
              </div>

              {/* Destinations */}
              <div className="border rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Destinations</h3>
                <div className="space-y-2">
                  {(r?.endLocations || []).map((e: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl border bg-gray-50 text-sm">
                      <div className="font-medium">
                        {e.formattedAddress || "—"}
                      </div>
                      <div className="text-gray-600">
                        ~ {e.distanceText || "—"} • {e.durationText || "—"}
                      </div>
                      {e.description ? (
                        <div className="text-gray-600">{e.description}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Placed By */}
              <div className="border rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Placed By
                </h3>
                <div className="text-sm">
                  <div className="font-medium">
                    {placedBy?.name}{" "}
                    <span className="ml-2">
                      <Pill
                        color={placedBy?.type === "Business" ? "green" : "yellow"}
                      >
                        {placedBy?.type}
                      </Pill>
                    </span>
                  </div>
                  <div className="text-gray-600">{placedBy?.email}</div>
                  <div className="text-gray-600">{placedBy?.phone}</div>
                </div>
              </div>

              {/* Actions */}
              {canApproveReject && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    onClick={reject}
                  >
                    <MdClose /> Reject
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    onClick={approve}
                  >
                    <MdCheck /> Approve
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">No order found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
