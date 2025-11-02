import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getDriverProfileOverview,
  DriverProfileOverviewData,
} from "../../../api/adminService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PerformanceTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<DriverProfileOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverPerformance = async () => {
      try {
        if (!id) return;
        setLoading(true);

        const res = await getDriverProfileOverview(id);
        setDriver(res);
      } catch (error) {
        console.error("Error fetching driver performance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverPerformance();
  }, [id]);

  if (loading) return <div>Loading performance data...</div>;
  if (!driver) return <div>No performance data available.</div>;

  const cards = [
    { label: "Assigned", value: driver.headerCards.assigned },
    { label: "In Progress", value: driver.headerCards.inProgress },
    { label: "Completed", value: driver.headerCards.completed },
    { label: "Revenue", value: `$${driver.headerCards.revenue}` },
    { label: "Avg Rating", value: driver.headerCards.avgRating },
    { label: "Acceptance Rate", value: `${driver.headerCards.acceptanceRate}%` },
    { label: "Cancellation Rate", value: `${driver.headerCards.cancellationRate}%` },
  ];

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-semibold mb-4">Driver Performance Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className="text-xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Deliveries Over Time</h3>
        {driver.overview?.series?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={driver.overview.series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm">No delivery data available.</p>
        )}
      </div>

      {/* On-time Rate */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">On-Time Delivery Rate</h3>
        <p className="text-2xl font-bold text-blue-600">
          {driver.overview.onTimeRate}%
        </p>
      </div>
    </div>
  );
};

export default PerformanceTab;
