import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import { TableSkeleton } from "../../../components/ui/shared/Skeleton";
import { EmptyStateRow } from "../../../components/ui/shared/EmptyStateRow";
import DriverDrawer from "./DriverDrawer";
import { getDriverProfileOverview } from "../../../api/adminService";
const MIN_ROWS = 10;

const DriverHistoryTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);

  useEffect(() => {
    const fetchDriverHistory = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await getDriverProfileOverview(id);
        setDriver(res);
      } catch (error) {
        console.error("Error fetching driver history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverHistory();
  }, [id]);

  const displayRows = useMemo(() => {
    if (loading || !driver?.recent) return [];
    const pad = Math.max(MIN_ROWS - driver.recent.length, 0);
    return [...driver.recent, ...Array.from({ length: pad }).map(() => ({}))];
  }, [driver, loading]);

  return (
    <div className="w-full bg-white rounded-2xl border shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#f0fdf4] text-[#22c55e] text-xs uppercase">
            <th className="px-3 py-3 text-left w-[15%]">Delivery ID</th>
            <th className="px-3 py-3 text-left w-[20%]">Package</th>
            <th className="px-3 py-3 text-left w-[15%]">Payment</th>
            <th className="px-3 py-3 text-left w-[15%]">Status</th>
            <th className="px-3 py-3 text-left w-[25%]">Completed At</th>
            <th className="px-3 py-3 text-center w-[10%]">Action</th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={MIN_ROWS} columns={6} />
        ) : !driver?.recent || driver.recent.length === 0 ? (
          <tbody>
            <EmptyStateRow
              colSpan={6}
              title="No recent deliveries found"
              hint="Driver has no recent completed or active deliveries."
            />
          </tbody>
        ) : (
          <tbody className="divide-y divide-gray-100">
            {displayRows.map((delivery, idx) => {
              if (!delivery || !delivery._id) {
                return (
                  <tr key={`pad-${idx}`}>
                    {Array.from({ length: 6 }).map((_, c) => (
                      <td key={c} className="px-3 py-4">
                        <div className="h-4 w-24 bg-gray-50 rounded" />
                      </td>
                    ))}
                  </tr>
                );
              }

              const idShort = `#${(delivery._id || "").slice(-6).toUpperCase()}`;

              return (
                <tr key={delivery._id} className="hover:bg-gray-50 text-gray-700 transition">
                  <td
                    className="px-3 py-3 font-semibold text-gray-900 cursor-pointer"
                    onClick={() => setSelectedDelivery(delivery)}
                  >
                    {idShort}
                  </td>
                  <td className="px-3 py-3 break-words">{delivery.route?.packageCategory || "-"}</td>
                  <td
                    className={`px-3 py-3 font-medium ${delivery.paymentStatus === "pending" ? "text-yellow-600" : "text-green-600"
                      }`}
                  >
                    {delivery.paymentStatus}
                  </td>
                  <td
                    className={`px-3 py-3 font-medium ${delivery.status === "completed"
                        ? "text-green-600"
                        : delivery.status === "assigned"
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                  >
                    {delivery.status}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {delivery.completedAt ? new Date(delivery.completedAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-emerald-600"
                      title="View Details"
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </table>

      {selectedDelivery && (
        <DriverDrawer
          selectedDelivery={selectedDelivery}
          setSelectedDelivery={setSelectedDelivery}
        />
      )}
    </div>

  );
};

export default DriverHistoryTab;
