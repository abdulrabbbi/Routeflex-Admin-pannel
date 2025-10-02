"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getDeliveries, deleteDelivery } from "../api/deliveryService";
import {
  Delivery,
  DeliveriesApiResponse,
  RangeFilter,
} from "../types/deliveries";

export function useDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<RangeFilter>("daily");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");

  const isInitialLoading =
    isLoading && page === 1 && deliveries.length === 0 && !err;

  const fetchDeliveries = useCallback(
    async (
      pageNum: number = 1,
      selectedFilter: RangeFilter = filter,
      lm: number = limit
    ) => {
      try {
        setIsLoading(true);
        setErr("");
        const res: DeliveriesApiResponse = await getDeliveries(
          lm,
          pageNum,
          selectedFilter
        );

        const items = res?.data?.deliveries ?? [];
        setDeliveries(items);

        const reportedTotalPages =
          res?.totalPages ??
          res?.data?.totalPages ??
          (typeof res?.total === "number"
            ? Math.max(1, Math.ceil(res.total / lm))
            : typeof res?.data?.total === "number"
            ? Math.max(1, Math.ceil((res.data.total as number) / lm))
            : 1);

        setTotalPages(reportedTotalPages);
        setPage(res?.page ?? pageNum);
      } catch {
        setDeliveries([]);
        setTotalPages(1);
        setErr("Failed to fetch deliveries");
        toast.error("Failed to fetch deliveries");
      } finally {
        setIsLoading(false);
      }
    },
    [filter, limit]
  );

  useEffect(() => {
    fetchDeliveries(1, filter, limit);
  }, [fetchDeliveries, filter, limit]);

  const onPrev = () => page > 1 && fetchDeliveries(page - 1, filter, limit);
  const onNext = () =>
    page < totalPages && fetchDeliveries(page + 1, filter, limit);

  const removeDelivery = async (id: string) => {
    try {
      await deleteDelivery(id);
      toast.success("Delivery deleted successfully");

      if (deliveries.length === 1 && page > 1) {
        fetchDeliveries(page - 1, filter, limit);
      } else {
        fetchDeliveries(page, filter, limit);
      }
    } catch {
      toast.error("Failed to delete delivery");
    }
  };

  return {
    deliveries,
    filter,
    setFilter,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    isLoading,
    isInitialLoading,
    err,
    fetchDeliveries,
    onPrev,
    onNext,
    removeDelivery,
  };
}
