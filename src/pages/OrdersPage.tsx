import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { approveJob, listAdminJobs, rejectJob } from "../api/jobs";
import { toast } from "react-hot-toast";
import { MdRefresh } from "react-icons/md";
import SegmentedControl from "../components/ui/shared/SegmentedControl";
import JobAssignmentPage from "../components/orders/JobAssignmentPage";
import OrdersTable from "../components/orders/OrdersTable";

type Job = any;

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();

  const tab = (params.get("tab") || "orders") as "orders" | "drivers";

  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 10);
  const approvalStatus = params.get("approvalStatus") || "pending";
  const status = params.get("status") || "available";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const query = useMemo(
    () => ({ page, limit, status, approvalStatus }),
    [page, limit, status, approvalStatus]
  );

  // fetch only when in "orders" tab
  useEffect(() => {
    if (tab !== "orders") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listAdminJobs(query);
        if (cancelled) return;
        setRows(data?.data?.jobs || []);
        setTotalPages(data?.totalPages || 1);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.response?.data?.message || "Failed to load orders");
          toast.error(e?.response?.data?.message || "Failed to load orders");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, limit, approvalStatus, status, refreshKey]);

  const setParam = (k: string, v: string | number) => {
    const next = new URLSearchParams(params);
    next.set(k, String(v));
    if (k !== "page") next.set("page", "1"); 
    setParams(next, { replace: true });
  };

  const isEligible = (job: Job) =>
    job?.approvalStatus === "pending" && job?.status === "available";

  const approveOne = async (jobId: string): Promise<void> => {
    const job = rows.find((r) => r._id === jobId);
    if (!job || !isEligible(job)) {
      toast.error("This job is not eligible to approve.");
      return; 
    }
    const t = toast.loading("Approving…");
    try {
      await approveJob(jobId);
      toast.success("Approved");
      setRows((prev) => prev.filter((r) => r._id !== jobId));
      setSelected((s) => {
        const copy = { ...s };
        delete copy[jobId];
        return copy;
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Approve failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const rejectOne = async (jobId: string): Promise<void> => {
    const job = rows.find((r) => r._id === jobId);
    if (!job || !isEligible(job)) {
      toast.error("This job is not eligible to reject.");
      return; 
    }
    const reason = window.prompt("Reason (optional):") || undefined;
    const t = toast.loading("Rejecting…");
    try {
      await rejectJob(jobId, reason);
      toast.success("Rejected");
      setRows((prev) => prev.filter((r) => r._id !== jobId));
      setSelected((s) => {
        const copy = { ...s };
        delete copy[jobId];
        return copy;
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const eligibleRows = rows.filter(isEligible);
  const allChecked =
    eligibleRows.length > 0 && eligibleRows.every((r) => selected[r._id]);

  const onToggleAll = () => {
    if (eligibleRows.length === 0) return;
    if (allChecked) setSelected({});
    else {
      const map: Record<string, boolean> = {};
      eligibleRows.forEach((r) => (map[r._id] = true));
      setSelected(map);
    }
  };

  const onToggleRow = (id: string, checked: boolean) => {
    const job = rows.find((r) => r._id === id);
    if (!job || !isEligible(job)) return;
    setSelected((s) => ({ ...s, [id]: checked }));
  };

  const bulkApprove = async () => {
    const ids = eligibleRows.filter((r) => selected[r._id]).map((r) => r._id);
    if (ids.length === 0) return toast.error("Select at least one eligible row");
    const t = toast.loading(`Approving ${ids.length}…`);
    try {
      await Promise.all(ids.map((id) => approveOne(id)));
      setSelected({});
    } finally {
      toast.dismiss(t);
    }
  };

  const bulkReject = async () => {
    const ids = eligibleRows.filter((r) => selected[r._id]).map((r) => r._id);
    if (ids.length === 0) return toast.error("Select at least one eligible row");
    const reason = window.prompt("Reason (optional):") || undefined;
    const t = toast.loading(`Rejecting ${ids.length}…`);
    try {
      await Promise.all(
        ids.map(async (id) => {
          await rejectJob(id, reason);
          setRows((prev) => prev.filter((r) => r._id !== id));
        })
      );
      setSelected({});
      toast.success("Rejected selected");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Bulk reject failed");
    } finally {
      toast.dismiss(t);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header with segmented toggle */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <SegmentedControl
            value={tab}
            onChange={(key) => setParam("tab", key)}
            items={[
              { key: "orders", label: "Orders" },
              { key: "drivers", label: "Assign to Drivers" },
            ]}
          />
        </div>

        {/* Right header actions (only on Orders + pending + available) */}
        {tab === "orders" &&
          approvalStatus === "pending" &&
          status === "available" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
                title="Refresh"
              >
                <MdRefresh className="text-gray-600" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={bulkReject}
                disabled={eligibleRows.length === 0}
                className={`px-3 py-2 rounded-xl font-medium ${
                  eligibleRows.length === 0
                    ? "bg-red-50 text-red-300 cursor-not-allowed"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                Reject Selected
              </button>
              <button
                onClick={bulkApprove}
                disabled={eligibleRows.length === 0}
                className={`px-3 py-2 rounded-xl text-white font-medium ${
                  eligibleRows.length === 0
                    ? "bg-emerald-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Approve Selected
              </button>
            </div>
          )}
      </div>

      {/* Drivers tab */}
      {tab === "drivers" ? (
        <div className="-mt-2">
          <JobAssignmentPage />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <label className="text-sm text-gray-600">Approval:</label>
            {["pending", "approved", "rejected"].map((a) => (
              <button
                key={a}
                onClick={() => setParam("approvalStatus", a)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  approvalStatus === a
                    ? "bg-[#24123A0D] border-[#24123A33] text-gray-900"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {a[0].toUpperCase() + a.slice(1)}
              </button>
            ))}
            <div className="mx-3 w-px h-6 bg-gray-200" />
            <label className="text-sm text-gray-600">Status:</label>
            {[
              "available",
              "accepted",
              "in-progress",
              "completed",
              "cancelled",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setParam("status", s)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  status === s
                    ? "bg-[#24123A0D] border-[#24123A33] text-gray-900"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {s.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Optimized table */}
          <OrdersTable
            rows={rows}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            limit={limit}
            onLimitChange={(n) => setParam("limit", n)}
            onPrev={() => setParam("page", Math.max(1, page - 1))}
            onNext={() => setParam("page", Math.min(totalPages, page + 1))}
            selected={selected}
            allChecked={allChecked}
            onToggleAll={onToggleAll}
            onToggleRow={onToggleRow}
            isEligible={isEligible}
            onApprove={approveOne}
            onReject={rejectOne}
            getViewUrl={(id) => `/orders/${id}`}       
          />
        </>
      )}
    </div>
  );
}
