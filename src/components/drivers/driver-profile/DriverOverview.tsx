import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDriverById } from "../../../api/deliveryService";
import { handleError } from "../../../utils/handleApiResponse";
import { AiFillStar } from "react-icons/ai";
import DriverDocuments from "../../driverDetail/DriverDocuments";
interface DriverData {
    user: {
        profilePicture: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        dateOfBirth: string;
        driverStatus: "on-delivery" | "available" | "offline" | string;
        rating: number;
        ratingCount: number;
        createdAt: string;
        vehicle: {
            make: string;
            model: string;
            year: number;
            color: string;
            licensePlate: string;
        };
        address: {
            street: string;
            city: string;
            postCode: string;
            country: string;
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
            [key: string]: string; // allow future doc types
        };
        paymentDetails: {
            accountHolderName: string;
            bankName: string;
            accountNumber: string;
            sortCode: string;
        };
        isVerified: boolean;
    };
}

const DriverOverview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [driver, setDriver] = useState<DriverData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDriver = async (driverId: string) => {
            try {
                setLoading(true);
                const res = await getDriverById(driverId);
                setDriver(res?.data);
            } catch (err) {
                handleError(err, "Failed to fetch driver details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDriver(id);
    }, [id]);

    function formatPhone(phoneStr: string | null | undefined): string {
        if (!phoneStr) return "—";

        const regex =
            /countryISOCode:\s*([A-Z]{2}),\s*countryCode:\s*([+\d]+),\s*number:\s*(\d+)/;

        const match = phoneStr.match(regex);
        if (!match) return phoneStr; // fallback if it doesn't match pattern

        const [, countryISO, countryCode, number] = match;
        return `${countryCode} ${number} (${countryISO})`;
    }


    if (loading) return <p>Loading...</p>;
    if (!driver) return <p>No driver found</p>;

    const { user } = driver;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "on-delivery":
                return "bg-blue-100 text-blue-700";
            case "available":
                return "bg-green-100 text-green-800";
            case "offline":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-GB");

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1 */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-[#22c55e]">📧</span>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium break-all">{driver.user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[#22c55e]">📞</span>
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium">{formatPhone(driver.user.phone)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[#22c55e]">📅</span>
                        <div>
                            <p className="text-sm text-gray-600">Date of Birth</p>
                            <p className="font-medium">
                                {formatDate(driver.user.dateOfBirth)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[#22c55e]">📍</span>
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

                {/* Column 2 */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-sm text-gray-600">Rating</p>
                            <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {Array.from(
                                        { length: Math.floor(driver.user.rating || 0) },
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
                        <span className="text-[#22c55e]">⏰</span>
                        <div>
                            <p className="text-sm text-gray-600">Member Since</p>
                            <p className="font-medium">
                                {formatDate(driver.user.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[#22c55e]">🚚</span>
                        <div>
                            <p className="text-sm text-gray-600">Vehicle</p>
                            <p className="font-medium">
                                {(driver.user.vehicle.make || "Unknown") +
                                    " " +
                                    (driver.user.vehicle.model || "")}{" "}
                                ({driver.user.vehicle.year}) - {driver.user.vehicle.color}
                            </p>
                            <p className="text-sm">
                                Plate: {driver.user.vehicle.licensePlate}
                            </p>
                        </div>
                    </div>
                </div>
                <DriverDocuments documents={user.documents} />
                <div className="bg-white rounded-lg border">
                    <div className="bg-[#f0fdf4] px-4 py-3 border-b">
                        <h3 className="font-semibold text-[#22c55e] flex items-center gap-2">
                            💳 Payment Details
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
                                <p className="font-medium">{driver.user.paymentDetails.bankName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Account Number</p>
                                <p className="font-medium">
                                    {driver.user.paymentDetails.accountNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Sort Code</p>
                                <p className="font-medium">{driver.user.paymentDetails.sortCode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Documents */}

        </div>
    );
};

export default DriverOverview;
