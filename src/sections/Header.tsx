import { useEffect, useMemo, useRef, useState } from "react";
import { MdMenu, MdSearch, MdNotifications } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { Images } from "../assets/images";
import { getImageUrl } from "../utils/getImageUrl";
import { getSignedUrl, s3UrlToKey } from "../utils/s3";
import NotificationsPanel from "../components/rightbar/NotificationsPanel";

type User = {
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

type HeaderProps = {
  onMenuClick?: () => void;
};

const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();

  /** ---------------- user state (from local/session) ---------------- */
  const [user, setUser] = useState<User | null>(null);
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

  /** ---------------- profile photo resolution (S3 / http / asset) ---------------- */
  const [profileSrc, setProfileSrc] = useState<string>(Images.Avatar);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const v = user?.profilePicture?.trim() || "";

    const resolve = async () => {
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
          if (!cancelled) setProfileSrc(signed || v || Images.Avatar);
        } else {
          const url = getImageUrl(v) || v;
          if (!cancelled) setProfileSrc(url || Images.Avatar);
        }
      } catch {
        if (!cancelled) setProfileSrc(Images.Avatar);
      } finally {
        if (!cancelled) setImgLoaded(true);
      }
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [user?.profilePicture]);

  /** ---------------- notifications dropdown (old working style) ---------------- */
  const [openMenu, setOpenMenu] = useState<"notify" | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleNotify = () =>
    setOpenMenu((v) => (v === "notify" ? null : "notify"));

  /** ---------------- computed display name & role label ---------------- */
  const displayName = useMemo(() => {
    const f = user?.firstName?.trim() || "";
    const l = user?.lastName?.trim() || "";
    const full = `${f} ${l}`.trim();
    return full || "Admin User";
  }, [user?.firstName, user?.lastName]);

  const roleLabel = useMemo(() => {
    if (!user?.role) return "Administrator";
    return user.role.toLowerCase() === "admin" ? "Administrator" : user.role;
  }, [user?.role]);

  /** ---------------- UI ---------------- */
  return (
    <header className="h-16 bg-[#F3F5F7] border-b border-gray-200">
      <div className="h-full px-3 sm:px-4 md:px-6 flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-200/60"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <MdMenu size={22} className="text-gray-700" />
        </button>

        {/* Search pill */}
        <div className="flex-1">
          <div className="relative max-w-[560px]">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="search"
              placeholder="Search orders, drivers, customers..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         placeholder:text-gray-400 text-[14px]"
            />
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications with red badge (local dropdown) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleNotify}
              className="relative p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200"
              aria-label="Notifications"
            >
              <MdNotifications size={18} className="text-gray-700" />
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center leading-none">
                2
              </span>
            </button>

            {openMenu === "notify" && (
              <div className="absolute right-0 mt-2 w-[320px] max-h-[420px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {/* <NotificationsPanel /> */}
                <NotificationsPanel pageSize={20} maxHeight={420} maxWidth={360} />

              </div>
            )}
          </div>

          {/* Profile chip */}
          <div className="flex items-center gap-2.5 md:gap-3 bg-white rounded-full border border-gray-200 py-1 pl-1.5 pr-3">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-green-200/70" />
              <img
                src={profileSrc}
                alt="Profile"
                className="relative h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = Images.Avatar;
                }}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] font-semibold text-gray-800">
                {displayName}
              </div>
              <div className="text-[11px] text-gray-500">{roleLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
