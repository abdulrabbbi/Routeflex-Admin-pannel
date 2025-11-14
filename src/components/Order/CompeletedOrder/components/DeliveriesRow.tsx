import React, { useMemo, useState } from "react";
import { DeliveryRowApi } from "../../../../types/deliveries";
import { FiTrash2, FiEye } from "react-icons/fi";
import { TrackOrderDrawer } from "../Drawer/TrackOrderDrawer";

export const DeliveriesRow: React.FC<{
  d: DeliveryRowApi;
  onDelete: (id: string) => void;
  disabled?: boolean;
}> = ({ d, onDelete, disabled }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);


  const distance = useMemo(
    () =>
      typeof d.distance === "number" ? `${d.distance.toFixed(1)} km` : "—",
    [d.distance]
  );

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-3 text-sm text-center">
          {String(d.parcelId).slice(-6).toUpperCase()}
        </td>
        <td
          className="px-3 py-3 text-sm text-center cursor-pointer"
          onClick={() => {
            setDrawerOpen(true);
            // setMenuOpen(false);
          }}
        >
          {d.driverId ?? "—"}
        </td>
        <td className="px-3 py-3 text-sm text-center">{d.driverName}</td>
        <td className="px-3 py-3 text-sm text-center">
          <span className="px-3 py-3 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {d.status}
          </span>
        </td>
       
        <td className="px-3 py-3 text-sm text-center hidden md:table-cell">
          {distance}
        </td>
        <td className="px-3 py-3 text-sm text-center hidden md:table-cell">
          {d.package}
        </td>
        <td className="px-3 py-3 text-sm text-center flex items-center justify-center">
        
          <button
            className=" text-center px-3 py-3 text-green-600 hover:bg-gray-50 text-sm"
            onClick={() => {
              setDrawerOpen(true);
              // setMenuOpen(false);
            }}
            title="View Details"
          >
            <FiEye />
          </button>

          <button
            className="text-center px-3 py-3 hover:bg-gray-50 text-sm text-red-600"
            onClick={() => onDelete(d.parcelId)}
            title="Delete Delivery"
          >
            <FiTrash2 />
          </button>

        </td>
      </tr>

      <TrackOrderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        deliveryId={d.parcelId}
      />
    </>
  );
};
