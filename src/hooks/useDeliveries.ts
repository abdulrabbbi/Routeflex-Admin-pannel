import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getDeliveries, deleteDelivery } from "../api/deliveryService";
import {
  DeliveryRowApi,
  DeliveriesApiResponse,
  RangeFilter,
} from "../types/deliveries";

export function useDeliveries(statusFilter: "completed") {
  const [deliveries, setDeliveries] = useState<DeliveryRowApi[]>([]);
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
          selectedFilter,
          statusFilter // This filters by "completed"
        );

        let items = res?.data?.deliveries ?? [];

        // Only keep "completed" deliveries as per the statusFilter
        if (statusFilter) {
          items = items.filter(
            (d) => d.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }

        setDeliveries(items);

        const total = typeof res?.total === "number" ? res.total : 0;
        const totalPages =
          typeof res?.totalPages === "number"
            ? res.totalPages
            : total > 0
            ? Math.max(1, Math.ceil(total / lm))
            : 1;

        setTotalPages(totalPages);
        setPage(res?.page ?? pageNum);
      } catch (e: any) {
        setDeliveries([]);
        setTotalPages(1);
        const message =
          e?.response?.data?.message || "Failed to fetch deliveries";
        setErr(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [filter, limit, statusFilter] // Only depends on statusFilter
  );

  useEffect(() => {
    fetchDeliveries(1, filter, limit);
  }, [fetchDeliveries, filter, limit]);

  const onPrev = () => page > 1 && fetchDeliveries(page - 1, filter, limit);
  const onNext = () => page < totalPages && fetchDeliveries(page + 1, filter, limit);

  const removeDelivery = async (id: string) => {
    try {
      await deleteDelivery(id);
      toast.success("Delivery deleted");

      // smart re-fetch
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