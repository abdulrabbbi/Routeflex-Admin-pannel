import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { approveJob, listAdminJobs, rejectJob } from "../api/jobs";
import { Toaster, toast } from "react-hot-toast";
import { MdCheck, MdClose, MdRefresh, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { EmptyStateRow } from "../components/ui/shared/EmptyStateRow";
import SegmentedControl from "../components/ui/shared/SegmentedControl";
import JobAssignmentPage from "../components/orders/JobAssignmentPage";

type Job = any; 

const Tag = ({ color = "green", children }: { color?: "green" | "yellow" | "red" | "blue"; children: React.ReactNode }) => {
  const styles: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-semibold ${styles[color]}`}>{children}</span>;
};

function avatarFromName(name: string) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
      {letter || "?"}
    </div>
  );
}

function faviconFromEmail(email?: string) {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1];
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return <img src={src} alt={domain} className="h-6 w-6 rounded-full" />;
}

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4"><div className="h-5 w-10 bg-gray-200 rounded" /></td>
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-36 bg-gray-200 rounded" />
        </div>
      </div>
    </td>
    <td className="px-4 py-4"><div className="h-3 w-28 bg-gray-200 rounded" /></td>
    <td className="px-4 py-4"><div className="h-6 w-20 bg-gray-200 rounded-lg" /></td>
    <td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-6 w-6 bg-gray-200 rounded-full" /><div className="h-3 w-20 bg-gray-200 rounded" /></div></td>
    <td className="px-4 py-4"><div className="flex gap-2"><div className="h-8 w-8 bg-gray-200 rounded-full" /><div className="h-8 w-8 bg-gray-200 rounded-full" /><div className="h-8 w-16 bg-gray-200 rounded-full" /></div></td>
  </tr>
);

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // segmented tab in URL (?tab=orders|drivers)
  const tab = (params.get("tab") || "orders") as "orders" | "drivers";

  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 10);
  const approvalStatus = params.get("approvalStatus") || "pending"; // default to pending for admin review
  const status = params.get("status") || "available";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const query = useMemo(() => ({ page, limit, status, approvalStatus }), [page, limit, status, approvalStatus]);

  // fetch only when in "orders" tab
  useEffect(() => {
    if (tab !== "orders") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await listAdminJobs(query);
        if (cancelled) return;
        setRows(data?.data?.jobs || []);
        setTotalPages(data?.totalPages || 1);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, limit, approvalStatus, status, refreshKey]);

  const setParam = (k: string, v: string | number) => {
    const next = new URLSearchParams(params);
    next.set(k, String(v));
    if (k !== "page") next.set("page", "1"); // reset page when filter/limit changes
    setParams(next, { replace: true });
  };

  const shortId = (id: string) => `#${id?.slice(-4) || "----"}`;

  const placedBy = (job: Job) => {
    const business = job?.route?.business;
    if (business) {
      const name = business?.name || business?.businessName || "Business User";
      const email = business?.email;
      return { name, email, type: "Business" as const };
    }
    const guest = job?.route?.guestDetails || {};
    const fullName = [guest.firstName, guest.lastName].filter(Boolean).join(" ") || "Guest User";
    return { name: fullName, email: guest.email, type: "Individual" as const };
  };

  const dateTime = (job: Job) => {
    const dt = job?.createdAt || job?.route?.pickupTime;
    try { return new Date(dt).toLocaleString(); } catch { return "-"; }
  };

  const approveOne = async (jobId: string) => {
    const t = toast.loading("Approving…");
    try {
      await approveJob(jobId);
      toast.success("Approved");
      setRows(prev => prev.filter(r => r._id !== jobId));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Approve failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const rejectOne = async (jobId: string) => {
    const reason = window.prompt("Reason (optional):") || undefined;
    const t = toast.loading("Rejecting…");
    try {
      await rejectJob(jobId, reason);
      toast.success("Rejected");
      setRows(prev => prev.filter(r => r._id !== jobId));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const allChecked = rows.length > 0 && rows.every(r => selected[r._id]);
  const toggleAll = () => {
    if (allChecked) setSelected({});
    else {
      const map: Record<string, boolean> = {};
      rows.forEach(r => (map[r._id] = true));
      setSelected(map);
    }
  };

  const bulkApprove = async () => {
    const ids = rows.filter(r => selected[r._id]).map(r => r._id);
    if (ids.length === 0) return toast("Select at least one row");
    const t = toast.loading(`Approving ${ids.length}…`);
    try {
      await Promise.all(ids.map(id => approveOne(id)));
      setSelected({});
    } finally { toast.dismiss(t); }
  };

  const bulkReject = async () => {
    const ids = rows.filter(r => selected[r._id]).map(r => r._id);
    if (ids.length === 0) return toast("Select at least one row");
    const reason = window.prompt("Reason (optional):") || undefined;
    const t = toast.loading(`Rejecting ${ids.length}…`);
    try {
      await Promise.all(ids.map(async id => {
        await rejectJob(id, reason);
        setRows(prev => prev.filter(r => r._id !== id));
      }));
      setSelected({});
      toast.success("Rejected selected");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Bulk reject failed");
    } finally { toast.dismiss(t); }
  };

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header with segmented toggle */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <SegmentedControl
            value={tab}
            onChange={(key) => setParam("tab", key)}
            items={[
              { key: "orders",  label: "Orders" },
              { key: "drivers", label: "Drivers" }, // shows assignment view
            ]}
          />
        </div>

        {/* Right header actions (only relevant on Orders tab) */}
        {tab === "orders" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
              title="Refresh"
            >
              <MdRefresh className="text-gray-600" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={bulkReject} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100">Reject Selected</button>
            <button onClick={bulkApprove} className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700">Approve Selected</button>
          </div>
        )}
      </div>

      {/* When Drivers tab: show assignment page and exit early */}
      {tab === "drivers" ? (
        <div className="-mt-2">
          <JobAssignmentPage />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <label className="text-sm text-gray-600">Approval:</label>
            {["pending","approved","rejected"].map(a => (
              <button
                key={a}
                onClick={() => setParam("approvalStatus", a)}
                className={`px-3 py-1.5 rounded-full border text-sm ${approvalStatus===a ? "bg-[#24123A0D] border-[#24123A33] text-gray-900" : "hover:bg-gray-50 text-gray-700"}`}
              >
                {a[0].toUpperCase()+a.slice(1)}
              </button>
            ))}
            <div className="mx-3 w-px h-6 bg-gray-200" />
            <label className="text-sm text-gray-600">Status:</label>
            {["available","accepted","in-progress","completed","cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setParam("status", s)}
                className={`px-3 py-1.5 rounded-full border text-sm ${status===s ? "bg-[#24123A0D] border-[#24123A33] text-gray-900" : "hover:bg-gray-50 text-gray-700"}`}
              >
                {s.replace("-", " ")}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => setParam("limit", Number(e.target.value))}
                className="border rounded-lg px-2 py-1.5 text-sm"
              >
                {[10,20,50].map(n => <option key={n} value={n}>{n} / page</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-2xl border">
            <table className="min-w-[860px] w-full">
              <thead>
                <tr className="bg-[#f0fdf4] text-[#22c55e] text-xs uppercase">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                  </th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Placed By</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && rows.length === 0 && (
                  <EmptyStateRow
                    colSpan={7}
                    title="No orders found"
                    hint="Try changing filters or refreshing."
                  />
                )}

                {!loading && rows.map((job: Job) => {
                  const pb = placedBy(job);
                  const companyIcon = faviconFromEmail(pb.email);
                  const categoryColor = pb.type === "Business" ? "green" : "yellow";
                  return (
                    <tr key={job._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={!!selected[job._id]}
                          onChange={(e) => setSelected(s => ({ ...s, [job._id]: e.target.checked }))}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="accent-emerald-500" checked readOnly />
                          <span className="font-semibold text-gray-900">{shortId(job._id)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {avatarFromName(pb.name)}
                          <div>
                            <div className="font-medium text-gray-900">{pb.name}</div>
                            <div className="text-gray-500 text-sm">{pb.email || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-800">{dateTime(job)}</td>
                      <td className="px-4 py-4">
                        <Tag color={categoryColor as any}>{pb.type}</Tag>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {companyIcon}
                          <span className="text-gray-800 text-sm">{pb.email ? pb.email.split("@")[1] : "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => rejectOne(job._id)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                            title="Reject"
                          >
                            <MdClose size={18} />
                          </button>
                          <button
                            onClick={() => approveOne(job._id)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Approve"
                          >
                            <MdCheck size={18} />
                          </button>
                          <Link
                            to={`/orders/${job._id}`}
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
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setParam("page", Math.max(1, page - 1))}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border ${page<=1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
              >
                <MdChevronLeft /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setParam("page", Math.min(totalPages, page + 1))}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border ${page>=totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
              >
                Next <MdChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
