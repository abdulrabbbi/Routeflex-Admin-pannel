import { useEffect, useState, useRef } from "react";
import { MdMenu, MdSearch, MdLightMode, MdNotifications } from "react-icons/md";
import { Images } from "../assets/images";
import { useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import { getSignedUrl, s3UrlToKey } from "../utils/s3";
import NotificationsPanel from "../components/rightbar/NotificationsPanel";

type User = {
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

const Header = ({ onMenuClick }: any) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Read user from local or session storage
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

  // Toggle dropdowns
  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle user profile image
  const [profileSrc, setProfileSrc] = useState<string | null>(null);
  const [resolving, setResolving] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const v = user?.profilePicture || "";

    const compute = async () => {
      setResolving(true);
      setImgLoaded(false);
      try {
        if (!v) {
          if (!cancelled) {
            setProfileSrc(Images.Avatar);
            setImgLoaded(true);
          }
          return;
        }

        const isHttp = /^https?:/i.test(v);
        const isS3Http = isHttp && /amazonaws\.com/.test(v);
        const isKeyLikely = !isHttp && !v.startsWith("/");

        if (isS3Http || isKeyLikely) {
          const signed = await getSignedUrl(s3UrlToKey(v), 300);
          if (!cancelled) setProfileSrc(signed || Images.Avatar);
        } else {
          const url = getImageUrl(v);
          if (!cancelled) setProfileSrc(url || Images.Avatar);
        }
      } catch {
        if (!cancelled) {
          setProfileSrc(Images.Avatar);
          setImgLoaded(true);
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    void compute();
    return () => {
      cancelled = true;
    };
  }, [user?.profilePicture]);

  // Map routes to labels
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
    <header className="h-16 border-b bg-white relative">
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

        <div className="ml-auto  flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <MdSearch className="absolute left-3 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border  rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Theme toggle */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MdLightMode size={20} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={menuRef}>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => toggleMenu("notify")}
            >
              <MdNotifications size={20} />
            </button>

            {activeMenu === "notify" && (
              <div className="absolute right-0 mt-2 bg-white  w-[300px] rounded-md shadow-full p-4 max-h-[400px] overflow-y-auto z-50">
                
                <NotificationsPanel />
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative h-8 w-8">
            {(resolving || !imgLoaded) && (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            )}
            {profileSrc && (
              <img
                key={profileSrc}
                src={profileSrc}
                alt="Profile"
                className={`h-8 w-8 rounded-full object-cover ${resolving || !imgLoaded ? "hidden" : "block"
                  }`}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                  e.currentTarget.src = Images.Avatar;
                  setImgLoaded(true);
                }}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
