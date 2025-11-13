import React, { useState } from "react";
import {
  MdDashboard,
  MdPeople,
  MdLocalShipping,
  MdAssignment,
  MdPayment,
  MdSettings,
  MdLogout,
  MdRateReview,
  MdStarRate,
  MdBlockFlipped,
  MdCheckCircle,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdAssessment, 
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
  headingIcon?: React.ElementType; // allow icon for group headings
  items?: { icon: React.ElementType; label: string; path: string }[];
};

// Dark green palette pulled to resemble the screenshot
const COLORS = {
  bg: "#153C2B", // sidebar background (deep green)
  activeBg: "#2F6B49", // active item pill (lighter green)
  text: "rgba(255,255,255,0.90)",
  textMuted: "rgba(255,255,255,0.70)",
  hoverBg: "rgba(255,255,255,0.08)",
  divider: "rgba(255,255,255,0.10)",
};

const menuItems: MenuItem[] = [
  { icon: MdDashboard, label: "Dashboard", path: "/" },

  {
    heading: "Orders",
    headingIcon: MdAssignment,
    items: [
      { icon: MdAssignment, label: "Orders", path: "/orders" },
      {
        icon: MdAssignment,
        label: "Pending Assignments",
        path: "/pending-assignments",
      },
      { icon: MdAssignment, label: "Ongoing Order", path: "/ongoing-order" },
      {
        icon: MdLocalShipping,
        label: "Assign to Driver",
        path: "/orders/assign",
      },
      { icon: MdCheckCircle, label: "Completed", path: "/completed" },
      {
        icon: MdBlockFlipped,
        label: "Cancelled Orders",
        path: "/parcel-tracking/cancelled",
      },
    ],
  },

  {
    heading: "Drivers",
    headingIcon: MdLocalShipping,
    items: [
      { icon: MdPeople, label: "Drivers", path: "/tracking" },
      { icon: MdAssignment, label: "Pending Driver", path: "/pending-drivers" },
      { icon: MdBlockFlipped, label: "Banned Driver", path: "/banned-drivers" },
      { icon: MdRateReview, label: "Ratings ", path: "/ratings" },
    ],
  },

  {
    heading: "Customers",
    headingIcon: MdPeople,
    items: [
      {
        icon: MdAssignment,
        label: "Individual",
        path: "/user-types/individual",
      },
      { icon: MdAssignment, label: "Business", path: "/user-types/business" },
    ],
  },

  {
    heading: "Feedbacks",
    headingIcon: MdStarRate,
    items: [{ icon: MdStarRate, label: "FeedBacks", path: "/feedbacks" }],
  },

  {
    heading: "Payments",
    headingIcon: MdPayment,
    items: [
      { icon: MdPayment, label: "Payments & Invoicing", path: "/payments" },
    ],
  },
];

const LeftSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleDropdown = (heading: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [heading]: !prev[heading] }));
  };

  const isActivePath = (path?: string) => !!path && location.pathname === path;

  // keep the rest of COLORS as-is, just add/adjust these:
  const COLORS = {
    bg: "#153C2B",
    headerBg: "#122F22", // darker strip behind brand (new)
    activeBg: "#2F6B49",
    text: "rgba(255,255,255,0.90)",
    textMuted: "rgba(255,255,255,0.70)",
    hoverBg: "rgba(255,255,255,0.08)",
    divider: "rgba(255,255,255,0.10)",
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 z-[1001] transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          transition-transform duration-200 ease-in-out flex flex-col`}
        style={{ backgroundColor: COLORS.bg }}
      >
        {/* Header / Logo
        <div className="h-16 flex items-center px-5" style={{ borderBottom: `1px solid ${COLORS.divider}` }}>
          <img src={Images.Logo} alt="Logo" className="h-8 object-contain" />
          <button className="ml-auto lg:hidden text-white/90" onClick={() => setIsOpen(false)}>
            <IoClose size={22} />
          </button>
        </div> */}
        {/* Header / Brand */}
        <div
          className="px-5 pt-5 pb-4"
          style={{
            borderBottom: `1px solid ${COLORS.divider}`,
            backgroundColor: COLORS.headerBg, // darker band like the screenshot
          }}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <div
                className="text-white font-extrabold tracking-wide"
                style={{ fontSize: 22, lineHeight: "24px" }}
              >
                RouteFlex
              </div>
              <div
                className="text-[12px] leading-4 mt-1"
                style={{ color: COLORS.textMuted }}
              >
                Efficient Delivery, Simplified
              </div>
            </div>

            {/* mobile close */}
            <button
              className="ml-auto lg:hidden"
              style={{ color: "rgba(255,255,255,0.9)" }}
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Simple one-level items (from your top item like Dashboard) */}
          {menuItems.map((item, index) => {
            // SINGLE ITEM
            if (item.label && item.path && item.icon) {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              return (
                <Link
                  key={`single-${index}`}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1"
                  style={{
                    backgroundColor: active ? COLORS.activeBg : "transparent",
                    color: active ? "#fff" : COLORS.text,
                  }}
                >
                  <Icon size={18} color="#FFFFFF" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            }

            // DROPDOWN GROUP
            if (item.heading && item.items) {
              const open = !!openDropdowns[item.heading];
              const HeadingIcon = item.headingIcon;
              return (
                <div key={`group-${index}`} className="mb-1">
                  <button
                    onClick={() => toggleDropdown(item.heading!)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg"
                    style={{
                      color: COLORS.text,
                      backgroundColor: open ? COLORS.hoverBg : "transparent",
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {HeadingIcon && <HeadingIcon size={18} color="#FFFFFF" />}
                      {item.heading}
                    </span>
                    {open ? (
                      <MdKeyboardArrowUp className="text-white/90" size={18} />
                    ) : (
                      <MdKeyboardArrowDown
                        className="text-white/90"
                        size={18}
                      />
                    )}
                  </button>

                  {/* Sub-links */}
                  {open && (
                    <ul
                      className="mt-1 ml-2.5 pl-2 border-l"
                      style={{ borderColor: COLORS.divider }}
                    >
                      {item.items.map((sub, sidx) => {
                        const subActive = isActivePath(sub.path);
                        const SubIcon = sub.icon;
                        return (
                          <li key={`sub-${index}-${sidx}`} className="mb-1">
                            <Link
                              to={sub.path}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg"
                              style={{
                                backgroundColor: subActive
                                  ? COLORS.activeBg
                                  : "transparent",
                                color: subActive ? "#fff" : COLORS.textMuted,
                              }}
                            >
                              <SubIcon size={16} color="#FFFFFF" />
                              <span className="text-[13px]">{sub.label}</span>
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
        <div
          className="mt-auto px-3 pb-4"
          style={{ borderTop: `1px solid ${COLORS.divider}` }}
        >
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2"
            style={{ color: COLORS.text }}
          >
            <MdSettings size={18} color="#FFFFFF" />
            <span className="text-sm font-medium">Settings</span>
          </Link>

          <Link
            to="/auth/login"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{ color: COLORS.text }}
          >
            <MdLogout size={18} color="#FFFFFF" />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
