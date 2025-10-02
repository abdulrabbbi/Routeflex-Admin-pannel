import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { Delivery } from "../../types/deliveries";
import { statusPillClasses } from "../../utils/deliveries/status";

export const DeliveriesRow: React.FC<{
  d: Delivery;
  onDelete: (id: string) => void;
  disabled?: boolean;
}> = ({ d, onDelete, disabled }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
        {d.deliveryId}
      </td>
      <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
        {(d.driverId || "").slice(-6).toUpperCase()}
      </td>
      <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
        {d.driverFullName || "-"}
      </td>
      <td className="px-4 py-4 text-sm text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusPillClasses(
            d.deliveryStatus
          )}`}
        >
          {d.deliveryStatus || "-"}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-center hidden md:table-cell">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusPillClasses(
            d.paymentStatus || ""
          )}`}
        >
          {d.paymentStatus || "-"}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-center hidden md:table-cell">
        {typeof d.distance === "number" ? `${d.distance.toFixed(2)} km` : "-"}
      </td>
      <td className="px-4 py-4 text-sm text-center">
        {d.packageCategory || "-"}
      </td>
      <td className="px-4 py-4 text-sm text-center">
        <button
          onClick={() => onDelete(d.deliveryId)}
          className="p-2 rounded hover:bg-gray-100 text-red-500 disabled:opacity-50"
          aria-label="Delete delivery"
          disabled={disabled}
        >
          <FiTrash2 className="mx-auto" />
        </button>
      </td>
    </tr>
  );
};
