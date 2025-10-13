"use client";
import DeliveriesTable from "../components/deliveries/DeliveriesTable";

const ParcelTrackingPage = () => {

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DeliveriesTable />
      </div>
    </div>
  );
};

export default ParcelTrackingPage;
