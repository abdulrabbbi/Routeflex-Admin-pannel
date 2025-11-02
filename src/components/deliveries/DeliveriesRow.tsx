import React, { useMemo, useState } from "react";
import { DeliveryRowApi } from "../../types/deliveries";
import { FiTrash2, FiEye } from "react-icons/fi";
import { TrackOrderDrawer } from "./TrackOrderDrawer";
import { Link } from "react-router-dom";




export const DeliveriesRow: React.FC<{
  d: DeliveryRowApi;
  onDelete: (id: string) => void;
  disabled?: boolean;
}> = ({ d, onDelete, disabled }) => {
  // const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Drawer state

  const distance = useMemo(
    () => (typeof d.distance === "number" ? `${d.distance.toFixed(1)} km` : "—"),
    [d.distance]
  );

  return (
    <>

      <tr className="hover:bg-gray-50">
        <td className="px-3 py-3 text-sm text-center">{String(d.parcelId).slice(-6).toUpperCase()}</td>
        <td className="px-3 py-3 text-sm text-center cursor-pointer"
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
        {/* <td className="px-4 py-4 text-sm text-center hidden md:table-cell">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              d.payment === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {d.payment}
          </span>
        </td> */}
        <td className="px-3 py-3 text-sm text-center hidden md:table-cell">{distance}</td>
        <td className="px-3 py-3 text-sm text-center hidden md:table-cell">{d.package}</td>
        <td className="px-3 py-3 text-sm text-center flex items-center justify-center">
          {/* <button
            type="button"
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Actions"
            disabled={disabled}
          > */}
          {/* <FiMoreVertical className="w-5 h-5 text-[#22c55e]" />
             */}

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
          {/* </button> */}

          {/* {menuOpen && (
            <div
              className="absolute right-2 z-10 mt-2 w-36 rounded-lg border bg-white shadow"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                onClick={() => {
                  setDrawerOpen(true);
                  setMenuOpen(false);
                }}

              >
                <FiEye /> View
              </button>
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600"
                onClick={() => onDelete(d.parcelId)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          )} */}
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
