import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MdRefresh } from "react-icons/md";
import { approveJob, listAdminJobs, rejectJob } from "../api/jobs";
import  { RangeType } from "../utils/Dashboard/Segmented";
import JobAssignmentPage from "../components/orders/JobAssignmentPage";
import OrdersTable from "../components/orders/OrdersTable";

type Job = Record<string, any>;

export interface OrdersPageProps {
  defaultStatus?: string;
  defaultApprovalStatus?: string;
  hideFilters?: boolean;
}

const OrdersPage: React.FC<OrdersPageProps> = ({
  defaultStatus = "available",
  defaultApprovalStatus = "approved",
  hideFilters = false,
}) => {
  const [params, setParams] = useSearchParams();

  const tab = (params.get("tab") || "orders") as "orders" | "drivers";
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 10);
  const approvalStatus = params.get("approvalStatus") || defaultApprovalStatus;
  const status = params.get("status") || defaultStatus;

  // ✅ Add range state
  const [range, setRange] = useState<RangeType>("daily");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // ✅ Include range in query (optional, only if backend supports it)
  const query = useMemo(
    () => ({ page, limit, status, approvalStatus, range }),
    [page, limit, status, approvalStatus, range]
  );

  // Fetch orders
  useEffect(() => {
    if (tab !== "orders") return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listAdminJobs(query); // ✅ uses range now
        if (cancelled) return;
        setRows(data?.data?.jobs || []);
        setTotalPages(data?.totalPages || 1);
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.response?.data?.message || "Failed to load orders";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, page, limit, approvalStatus, status, refreshKey]); 

  const setParam = (key: string, value: string | number) => {
    const next = new URLSearchParams(params);
    next.set(key, String(value));
    if (key !== "page") next.set("page", "1");
    setParams(next, { replace: true });
  };

  const isEligible = (job: Job) =>
    job?.approvalStatus === "pending" && job?.status === "available";

  const approveOne = async (jobId: string) => {
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

  const rejectOne = async (jobId: string) => {
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
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {!hideFilters && (
          <h1 className="text-2xl font-bold text-[#22c55e]">Orders</h1>
        )}


        {/* Right actions */}
        {tab === "orders" &&
          approvalStatus === "approved" &&
          status === "accepted" && (
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
                className={`px-3 py-2 rounded-xl font-medium ${eligibleRows.length === 0
                    ? "bg-red-50 text-red-300 cursor-not-allowed"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
              >
                Reject Selected
              </button>

              <button
                onClick={bulkApprove}
                disabled={eligibleRows.length === 0}
                className={`px-3 py-2 rounded-xl text-white font-medium ${eligibleRows.length === 0
                    ? "bg-emerald-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
              >
                Approve Selected
              </button>
            </div>
          )}
      </div>

      {/* Filters */}
      {!hideFilters && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <label className="text-sm text-gray-600">Approval:</label>
            {["approved", "rejected"].map((a) => (
              <button
                key={a}
                onClick={() => setParam("approvalStatus", a)}
                className={`px-3 py-1.5 rounded-full border text-sm ${approvalStatus === a
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
                className={`px-3 py-1.5 rounded-full border text-sm ${status === s
                    ? "bg-[#24123A0D] border-[#24123A33] text-gray-900"
                    : "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                {s.replace("-", " ")}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Table */}
      {tab === "drivers" ? (
        <JobAssignmentPage />
      ) : (
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
      )}
    </div>
  );
};

export default OrdersPage;
