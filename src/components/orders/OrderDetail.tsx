import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { approveJob, getJobById, rejectJob } from "../../api/jobs";
import { toast } from "react-toastify";
import { MdCheck, MdClose } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";

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

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getJobById(id!);
        // Accept either {data:{job}} or plain job
        const j = data;
        if (!cancelled) setJob(j);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const r = job?.route || {};

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
      await approveJob(id!);
      toast.success("Approved");
      navigate(-1);
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
      await rejectJob(id!, reason);
      toast.success("Rejected");
      navigate(-1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      toast.dismiss(t);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[#dcfce7] transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft className="w-5 h-5 text-[#22c55e]" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold ml-2">Order Detail</h1>
      </div>

      {loading && <div className="animate-pulse h-32 rounded-xl bg-gray-100" />}
      {!loading && !job && <div className="text-gray-600">Not found.</div>}

      {!loading && job && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main card */}
          <div className="bg-white rounded-2xl border p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Route</h2>
              {statusChip}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Order ID</span>
                <div className="font-medium break-all">{job._id}</div>
              </div>

              <div>
                <span className="text-gray-500">Approval</span>
                <div className="font-medium capitalize">
                  {job.approvalStatus || "—"}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Pickup</span>
                <div className="font-medium">
                  {fmtDT(r?.pickupTime || job?.createdAt)}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Delivery</span>
                <div className="font-medium">{fmtDT(r?.deliveryTime)}</div>
              </div>

              <div>
                <span className="text-gray-500">From</span>
                <div className="font-medium">
                  {r?.startAddress
                    ? `${r.startAddress.street}, ${r.startAddress.city}, ${r.startAddress.postCode}, ${r.startAddress.country}`
                    : "—"}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Stops</span>
                <div className="font-medium">
                  {r?.endLocations?.length || 0}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Category</span>
                <div className="font-medium">
                  {r?.business ? "Business" : "Individual"}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Price</span>
                <div className="font-medium">{fmtGBP(r?.price)}</div>
              </div>

              {job.approvalStatus === "approved" && (
                <>
                  <div>
                    <span className="text-gray-500">Approved At</span>
                    <div className="font-medium">{fmtDT(job.approvedAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Approved By</span>
                    <div className="font-medium">{job.approvedBy || "—"}</div>
                  </div>
                </>
              )}

              {job.approvalStatus === "rejected" && (
                <>
                  <div>
                    <span className="text-gray-500">Rejected At</span>
                    <div className="font-medium">{fmtDT(job.rejectedAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Reason</span>
                    <div className="font-medium">
                      {job.rejectionReason || "—"}
                    </div>
                  </div>
                </>
              )}

              {job.status === "cancelled" && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Cancellation Reason</span>
                  <div className="font-medium">
                    {job.cancellationReason || "—"}
                  </div>
                </div>
              )}
            </div>

            {/* Destinations */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Destinations</h3>
              <div className="space-y-2">
                {(r?.endLocations || []).map((e: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border bg-gray-50 text-sm"
                  >
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
          </div>

          {/* Side card */}
          <div className="bg-white rounded-2xl border p-4 h-max">
            <h2 className="font-semibold mb-3">Actions</h2>

            {canApproveReject ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={reject}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <MdClose /> Reject
                </button>
                <button
                  onClick={approve}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  <MdCheck /> Approve
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                No actions available for this order. Status: {statusChip}
              </div>
            )}

            {/* Placed By */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Placed By</h3>
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
          </div>
        </div>
      )}
    </div>
  );
}
