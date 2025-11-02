import React, { useState } from "react";
import {
  MdDashboard,
  MdPeople,
  MdLocalShipping,
  MdAssignment,
  MdPayment,
  MdSettings,
  MdLogout,
  MdGroup,
  MdRateReview,
  MdStarRate,
  MdBlockFlipped,
  MdCheckCircle,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { Images } from "../assets/images";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

type MenuItem = {
  icon?: React.ElementType;
  label?: string;
  path?: string;
  heading?: string;
  items?: { icon: React.ElementType; label: string; path: string }[];
};

// all menu links
const menuItems: MenuItem[] = [
  { icon: MdDashboard, label: "Dashboard", path: "/" },
  {
    heading: "Orders",
    items: [
      { icon: MdAssignment, label: "Orders", path: "/orders" },
      { icon: MdAssignment, label: "Pending Assignments", path: "/pending-assignments" },
      { icon: MdAssignment, label: "Ongoing Order", path: "/ongoing-order" },
      { icon: MdLocalShipping, label: "Assign to Driver", path: "/orders/assign" },
      { icon: MdCheckCircle, label: "Completed", path: "/parcel-tracking/completed" },
      { icon: MdBlockFlipped, label: "Cancelled Orders", path: "/parcel-tracking/cancelled" },
    ],
  },

  {
    heading: "Drivers",
    items: [
      { icon: MdPeople, label: "Drivers", path: "/tracking" },
      { icon: MdAssignment, label: "Pending Driver", path: "/pending-drivers" },
      { icon: MdBlockFlipped, label: "Banned Driver", path: "/banned-drivers" },
      { icon: MdRateReview, label: "Ratings ", path: "/ratings" },
    ],
  },
  {
    heading: "Users",
    items: [
      { icon: MdAssignment, label: "Individual", path: "/user-types/individual" },
      { icon: MdAssignment, label: "Business", path: "/user-types/business" }
    ],
  },
  {
    heading: "Feedbacks",
    items: [
      { icon: MdStarRate, label: "FeedBacks", path: "/feedbacks" },
    ],
  },
  {
    heading: "Payments",
    items: [
      { icon: MdPayment, label: "Payments & Invoicing", path: "/payments" },
    ],
  },


];

const LeftSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (heading: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [heading]: !prev[heading],
    }));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white transform z-[1001]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
          flex flex-col border-r`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <img src={Images.Logo} alt="Logo" className="h-8" />
          <button className="ml-auto lg:hidden" onClick={() => setIsOpen(false)}>
            <IoClose size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 mt-3 overflow-y-auto space-y-2">
          {menuItems.map((item, index) => {
            // Simple item (no sub-menu)
            if (item.label && item.path) {
              const Icon = item.icon!;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition 
                    ${isActive
                      ? "bg-[#24123A0D] text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon className="h-5 w-5 mr-3 text-green-600" />
                  {item.label}
                </Link>
              );
            }

            // Dropdown item
            if (item.heading && item.items) {
              const isOpenDropdown = openDropdowns[item.heading];
              return (
                <div key={index}>
                  <button
                    onClick={() => toggleDropdown(item.heading!)}
                    className="flex items-center justify-between w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <span>{item.heading}</span>
                    {isOpenDropdown ? (
                      <MdKeyboardArrowUp className="text-gray-500" />
                    ) : (
                      <MdKeyboardArrowDown className="text-gray-500" />
                    )}
                  </button>

                  {/* Dropdown content */}
                  {isOpenDropdown && (
                    <ul className="space-y-1 ml-5 mt-1">
                      {item.items.map((subItem, subIndex) => {
                        const isActive = location.pathname === subItem.path;
                        return (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition 
                                ${isActive
                                  ? "bg-[#24123A0D] text-gray-900"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                              <subItem.icon className="h-5 w-5 mr-3 text-green-600" />
                              {subItem.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            }

            return null;
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t">
          <Link
            to="/settings"
            className="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
          >
            <MdSettings className="h-5 w-5 mr-3" />
            Settings
          </Link>
          <Link
            to="/auth/login"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
            }}
            className="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
          >
            <MdLogout className="h-5 w-5 mr-3" />
            Logout
          </Link>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
