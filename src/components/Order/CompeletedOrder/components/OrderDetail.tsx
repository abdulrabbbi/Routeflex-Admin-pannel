import React, { useEffect, useMemo, useState } from "react";
import {  getJobById } from "../../../../api/jobs";
import { toast } from "react-toastify";
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
        const res = await getJobById(orderId);
        if (!cancelled) setJob(res);
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

  const r = job?.route || {};

  const statusChip = useMemo(() => {
    if (!job) return null;
    if (job.status === "cancelled") return <Pill color="red">Cancelled</Pill>;
    if (job.approvalStatus === "rejected")
      return <Pill color="red">Rejected</Pill>;
    if (job.approvalStatus === "approved")
      return <Pill color="green">Approved</Pill>;
    if (job.approvalStatus === "pending")
      return <Pill color="yellow">Pending</Pill>;
    return <Pill color="gray">{job.status || "—"}</Pill>;
  }, [job]);


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="absolute right-0 top-0 h-full w-full max-w-[720px] bg-white shadow-2xl rounded-l-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <IoClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : !job ? (
            <div className="text-center text-gray-500">No order found.</div>
          ) : (
            <>
              {/* --- General Info --- */}
              <div className="border rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">General Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <p><span className="font-medium">Job ID:</span> {job._id}</p>
                  <p><span className="font-medium">Status:</span> {statusChip}</p>
                  <p><span className="font-medium">Approval:</span> {job.approvalStatus}</p>
                  <p><span className="font-medium">Approved By:</span> {job.approvedBy || "—"}</p>
                  <p><span className="font-medium">Approved At:</span> {fmtDT(job.approvedAt)}</p>
                  <p><span className="font-medium">Created At:</span> {fmtDT(job.createdAt)}</p>
                  <p><span className="font-medium">Updated At:</span> {fmtDT(job.updatedAt)}</p>
                </div>
              </div>

              {/* --- Route Info --- */}
              <div className="border rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Route Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <p><span className="font-medium">Start City:</span> {r.startAddress?.city}</p>
                  <p><span className="font-medium">Start Street:</span> {r.startAddress?.street}</p>
                  <p><span className="font-medium">Postcode:</span> {r.startAddress?.postCode}</p>
                  <p><span className="font-medium">Country:</span> {r.startAddress?.country}</p>
                  <p><span className="font-medium">Pickup Time:</span> {fmtDT(r.pickupTime)}</p>
                  <p><span className="font-medium">Delivery Time:</span> {fmtDT(r.deliveryTime)}</p>
                  <p><span className="font-medium">Distance:</span> {r.distanceText || `${(r.distanceValue / 1000).toFixed(1)} km`}</p>
                  <p><span className="font-medium">Price:</span> {fmtGBP(r.price)}</p>
                  <p><span className="font-medium">Description:</span> {r.startDescription || "—"}</p>
                </div>
              </div>

              {/* --- End Locations --- */}
              <div className="border rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">End Locations</h3>
                {(r.endLocations || []).map((loc: any, i: number) => (
                  <div key={i} className="border p-3 rounded-md bg-gray-50 text-sm">
                    <p className="font-medium">{loc.formattedAddress}</p>
                    <p>Distance: {loc.distanceText}</p>
                    <p>Duration: {loc.durationText}</p>
                    <p>Description: {loc.description}</p>
                    <p>Received: {loc.Recieved ? "Yes" : "No"}</p>
                  </div>
                ))}
              </div>

              {/* --- Package Details --- */}
              <div className="border rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Package Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <p><span className="font-medium">Type:</span> {r.packageType}</p>
                  <p><span className="font-medium">Category:</span> {r.packageCategory}</p>
                  <p><span className="font-medium">Size:</span> {r.packageSize}</p>
                  <p><span className="font-medium">Weight:</span> {r.packageWeight} kg</p>
                  <p><span className="font-medium">Is Emergency:</span> {r.isEmergency ? "Yes" : "No"}</p>
                </div>
              </div>

              {/* --- Vehicle Info --- */}
              <div className="border rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Vehicle Info</h3>
                <div className="text-sm text-gray-700">
                  <p><span className="font-medium">Vehicle Type:</span> {r.vehicleType}</p>
                </div>
              </div>

              {/* --- Business Info --- */}
              {r.business && (
                <div className="border rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Business Info
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Business Name:</span>{" "}
                      {r.business?.name || r.business?.businessName || "Business User"}
                    </p>
                    <p>
                      <span className="font-medium">Business ID:</span>{" "}
                      {r.business?._id || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {r.business?.email || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {r.business?.phone || "—"}
                    </p>
                  </div>
                </div>
              )}


              {/* --- QR Code --- */}
              {r.qrCode && (
                <div className="border rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">QR Code</h3>
                  <img src={r.qrCode} alt="QR Code" className="w-40 h-40 object-contain" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
