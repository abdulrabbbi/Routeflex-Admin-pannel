import React, { useState, useEffect, useCallback } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiTrash2, FiCheck } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { toast } from "react-hot-toast";

import ConfirmModal from "../components/ConfirmModal";
import {
  getDrivers,
  deleteDriver,
  verifyDriverDocs,
} from "../api/deliveryService";

interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  rating: number;
  isVerified: boolean;
  createdAt: string;
  profilePicture: string;
}

const DriversTable: React.FC = React.memo(() => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDrivers = useCallback(async (pageNum: number = 1) => {
    const res = await getDrivers(10, pageNum);
    setDrivers(res.data.users);
    setTotalPages(res.totalPages);
    setPage(pageNum);
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setModalOpen(true);
    setDropdownOpen(null);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteDriver(deleteId);
      fetchDrivers(page);
      setModalOpen(false);
    }
  };

  const handleVerify = useCallback(
    async (id: string) => {
      await verifyDriverDocs(id);
      toast.success("Driver verified!!");
      fetchDrivers(page);
    },
    [fetchDrivers, page]
  );

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Drivers List</h2>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Driver"
        message="Are you sure you want to delete this driver?"
      />
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-[#f0fdf4]">
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Profile
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Driver ID
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Full Name
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Rating
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Is Verified
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Created At
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver._id} className="hover:bg-gray-50 relative">
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <img
                    src={driver.profilePicture || "/assets/images/avatar.png"}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-4 py-4 text-sm text-center">{driver._id}</td>
                <td className="px-4 py-4 text-sm text-center">
                  {driver.firstName} {driver.lastName}
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  <div className="flex justify-center items-center gap-1 text-yellow-400">
                    {Array.from({ length: driver.rating }, (_, i) => (
                      <AiFillStar key={i} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      driver.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {driver.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  {new Date(driver.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-sm relative text-center">
                  <button
                    onClick={() =>
                      setDropdownOpen(
                        dropdownOpen === driver._id ? null : driver._id
                      )
                    }
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <BsThreeDotsVertical className="mx-auto" />
                  </button>

                  {dropdownOpen === driver._id && (
                    <div className="absolute right-4 top-12 z-10 bg-white border rounded shadow w-32">
                      <button
                        onClick={() => handleDeleteClick(driver._id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100"
                      >
                        <FiTrash2 /> Delete
                      </button>
                      <button
                        onClick={() => {
                          handleVerify(driver._id);
                          setDropdownOpen(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-green-500 hover:bg-gray-100"
                      >
                        <FiCheck /> Verify Docs
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => fetchDrivers(page - 1)}
          className={`px-4 py-2 rounded ${
            page === 1 ? "bg-gray-300" : "bg-[#22c55e] text-white"
          }`}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => fetchDrivers(page + 1)}
          className={`px-4 py-2 rounded ${
            page === totalPages ? "bg-gray-300" : "bg-[#22c55e] text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default DriversTable;
