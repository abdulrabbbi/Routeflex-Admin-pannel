"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../ui/shared/ConfirmModal";
import { EmptyStateRow } from "../../ui/shared/EmptyStateRow";
import { TableSkeleton } from "../../ui/shared/Skeleton";
import { DeliveriesRow } from "./components/DeliveriesRow";
import { DeliveriesHeader } from "./components/DeliveriesHeader";
import TablePager from "../../ui/shared/TablePager";
import { exportDeliveriesCsv } from "../../../utils/deliveries/exportCsv";
import { useDeliveries } from "../../../hooks/useDeliveries";
import RefreshButton from "../../ui/shared/RefreshButton"; 

interface DeliveriesTables {
  statusFilter: "completed" | "in-progress" ; 
}

const MIN_ROWS = 10;

const DeliveriesTable: React.FC<DeliveriesTables> = React.memo(
  ({ statusFilter }) => {
    const {
      deliveries,
      filter,
      setFilter,
      page,
      limit,
      setLimit,
      totalPages,
      isLoading,
      err,
      onPrev,
      onNext,
      removeDelivery,
      fetchDeliveries,
    } = useDeliveries(statusFilter);

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const onExport = () => {
      try {
        exportDeliveriesCsv({ deliveries, filter, page });
      } catch (e) {
        console.error("Export failed", e);
        toast.error("Export failed");
      }
    };

    const body = useMemo(() => {
      if (isLoading) {
        return (
          <TableSkeleton
            columns={8}
            rows={Math.max(5, Math.min(limit, 10))}
            cellHeight={16}
            cellClassName="px-4 py-4"
          />
        );
      }
      if (err) {
        return (
          <tr>
            <td colSpan={8} className="px-4 py-6 text-center text-red-600">
              {err}
            </td>
          </tr>
        );
      }
      if (!deliveries.length) {
        return (
          <EmptyStateRow
            colSpan={8}
            title="No deliveries found"
            hint="Try changing filters or refreshing."
          />
        );
      }

      const pad = Math.max(MIN_ROWS - deliveries.length, 0);

      return (
        <>
          {deliveries.map((d) => (
            <DeliveriesRow
              key={d.parcelId}
              d={d}
              onDelete={(id) => {
                setDeleteId(id);
                setModalOpen(true);
              }}
              disabled={isLoading}
            />
          ))}
          {pad > 0 &&
            Array.from({ length: pad }).map((_, idx) => (
              <tr key={`pad-${idx}`}>
                {Array.from({ length: 7 }).map((__, c) => (
                  <td key={c} className="px-3 py-4">
                    <div className="h-4 w-24 bg-gray-50 rounded" />
                  </td>
                ))}
              </tr>
            ))}
        </>
      );
    }, [deliveries, isLoading, err, limit]);

    const headerTitle =
      statusFilter === "completed" ? "Completed Orders" : "In-progress Orders";

    return (
      <div className="p-6" aria-busy={isLoading}>
        <ConfirmModal
          isOpen={modalOpen}
          onClose={() => {
            if (isDeleting) return;
            setModalOpen(false);
          }}
          onConfirm={async () => {
            if (!deleteId || isDeleting) return;
            setIsDeleting(true);
            const toastId = toast.loading("Deleting delivery...");
            try {
              await removeDelivery(deleteId);
              setModalOpen(false);
              setDeleteId(null);
            } finally {
              toast.dismiss(toastId);
              setIsDeleting(false);
            }
          }}
          title="Delete Delivery"
          message="Are you sure you want to delete this delivery? This action cannot be undone."
          confirmText="Delete"
          loading={isDeleting}
        />

        {/* 👇 just pass dynamic title down */}
        <DeliveriesHeader
          title={headerTitle}          // <-- you'll update this component below
          filter={filter}
          setFilter={setFilter}
          limit={limit}
          setLimit={setLimit}
          onExport={onExport}
          disabled={isLoading}
        />

        <div className="flex justify-between mb-4">
          <TablePager
            page={page}
            totalPages={totalPages}
            onPrev={onPrev}
            onNext={onNext}
            disabled={isLoading}
          />
          <RefreshButton
            onClick={() => fetchDeliveries(page, filter, limit)}
            disabled={isLoading}
            loading={isLoading}
            variant="success"
          />
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-[#f0fdf4]">
                  <th className="px-2 py-3 text-xs text-[#22c55e] uppercase text-center">
                    Parcel ID
                  </th>
                  <th className="px-2 py-3 text-xs text-[#22c55e] uppercase text-center">
                    Driver ID
                  </th>
                  <th className="px-2 py-3 text-xs text-[#22c55e] uppercase text-center">
                    Driver Name
                  </th>
                  <th className="px-2 py-3 text-xs text-[#22c55e] uppercase text-center">
                    Status
                  </th>
                  <th className="px-2 py-3 text-xs text-[#22c55e] uppercase text-center">
                    Distance
                  </th>
                  <th className="px-2 py-3 text-xs text-[#22c55e] uppercase text-center">
                    Package
                  </th>
                  <th className="px-2 py-3 text-xs text-[#22c55e] uppercase text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">{body}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

export default DeliveriesTable;
