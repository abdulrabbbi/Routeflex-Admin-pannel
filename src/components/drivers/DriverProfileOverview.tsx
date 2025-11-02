"use client";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/shared/Tabs";
import { getDriverById, deleteDriver, verifyDriverDocs } from "../../api/deliveryService";

import { handleError } from "../../utils/handleApiResponse";
import { toast } from "react-hot-toast";
import DriverOverview from "./driver-profile/DriverOverview";
import PerformanceTab from "./driver-profile/PerformanceTab";
import DriverHistoryTab from "./driver-profile/DriverHistoryTab";
import DriverLocationTab from "./driver-profile/DriverLocationTab";
import AvatarSigned from "../driverDetail/AvatarSigned";
import ConfirmModal from "../ConfirmModal";
import { MdDelete } from "react-icons/md";

const DriverProfileOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchDriver = async (driverId: string) => {
      try {
        setLoading(true);
        const data = await getDriverById(driverId);
        setDriver(data?.data);
      } catch (error) {
        handleError(error, "Failed to fetch driver details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDriver(id);
  }, [id]);

  const handleVerify = async (driverId?: string) => {
    if (!driverId) return;
    setVerifying(true);
    try {
      await verifyDriverDocs(driverId);
      toast.success("Driver verified successfully!");
      const updated = await getDriverById(driverId);
      setDriver(updated?.data);
    } catch (error) {
      handleError(error, "Failed to verify driver");
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteClick = (driverId: string) => {
    setDeleteId(driverId);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDriver(deleteId);
      toast.success("Driver deleted!");
      navigate(-1);
    } catch (err) {
      handleError(err, "Failed to delete driver");
    }
  };
  if (loading) return <p>Loading driver profile...</p>;
  if (!driver) return <p>No driver found</p>;

  const user = driver.user;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Driver Image and Name */}
      <div className="flex flex-col items-center text-center">
        <AvatarSigned
          value={user?.profilePicture}
          // alt={`${user?.firstName} ${user?.lastName}`}
          className="w-32 h-32 rounded-full object-cover border-2 border-green-500"
        />

        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          {user?.firstName} {user?.lastName}
        </h2>



        <p className="text-gray-600 mt-1">Driver ID: {user?.driverTrackingId}</p>

        <div className="flex items-center justify-center gap-5">
          {/* Verify Button */}
          <div className="mt-3">
            {user?.isVerified ? (
              <button
                disabled
                title="Already Verified"
                className="px-4 py-2 text-sm rounded-full bg-green-100 text-green-600 cursor-not-allowed"
              >
                Verified
              </button>
            ) : (
              <button
                onClick={() => id && handleVerify(id)}
                disabled={verifying}
                className="px-4 py-2 rounded-full text-sm bg-[#22c55e] text-white hover:bg-green-400 disabled:opacity-70"
              >
                {verifying ? "Verifying..." : "Verify Docs"}
              </button>
            )}
          </div>
          <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full mt-3 cursor-not-allowed" title="driver Status">{user?.driverStatus}</div>
          <button
            onClick={() => id && handleDeleteClick(id)}
            className="px-4 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 mt-3"
            title="Delete Driver"
          >
            <MdDelete size={25} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <DriverOverview />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <PerformanceTab />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <DriverHistoryTab />
        </TabsContent>

        <TabsContent value="location" className="mt-4">
          <DriverLocationTab driverTrackingId={user?.driverTrackingId} />
        </TabsContent>
      </Tabs>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Driver"
        message="Are you sure you want to delete this driver?"
      />
    </div>
  );
};

export default DriverProfileOverview;
