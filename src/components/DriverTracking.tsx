import { useState } from "react";
import { MdLocationOn, MdLocalShipping, MdAssignment } from "react-icons/md";
import { BsBox } from "react-icons/bs";
import { toast } from "react-hot-toast";

interface DriverData {
  currentLocation: string;
  currentTask: string;
  totalOrders: number;
  doneDeliveries: number;
  stopsLeft: number;
  currentTaskDetails: {
    pickup: {
      location: string;
      time: string;
    };
    delivery: {
      location: string;
      time: string;
    };
  };
}

interface DriverTrackingProps {
  driverId: string;
  setDriverId: (id: string) => void;
  driverData: DriverData | null;
  onTrackDriver: () => Promise<void>;
}

const DriverTracking: React.FC<DriverTrackingProps> = ({
  driverId,
  setDriverId,
  driverData,
  onTrackDriver,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onTrackDriver();
      toast.success("Driver tracking updated!");
    } catch (err) {
      console.error(err);
      setError("Failed to track driver. Please check the Driver ID.");
      toast.error("Failed to track driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#1e1e38]">
          Driver Tracking
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Driver id...."
            value={driverId}
            onChange={(e) => setDriverId(e.target.value.trim())}
            className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-[30%] py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting && <span className="loader mr-2"></span>}
            {isSubmitting ? "Tracking..." : "Track Driver"}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>

      {driverData && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#23CD6D08] p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#22c55e] bg-opacity-10 rounded-lg">
                  <MdLocationOn className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <div className="text-sm text-[#22c55e] font-medium">
                    Current Location
                  </div>
                  <div className="text-[#1e1e38]">
                    {driverData.currentLocation}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#23CD6D08] p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#22c55e] bg-opacity-10 rounded-lg">
                  <MdAssignment className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <div className="text-sm text-[#22c55e] font-medium">
                    Current Task
                  </div>
                  <div className="text-[#1e1e38]">{driverData.currentTask}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#23CD6D]  rounded-lg">
                  <BsBox className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[#1e1e38]">
                    {driverData.totalOrders}
                  </div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#23CD6D] rounded-lg">
                  <MdLocalShipping className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[#1e1e38]">
                    {driverData.doneDeliveries}
                  </div>
                  <div className="text-sm text-gray-500">Done Deliveries</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#23CD6D] rounded-lg">
                  <MdLocationOn className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[#1e1e38]">
                    {driverData.stopsLeft}
                  </div>
                  <div className="text-sm text-gray-500">Stops left</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-[#1e1e38] mb-4">
              Current Task Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-[#22c55e] font-medium">
                  Pickup Location
                </div>
                <div className="text-[#1e1e38]">
                  {driverData.currentTaskDetails.pickup.location}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-[#22c55e] font-medium">
                  Pickup Time
                </div>
                <div className="text-[#1e1e38]">
                  {driverData.currentTaskDetails.pickup.time}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-[#22c55e] font-medium">
                  Delivery Location
                </div>
                <div className="text-[#1e1e38]">
                  {driverData.currentTaskDetails.delivery.location}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-[#22c55e] font-medium">
                  Delivery around
                </div>
                <div className="text-[#1e1e38]">
                  {driverData.currentTaskDetails.delivery.time}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverTracking;
