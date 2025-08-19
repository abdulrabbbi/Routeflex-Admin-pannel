"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  fetchPaymentReport,
  PaymentReport,
  fetchPaymentStats,
  PaymentStats,
  PaymentFilter,
} from "../api/paymentService";
import StatsCards from "../components/StatCards";
import DriversPaymentTable from "../components/DriverPayment";

const PaymentsPage: React.FC = () => {
  // unified filter for stats + table
  const [filter, setFilter] = useState<PaymentFilter>("monthly");

  const [paymentData, setPaymentData] = useState<PaymentReport[]>([]);
  const [statsData, setStatsData] = useState<PaymentStats | null>(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // simple server-side paging (disable Next when fewer than limit)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<10 | 20 | 50>(10);
  const [canNext, setCanNext] = useState(false);

  // load stats for selected filter
  const loadStats = useCallback(async (flt: PaymentFilter) => {
    setLoadingStats(true);
    try {
      const s = await fetchPaymentStats(flt);
      setStatsData(s);
    } catch {
      toast.error("Failed to load dashboard stats.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // load payment rows for selected filter
  const loadPayments = useCallback(
    async (p: number, l: number, flt: PaymentFilter) => {
      setLoadingTable(true);
      try {
        const rows = await fetchPaymentReport(p, l, flt);
        setPaymentData(rows || []);
        setCanNext((rows?.length ?? 0) >= l);
      } catch {
        toast.error("Failed to load payment list.");
        setPaymentData([]);
        setCanNext(false);
      } finally {
        setLoadingTable(false);
      }
    },
    []
  );

  // on first mount, load both with default filter
  useEffect(() => {
    loadStats(filter);
    loadPayments(page, limit, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // whenever filter changes, reset to page 1 and reload both
  useEffect(() => {
    setPage(1);
    loadStats(filter);
    loadPayments(1, limit, filter);
  }, [filter, limit, loadPayments, loadStats]);

  // whenever page/limit changes (not filter), reload table only
  useEffect(() => {
    loadPayments(page, limit, filter);
  }, [page, limit, filter, loadPayments]);

  // Optimistic “Mark as Paid”
  const handleMarkPaid = async (row: PaymentReport) => {
    try {
      // TODO: call your backend endpoint to mark as paid here.
      setPaymentData((prev) =>
        prev.map((r) =>
          r === row
            ? {
                ...r,
                paymentReceived: "Received",
                deliveryStatus: r.deliveryStatus ?? "Completed",
              }
            : r
        )
      );
      toast.success("Marked as paid.");
    } catch {
      toast.error("Could not mark as paid.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filter toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl font-semibold text-[#1e1e38]">Payments</h1>
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {(["daily", "weekly", "monthly", "yearly"] as PaymentFilter[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition ${
                  filter === opt
                    ? "bg-[#22c55e] text-white shadow"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatsCards stats={statsData} loading={loadingStats} />
        </div>

        {/* Table */}
        <DriversPaymentTable
          data={paymentData}
          loading={loadingTable}
          page={page}
          limit={limit}
          canNext={canNext}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => (canNext ? p + 1 : p))}
          onLimitChange={(l) => {
            setLimit(l as 10 | 20 | 50);
            setPage(1);
          }}
          onRefresh={() => loadPayments(page, limit, filter)}
          onMarkPaid={handleMarkPaid}
        />
      </div>
    </div>
  );
};

export default PaymentsPage;
