import { useEffect, useMemo, useState } from "react";
import { MdMenu, MdSearch, MdLightMode, MdNotifications } from "react-icons/md";
import { Images } from "../assets/images";
import { useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";

type User = {
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

const Header = ({ onMenuClick, onNotificationClick }: any) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // read user from storage on mount + when storage changes (e.g. after login in another tab)
  useEffect(() => {
    const readUser = () => {
      const raw =
        localStorage.getItem("user") || sessionStorage.getItem("user") || "";
      try {
        return raw ? (JSON.parse(raw) as User) : null;
      } catch {
        return null;
      }
    };
    setUser(readUser());

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") setUser(readUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // build a safe image src every render
  const profileSrc = useMemo(() => {
    const url = getImageUrl(user?.profilePicture);
    return url || Images.Avatar; // fallback if util returns undefined
  }, [user?.profilePicture]);

  // map path -> label
  const routeNames: Record<string, string> = {
    "/": "Dashboard",
    "/tracking": "Driver Tracking",
    "/parcel-tracking": "Parcel Tracking",
    "/route-listing": "Route Listing",
    "/payments": "Payment",
    "/settings": "Settings",
    "/user-types": "Users",
  };
  const pageName = routeNames[location.pathname] || "Dashboard";

  return (
    <header className="h-16 border-b bg-white">
      <div className="h-full px-4 flex items-center">
        {/* Menu button */}
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          onClick={onMenuClick}
        >
          <MdMenu size={24} />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center space-x-4 ml-4">
          <span className="text-sm font-medium">Dashboard</span>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm font-medium">{pageName}</span>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {/* Search */}
          <div className="hidden sm:flex items-center relative">
            <MdSearch className="absolute left-3 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Theme toggle */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MdLightMode size={20} />
          </button>

          {/* Notifications */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            onClick={onNotificationClick}
          >
            <MdNotifications size={20} />
          </button>

          {/* Profile */}
          <img
            src={profileSrc}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
            onError={(e) => {
              // final fallback if the URL 404s
              e.currentTarget.src = Images.Avatar;
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
