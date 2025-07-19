import { useEffect, useState } from "react";
import { MdLocalShipping, MdDirections } from "react-icons/md";
import { getParcelReports } from "../api/deliveryService";
interface DeliveredTodayType {
  sequence: string;
  driver: string;
  pickupAt: string;
  deliveredAt: string;
  timeLeft: string;
  hours: string;
  status: string;
}

interface DeliveryInProcessType {
  sequence: string;
  driver: string;
  pickupAt: string;
  dropoffLocation: string;
  timeLeft: string;
}

const DashboardContent = () => {
  const [deliveredToday, setDeliveredToday] = useState<DeliveredTodayType[]>(
    []
  );
  const [deliveriesInProcess, setDeliveriesInProcess] = useState<
    DeliveryInProcessType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getParcelReports()
      .then((res) => {
        const delivered = res?.data?.deliveredToday || [];
        const inProgress = res?.data?.inProgress || [];

        setDeliveredToday(delivered);
        setDeliveriesInProcess(inProgress);

        sessionStorage.setItem(
          "parcelReports",
          JSON.stringify({ deliveredToday: delivered, inProgress })
        );
      })
      .catch(() => {
        setError("Failed to load parcel data.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-[0px_0px_20px_0px_#0000000D]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-400">
                Parcels Delivered
              </p>
              <p className="text-2xl font-extrabold text-gray-900">
                153364{" "}
                <span className="text-green-500 font-semibold">
                  /{deliveredToday.length} Today
                </span>
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <MdLocalShipping className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-[0px_0px_20px_0px_#0000000D]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-400">
                Parcels on Move
              </p>
              <p className="text-2xl font-extrabold text-gray-900">
                {deliveriesInProcess.length}{" "}
                <span className="text-gray-500 font-semibold">
                  {/* <span className="text-green-500">/ 350</span> */}
                </span>
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <MdDirections className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Delivered Today */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Delivered Today</h2>
        {deliveredToday.length === 0 ? (
          <p className="text-gray-500">No deliveries completed today.</p>
        ) : (
          <div className="bg-white rounded-lg border overflow-x-auto ">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-[#f0fdf4]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    OR#
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Pickup at
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Delivered at
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Time left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveredToday.map((delivery, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.sequence}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.pickupAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.deliveredAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.timeLeft}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.hours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                      {delivery.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deliveries in Process */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Deliveries in Process</h2>
        {deliveriesInProcess.length === 0 ? (
          <p className="text-gray-500">No deliveries currently in progress.</p>
        ) : (
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-[#f0fdf4]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    No#
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Pickup at
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Dropoff Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">
                    Time Left
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveriesInProcess.map((delivery, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.sequence}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.pickupAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="space-y-1">
                        {delivery.dropoffLocation
                          .split("|")
                          .map((location, idx) => (
                            <div key={idx} className="text-gray-700">
                              • {location.trim()}
                            </div>
                          ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {delivery.timeLeft}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
