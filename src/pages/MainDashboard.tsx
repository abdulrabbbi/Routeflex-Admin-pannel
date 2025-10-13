import React, { useEffect, useMemo, useState } from "react";
import { MdLocalShipping, MdDirections } from "react-icons/md";
import RouteStatsChart from "../components/RouteStatsChart";
import SystemStatsTop from "../components/dashboard/stats/SystemStatsTop";
import OrdersOverview from "../components/dashboard/oderOverview/OrdersOverview";
import DeliveredTable, {
  DeliveredRow,
  DeliveredMeta,
} from "../components/reports/DeliveredTable";
import InProgressTable, {
  InProgressRow,
  InProgressMeta,
} from "../components/reports/InProgressTable";
import { SkeletonStatCard } from "../components/ui/shared/Skeleton";
import Segmented from "../utils/Dashboard/Segmented";

import {
  getParcelReports,
  RangeType,
  GetParcelReportsParams,
} from "../api/deliveryService";
import { InProgressType, DeliveredType, ListMeta } from "../types/Dashboard";
import CustomerFeedback from "../components/dashboard/feedback/CustomerFeedback";
import TopDriversCard from "../components/dashboard/topDrivers/TopDriversCard";
import RevenueTrendCard from "../components/dashboard/Revenue/RevenueTrendCard";
import UserSegmentation from "../components/dashboard/user/UserSegmentation";

/* ---------- Main Component ---------- */
const DashboardContent: React.FC = () => {
  // range
  const [range, setRange] = useState<RangeType>("daily");

  // delivered data + meta
  const [delivered, setDelivered] = useState<DeliveredType[]>([]);
  const [deliveredMeta, setDeliveredMeta] = useState<ListMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    results: 0,
  });

  // in-progress data + meta
  const [inProgress, setInProgress] = useState<InProgressType[]>([]);
  const [inProgressMeta, setInProgressMeta] = useState<ListMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    results: 0,
  });

  // ui states
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // restore range
  useEffect(() => {
    const stored = sessionStorage.getItem(
      "parcelReportRange"
    ) as RangeType | null;
    if (stored) setRange(stored);
  }, []);

  // persist range
  useEffect(() => {
    sessionStorage.setItem("parcelReportRange", range);
  }, [range]);

  // make one request that respects both paginations
  const fetchReports = async (opts?: Partial<GetParcelReportsParams>) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getParcelReports({
        range,
        // current pagination state (defaults)
        deliveredPage: deliveredMeta.page,
        deliveredLimit: deliveredMeta.limit,
        inProgressPage: inProgressMeta.page,
        inProgressLimit: inProgressMeta.limit,
        // overrides
        ...opts,
      });

      const data = res?.data;
      if (!data) throw new Error("Invalid data structure");

      setDelivered(Array.isArray(data.delivered) ? data.delivered : []);
      setInProgress(Array.isArray(data.inProgress) ? data.inProgress : []);

      // Meta (fallbacks if server not yet upgraded)
      const dMeta: ListMeta = {
        page: data.deliveredMeta?.page ?? 1,
        limit: data.deliveredMeta?.limit ?? deliveredMeta.limit,
        total: data.deliveredMeta?.total ?? data.delivered?.length ?? 0,
        totalPages: data.deliveredMeta?.totalPages ?? 1,
        results: data.deliveredMeta?.results ?? data.delivered?.length ?? 0,
      };
      const iMeta: ListMeta = {
        page: data.inProgressMeta?.page ?? 1,
        limit: data.inProgressMeta?.limit ?? inProgressMeta.limit,
        total: data.inProgressMeta?.total ?? data.inProgress?.length ?? 0,
        totalPages: data.inProgressMeta?.totalPages ?? 1,
        results: data.inProgressMeta?.results ?? data.inProgress?.length ?? 0,
      };

      setDeliveredMeta(dMeta);
      setInProgressMeta(iMeta);
    } catch (e: any) {
      setErr(e?.message || "Failed to load parcel data.");
      setDelivered([]);
      setInProgress([]);
      setDeliveredMeta((m) => ({
        ...m,
        total: 0,
        totalPages: 1,
        results: 0,
        page: 1,
      }));
      setInProgressMeta((m) => ({
        ...m,
        total: 0,
        totalPages: 1,
        results: 0,
        page: 1,
      }));
    } finally {
      setLoading(false);
    }
  };

  // initial + on range change -> reset both paginations and refetch
  useEffect(() => {
    setDeliveredMeta((m) => ({ ...m, page: 1 }));
    setInProgressMeta((m) => ({ ...m, page: 1 }));
    fetchReports({ deliveredPage: 1, inProgressPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // displayed totals in stat cards (prefer meta.total if available)
  const deliveredTotalDisplay = useMemo(
    () => (deliveredMeta.total ? deliveredMeta.total : delivered.length),
    [deliveredMeta.total, delivered.length]
  );
  const inProgressTotalDisplay = useMemo(
    () => (inProgressMeta.total ? inProgressMeta.total : inProgress.length),
    [inProgressMeta.total, inProgress.length]
  );

  /* ---- Handlers: delivered ---- */
  const onDeliveredPrev = () => {
    if (deliveredMeta.page <= 1 || loading) return;
    const page = deliveredMeta.page - 1;
    setDeliveredMeta((m) => ({ ...m, page }));
    fetchReports({ deliveredPage: page });
  };
  const onDeliveredNext = () => {
    if (deliveredMeta.page >= deliveredMeta.totalPages || loading) return;
    const page = deliveredMeta.page + 1;
    setDeliveredMeta((m) => ({ ...m, page }));
    fetchReports({ deliveredPage: page });
  };
  const onDeliveredLimit = (limit: number) => {
    setDeliveredMeta((m) => ({ ...m, limit, page: 1 }));
    fetchReports({ deliveredLimit: limit, deliveredPage: 1 });
  };

  /* ---- Handlers: in-progress ---- */
  const onInProgressPrev = () => {
    if (inProgressMeta.page <= 1 || loading) return;
    const page = inProgressMeta.page - 1;
    setInProgressMeta((m) => ({ ...m, page }));
    fetchReports({ inProgressPage: page });
  };
  const onInProgressNext = () => {
    if (inProgressMeta.page >= inProgressMeta.totalPages || loading) return;
    const page = inProgressMeta.page + 1;
    setInProgressMeta((m) => ({ ...m, page }));
    fetchReports({ inProgressPage: page });
  };
  const onInProgressLimit = (limit: number) => {
    setInProgressMeta((m) => ({ ...m, limit, page: 1 }));
    fetchReports({ inProgressLimit: limit, inProgressPage: 1 });
  };

  return (
    <div className="p-6 space-y-6">
      {/* NEW: System snapshot cards */}
      <SystemStatsTop />

      {/* Keep as-is */}
      {/* <RouteStatsChart /> */}

      {/* Orders overview (NEW) */}
      <OrdersOverview className="mt-2" initialDays={7} />
       
      {/* Customer feedback (NEW) */}
      <CustomerFeedback />

      {/* Revenue Trend (NEW) */}
      <RevenueTrendCard className="mt-6" initialMonths={12} currency="$" />

      {/* User Segmentation (NEW) */}
      <UserSegmentation className="md:col-span-2" />

      {/* Top Drivers (NEW) */}
      <TopDriversCard className="mt-6" initialQuery={{ limit: 5, sort: "rating" }} />

      {/* Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <Segmented value={range} onChange={setRange} />
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {err}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Parcels Delivered
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {deliveredTotalDisplay}{" "}
                    <span className="text-green-600 font-semibold">
                      / {range}
                    </span>
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl shadow">
                  <MdLocalShipping className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Parcels on Move
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {inProgressTotalDisplay}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl shadow">
                  <MdDirections className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <DeliveredTable
        rows={delivered as DeliveredRow[]}
        meta={deliveredMeta as DeliveredMeta}
        loading={loading}
        onLimitChange={onDeliveredLimit}
        onPrev={onDeliveredPrev}
        onNext={onDeliveredNext}
      />

      <InProgressTable
        rows={inProgress as InProgressRow[]}
        meta={inProgressMeta as InProgressMeta}
        loading={loading}
        onLimitChange={onInProgressLimit}
        onPrev={onInProgressPrev}
        onNext={onInProgressNext}
      />
    </div>
  );
};

export default DashboardContent;
