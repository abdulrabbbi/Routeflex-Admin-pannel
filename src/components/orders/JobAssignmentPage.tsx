import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../api/api";
import JobsTableLite from "../../components/orders/JobsTableLite";
import AssignDriverDialog from "../../components/orders/AssignDriverDialog";
import type { Job } from "../../types/job";
import TablePager from "../../components/ui/shared/TablePager";

type JobsResponse = {
  status: string;
  page?: number;
  totalPages?: number;
  totalJobs?: number;
  data?: { jobs: Job[] };
};

export default function OrdersJobsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page") || 1));
  const limit = Math.max(1, Number(params.get("limit") || 10));

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const navigate = useNavigate();

  const query = useMemo(() => ({ page, limit, status: "available", approvalStatus: "approved" }), [page, limit]);

  const load = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res = await apiClient.get<JobsResponse>("/jobs/admin/jobs/available", { params: query });
      const list = res.data?.data?.jobs || [];
      setRows(list);
      setTotalPages(Math.max(1, res.data?.totalPages || 1));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load jobs");
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, limit); /* eslint-disable-next-line */ }, [page, limit]);

  const setParam = (k: string, v: string | number) => {
    const next = new URLSearchParams(params);
    next.set(k, String(v));
    if (k !== "page") next.set("page", "1");
    setParams(next, { replace: true });
  };

  const handleAssign = (jobId: string) => {
    const job = rows.find(r => r._id === jobId) || null;
    setSelectedJob(job);
    setAssignOpen(true);
  };

  const handleView = (jobId: string) => {
    // Navigate to details page (there you can render polyline, full route, etc.)
    navigate(`/orders/${jobId}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#22c55e]">Available Orders</h1>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => setParam("limit", Number(e.target.value))}
            className="border rounded-lg px-2 py-1.5 text-sm"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      <JobsTableLite rows={rows} loading={loading} onAssign={handleAssign} onView={handleView} />

      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page <b>{page}</b> of <b>{totalPages}</b></div>
        <TablePager
          page={page}
          totalPages={totalPages}
          onPrev={() => setParam("page", Math.max(1, page - 1))}
          onNext={() => setParam("page", Math.min(totalPages, page + 1))}
          disabled={loading}
        />
      </div>

      <AssignDriverDialog
        job={selectedJob}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssigned={() => load(page, limit)}
      />
    </div>
  );
}
