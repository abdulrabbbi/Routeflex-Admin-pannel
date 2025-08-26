// src/pages/orders/OrderDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { approveJob, getJobById, rejectJob } from "../../api/jobs";
import { Toaster, toast } from "react-hot-toast";
import { MdArrowBack, MdCheck, MdClose } from "react-icons/md";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getJobById(id!);
        if (!cancelled) setJob(data);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const approve = async () => {
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

  const item = job;
  const r = item?.route || {};

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50">
          <MdArrowBack /> Back
        </button>
        <h1 className="text-xl md:text-2xl font-semibold ml-2">Order Detail</h1>
      </div>

      {loading && <div className="animate-pulse h-32 rounded-xl bg-gray-100" />}
      {!loading && !item && <div className="text-gray-600">Not found.</div>}

      {!loading && item && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border p-4 lg:col-span-2">
            <h2 className="font-semibold mb-3">Route</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Order ID</span><div className="font-medium break-all">{item._id}</div></div>
              <div><span className="text-gray-500">Status</span><div className="font-medium">{item.status} / {item.approvalStatus}</div></div>
              <div><span className="text-gray-500">Pickup</span><div className="font-medium">{new Date(r?.pickupTime || item?.createdAt).toLocaleString()}</div></div>
              <div><span className="text-gray-500">Delivery</span><div className="font-medium">{r?.deliveryTime ? new Date(r.deliveryTime).toLocaleString() : "-"}</div></div>
              <div><span className="text-gray-500">From</span><div className="font-medium">
                {r?.startAddress ? `${r.startAddress.street}, ${r.startAddress.city}, ${r.startAddress.postCode}, ${r.startAddress.country}` : "-"}
              </div></div>
              <div><span className="text-gray-500">Stops</span><div className="font-medium">{r?.endLocations?.length || 0}</div></div>
              <div><span className="text-gray-500">Category</span><div className="font-medium">{r?.business ? "Business" : "Individual"}</div></div>
              <div><span className="text-gray-500">Price</span><div className="font-medium">{typeof r?.price === "number" ? `£${r.price}` : "-"}</div></div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Destinations</h3>
              <div className="space-y-2">
                {(r?.endLocations || []).map((e: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl border bg-gray-50 text-sm">
                    <div className="font-medium">{e.formattedAddress || "-"}</div>
                    <div className="text-gray-600">~ {e.distanceText} • {e.durationText}</div>
                    <div className="text-gray-600">{e.description || ""}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-4 h-max">
            <h2 className="font-semibold mb-3">Actions</h2>
            <div className="flex items-center gap-2">
              <button onClick={reject} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100">
                <MdClose /> Reject
              </button>
              <button onClick={approve} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">
                <MdCheck /> Approve
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Placed By</h3>
              <div className="text-sm">
                {r?.business ? (
                  <>
                    <div className="font-medium">{r.business?.name || r.business?.businessName || "Business User"}</div>
                    <div className="text-gray-600">{r.business?.email || "-"}</div>
                    <div className="text-gray-600">{r.business?.phone || "-"}</div>
                  </>
                ) : (
                  <>
                    <div className="font-medium">
                      {[(r?.guestDetails?.firstName || ""), (r?.guestDetails?.lastName || "")].filter(Boolean).join(" ") || "Guest User"}
                    </div>
                    <div className="text-gray-600">{r?.guestDetails?.email || "-"}</div>
                    <div className="text-gray-600">{r?.guestDetails?.phone || "-"}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
