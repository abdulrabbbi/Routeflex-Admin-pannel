"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";

import ConfirmModal from "../components/ConfirmModal";
import { getDeliveries, deleteDelivery } from "../api/deliveryService";

interface Delivery {
  deliveryId: string;
  driverId: string;
  driverFullName: string;
  deliveryStatus: string;
  packageCategory: string;
}

const DeliveriesTable: React.FC = React.memo(() => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeliveries = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      const res = await getDeliveries(10, pageNum);
      setDeliveries(res.data.deliveries);
      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      toast.error("Failed to fetch deliveries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteDelivery(deleteId);
      toast.success("Delivery deleted successfully");
      // Refresh current page unless it's the last item on the page
      if (deliveries.length === 1 && page > 1) {
        fetchDeliveries(page - 1); // Go to previous page if last item was deleted
      } else {
        fetchDeliveries(page);
      }
    } catch (error) {
      toast.error("Failed to delete delivery");
    } finally {
      setModalOpen(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Parcels List</h2>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Delivery"
        message="Are you sure you want to delete this delivery? This action cannot be undone."
      />

      <div className="bg-white rounded-lg border overflow-x-auto">
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
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Package
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center">
                  No deliveries found
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr
                  key={delivery.deliveryId}
                  className="hover:bg-gray-50 relative"
                >
                  <td className="px-4 py-4 text-sm text-center">
                    {delivery.deliveryId}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    {delivery.driverId}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    {delivery.driverFullName}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        delivery.deliveryStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : delivery.deliveryStatus === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {delivery.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    {delivery.packageCategory}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <button
                      onClick={() => handleDeleteClick(delivery.deliveryId)}
                      className="p-2 rounded hover:bg-gray-100 text-red-500"
                      aria-label="Delete delivery"
                    >
                      <FiTrash2 className="mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1 || isLoading}
          onClick={() => fetchDeliveries(page - 1)}
          className={`px-4 py-2 rounded ${
            page === 1 || isLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#22c55e] text-white hover:bg-green-600"
          }`}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages || isLoading || totalPages === 0}
          onClick={() => fetchDeliveries(page + 1)}
          className={`px-4 py-2 rounded ${
            page >= totalPages || isLoading || totalPages === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#22c55e] text-white hover:bg-green-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default DeliveriesTable;