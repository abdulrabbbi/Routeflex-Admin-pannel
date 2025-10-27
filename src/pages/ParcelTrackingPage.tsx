"use client";

import { useState } from "react";
import CompletedDeliveries from "../components/deliveries/CompletedDeliveries";
import CancelledDeliveries from "../components/deliveries/CancelledDeliveries";
import SegmentedControl from "../components/ui/shared/SegmentedControl";

const ParcelTrackingPage = () => {
  const [view, setView] = useState("completed");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <SegmentedControl
          items={[
            { label: "Completed", key: "completed" },
            { label: "Cancelled", key: "cancelled" },
          ]}
          value={view}
          onChange={setView}
        />

        {view === "completed" && <CompletedDeliveries />}
        {view === "cancelled" && <CancelledDeliveries />}
      </div>
    </div>
  );
};

export default ParcelTrackingPage;
