import React from "react";
import { IoClose } from "react-icons/io5";

interface DriverDrawerProps {
  selectedDelivery: {
    _id?: string;
    route?: {
      packageCategory?: string;
      vehicleType?: string;
      distance?: number;
    };
    status?: string;
    paymentStatus?: string;
    createdAt?: string | Date;
  } | null;
  setSelectedDelivery: React.Dispatch<React.SetStateAction<any | null>>;
}

const fmtDT = (v?: string | Date) =>
  v ? new Date(v).toLocaleString() : "—";

const DriverDrawer: React.FC<DriverDrawerProps> = ({
  selectedDelivery,
  setSelectedDelivery,
}) => {
  if (!selectedDelivery) return null;
  const r = selectedDelivery.route || {};

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setSelectedDelivery(null)}
      ></div>

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[720px] bg-white shadow-2xl rounded-l-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Delivery Details — {selectedDelivery._id?.slice(-6).toUpperCase()}
          </h2>
          <button
            onClick={() => setSelectedDelivery(null)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-gray-700">
          {/* --- General Info --- */}
          <div className="border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              General Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedDelivery.status}
              </p>
              <p>
                <span className="font-medium">Payment:</span>{" "}
                {selectedDelivery.paymentStatus}
              </p>
              <p>
                <span className="font-medium">Distance:</span>{" "}
                {r.distance?.toFixed(2) || "-"} km
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {fmtDT(selectedDelivery.createdAt)}
              </p>
            </div>
          </div>

          {/* --- Route Info --- */}
          <div className="border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Route Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <p>
                <span className="font-medium">Package:</span>{" "}
                {r.packageCategory || "-"}
              </p>
              <p>
                <span className="font-medium">Vehicle:</span>{" "}
                {r.vehicleType || "Unknown"}
              </p>
            </div>
          </div>

          {/* --- Driver Notes / Future Sections --- */}
          <div className="border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Additional Details
            </h3>
            <p className="text-gray-600 text-sm">
              More details (like pickup, dropoff, or performance metrics) can be
              displayed here if available in the data.
            </p>
          </div>

          {/* --- Close Button --- */}
          <div className="pt-3">
            <button
              onClick={() => setSelectedDelivery(null)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDrawer;
