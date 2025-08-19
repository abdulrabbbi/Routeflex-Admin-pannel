import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getImageUrl } from "../utils/getImageUrl";
import { handleError } from "../utils/handleApiResponse";
import { AiFillStar } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { FaArrowLeft } from "react-icons/fa";
import {
  getDriverById,
  deleteDriver,
  verifyDriverDocs,
} from "../api/deliveryService";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCreditCard,
  FiTruck,
  FiFileText,
  FiCheck,
  FiClock,
  FiX,
} from "react-icons/fi";

interface DriverData {
  user: {
    _id: string;
    email: string;
    profilePicture: string;
    role: string;
    isVerified: boolean;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    driverStatus: string;
    rating: number;
    ratingCount: number;
    incidentHistory: any[];
    createdAt: string;
    driverTrackingId: string;
    address: {
      street: string;
      city: string;
      postCode: string;
      country: string;
    };
    location: {
      type: string;
      coordinates: number[];
    };
    documents: {
      driverLicenseFront: string;
      driverLicenseBack: string;
      vehicleInsurance: string;
      goodsForHireInsurance: string;
      publicLiabilityInsurance: string;
      proofOfAddress: string;
      rightToWork: string;
      nationalInsurance: string;
      disclosureReceipt: string;
      dvlaCheck: string;
    };
    vehicle: {
      make: string;
      model: string;
      year: number;
      color: string;
      licensePlate: string;
    };
    paymentDetails: {
      accountHolderName: string;
      bankName: string;
      accountNumber: string;
      sortCode: string;
    };
  };
}

const DriverDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriver = async (id: string) => {
      try {
        setLoading(true);
        const data = await getDriverById(id);
        setDriver(data?.data);
      } catch (error) {
        handleError(error, "Failed to fetch driver details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDriver(id);
    }
  }, [id]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteDriver(deleteId);
      toast.success("Driver deleted!");
      navigate(-1); // go back after delete
    }
  };

  const handleVerify = async (id?: string) => {
    if (!id) return;
    setVerifying(true);
    try {
      await verifyDriverDocs(id);
      toast.success("Driver verified!");
      // refetch driver to update status
      const data = await getDriverById(id);
      setDriver(data?.data);
    } catch (error) {
      toast.error("Failed to verify driver.");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-delivery":
        return "bg-blue-100 text-blue-700";
      case "available":
        return "bg-[#f0fdf4] text-[#22c55e]";
      case "offline":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const documentLabels = {
    driverLicenseFront: "Driver License (Front)",
    driverLicenseBack: "Driver License (Back)",
    vehicleInsurance: "Vehicle Insurance",
    goodsForHireInsurance: "Goods for Hire Insurance",
    publicLiabilityInsurance: "Public Liability Insurance",
    proofOfAddress: "Proof of Address",
    rightToWork: "Right to Work",
    nationalInsurance: "National Insurance",
    disclosureReceipt: "Disclosure Receipt",
    dvlaCheck: "DVLA Check",
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!driver) return <div className="p-4">No driver found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="bg-[#f0fdf4] px-6 py-4 border-b flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-[#dcfce7] transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 text-[#22c55e]" />
            </button>
            <h1 className="text-2xl font-bold text-[#22c55e]">
              Driver Profile
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {driver.user.isVerified ? (
              <button
                disabled
                title="Already Verified"
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed flex items-center gap-2"
              >
                ✅ Verified
              </button>
            ) : (
              <button
                onClick={() => id && handleVerify(id)}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#22c55e] text-white hover:bg-green-400 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {verifying ? (
                  <>
                    <span className="loader"></span>
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Verify Docs"
                )}
              </button>
            )}

            <button
              onClick={() => id && handleDeleteClick(id)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center md:items-start">
              <img
                src={
                  getImageUrl(driver.user.profilePicture) || "/placeholder.svg"
                }
                alt="Driver Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-[#22c55e]"
              />
              <div className="mt-4 text-center md:text-left">
                <h2 className="text-xl font-semibold text-gray-900">
                  {driver.user.firstName} {driver.user.lastName}
                </h2>
                <p className="text-gray-600">
                  Driver ID: {driver.user.driverTrackingId}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      driver.user.driverStatus
                    )}`}
                  >
                    {driver.user.driverStatus.replace("-", " ").toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      driver.user.isVerified
                        ? "bg-[#f0fdf4] text-[#22c55e]"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {driver.user.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiMail className="text-[#22c55e]" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{driver.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-[#22c55e]" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{driver.user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-[#22c55e]" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">
                      {formatDate(driver.user.dateOfBirth)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-[#22c55e]" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {driver.user.address.street}, {driver.user.address.city},{" "}
                      {driver.user.address.postCode},{" "}
                      {driver.user.address.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {Array.from(
                          { length: Math.floor(driver.user.rating) },
                          (_, i) => (
                            <AiFillStar key={i} />
                          )
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({driver.user.ratingCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiClock className="text-[#22c55e]" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">
                      {formatDate(driver.user.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiTruck className="text-[#22c55e]" />
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium">
                      {driver.user.vehicle.make} {driver.user.vehicle.model} (
                      {driver.user.vehicle.year}) - {driver.user.vehicle.color}
                    </p>
                    <p className="text-sm">
                      Plate: {driver.user.vehicle.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg border">
        <div className="bg-[#f0fdf4] px-4 py-3 border-b">
          <h3 className="font-semibold text-[#22c55e] flex items-center gap-2">
            <FiFileText /> Documents
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(driver.user.documents).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedDoc(getImageUrl(value))}
              >
                <span className="text-sm">
                  {documentLabels[key as keyof typeof documentLabels]}
                </span>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#22c55e] w-4 h-4" />
                  <span className="text-xs text-[#22c55e]">View</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg border">
        <div className="bg-[#f0fdf4] px-4 py-3 border-b">
          <h3 className="font-semibold text-[#22c55e] flex items-center gap-2">
            <FiCreditCard /> Payment Details
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Holder</p>
              <p className="font-medium">
                {driver.user.paymentDetails.accountHolderName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium">
                {driver.user.paymentDetails.bankName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-medium">
                {driver.user.paymentDetails.accountNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sort Code</p>
              <p className="font-medium">
                {driver.user.paymentDetails.sortCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Document Preview */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[60vh] flex flex-col">
            <div className="flex justify-end p-2">
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setSelectedDoc(null)}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="overflow-auto p-4 flex-1 flex items-center justify-center">
              <img
                src={selectedDoc}
                alt="Document Preview"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

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

export default DriverDetailsPage;
