"use client";

import React, { useMemo, useState } from "react";
import ConfirmModal from "../ConfirmModal";
import { EmptyStateRow } from "../ui/shared/EmptyStateRow";
import { TableSkeleton } from "../ui/shared/Skeleton";
import { DeliveriesRow } from "./DeliveriesRow";
import { DeliveriesHeader } from "./DeliveriesHeader";
import { Pagination } from "./Pagination";
import { StatsSkeleton } from "./StatsSkeleton";
import { exportDeliveriesCsv } from "../../utils/deliveries/exportCsv";
import { useDeliveries } from "../../hooks/useDeliveries";

const DeliveriesTable: React.FC = React.memo(() => {
  const {
    deliveries,
    filter,
    setFilter,
    page,
    limit,
    setLimit,
    totalPages,
    isLoading,
    isInitialLoading,
    err,
    onPrev,
    onNext,
    removeDelivery,
  } = useDeliveries();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onExport = () => {
    try {
      exportDeliveriesCsv({ deliveries, filter, page });
    } catch {
      // toast imported in hook; keep UI layer clean. Add a toast here if desired.
      console.error("Export failed");
    }
  };

  const tableBody = useMemo(() => {
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

    return (
      <>
        {deliveries.map((d) => (
          <DeliveriesRow
            key={d.deliveryId}
            d={d}
            onDelete={(id) => {
              setDeleteId(id);
              setModalOpen(true);
            }}
            disabled={isLoading}
          />
        ))}
      </>
    );
  }, [isLoading, err, deliveries, limit]);

  return (
    <div className="p-6" aria-busy={isLoading}>
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={async () => {
          if (!deleteId) return;
          await removeDelivery(deleteId);
          setModalOpen(false);
          setDeleteId(null);
        }}
        title="Delete Delivery"
        message="Are you sure you want to delete this delivery? This action cannot be undone."
      />

      {isInitialLoading && <StatsSkeleton />}

      <DeliveriesHeader
        filter={filter}
        setFilter={setFilter}
        limit={limit}
        setLimit={setLimit}
        onExport={onExport}
        disabled={isLoading}
      />

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Parcel ID
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Driver ID
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Driver Name
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center hidden md:table-cell">
                  Payment
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center hidden md:table-cell">
                  Distance
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Package
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{tableBody}</tbody>
          </table>
        </div>

        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Pagination
              page={/* from hook */ page}
              totalPages={totalPages}
              onPrev={onPrev}
              onNext={onNext}
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500">
              Showing <strong>{deliveries.length}</strong> item(s) • Range:{" "}
              <strong className="capitalize">{filter}</strong> • Limit {limit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DeliveriesTable;
