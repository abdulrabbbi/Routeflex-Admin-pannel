import { IoClose, IoNotifications } from "react-icons/io5";

import { MdCheck } from "react-icons/md";

import { useState, useEffect, useCallback, useRef } from "react";

import Chat from "../components/ChatPopup";

import apiClient from "../api/api";

import { getImageUrl } from "../utils/getImageUrl";

import {
  getNotifications,
  markNotificationAsRead,
} from "../api/deliveryService";

import { useNotifications } from "../realtime/useNotifications";

import { toast } from "react-hot-toast";

type Contact = {
  id: string;

  name: string;

  avatar?: string;
};

type NotificationDoc = {
  _id: string;

  title: string;

  message?: string;

  createdAt: string | Date;
};

const RightSidebar = ({
  isOpen,

  setIsOpen,
}: {
  isOpen: boolean;

  setIsOpen: (v: boolean) => void;
}) => {
  const [activeChat, setActiveChat] = useState<Contact | null>(null);

  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);

  const [contacts, setContacts] = useState<Contact[]>([]);

  const [markingId, setMarkingId] = useState<string | null>(null);

  // prevent double initialization in React StrictMode (dev)

  const initializedRef = useRef(false);

  const hardReplaceNotifications = useCallback((arr: unknown) => {
    // Replace, don't merge. If server returns empty, we show empty.

    setNotifications(Array.isArray(arr) ? (arr as NotificationDoc[]) : []);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(20, 1); // returns current user's notifications

      hardReplaceNotifications(data); // <-- replace, don't merge
    } catch (error) {
      console.error("Failed to fetch notifications", error);

      toast.error("Couldn't load notifications.");

      hardReplaceNotifications([]); // be explicit
    }
  }, [hardReplaceNotifications]);

  // 🔔 real-time notifications

  useNotifications({
    onNew: (n: NotificationDoc) => {
      // ignore if already present

      setNotifications((prev) => {
        if (prev.some((x) => String(x._id) === String(n._id))) return prev;

        return [n, ...prev];
      });
    },

    onRead: ({ id }: { id: string }) => {
      setNotifications((prev) =>
        prev.filter((x) => String(x._id) !== String(id))
      );
    },
  });

  const handleMarkAsRead = async (id: string) => {
    if (markingId) return; // avoid rapid double-clicks

    const previous = notifications;

    setMarkingId(id);

    // optimistic remove

    setNotifications((list) =>
      list.filter((n) => String(n._id) !== String(id))
    );

    try {
      await toast.promise(markNotificationAsRead(id), {
        loading: "Marking as read…",

        success: "Notification marked as read",

        error: "Failed to mark as read",
      });

      // Other tabs/devices will get notify:read via socket. This tab already removed it.
    } catch (e) {
      // revert on failure

      setNotifications(previous);

      console.error(e);
    } finally {
      setMarkingId(null);
    }
  };

  // Load contacts (drivers) once

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await apiClient.get("/users", {
          params: { role: "driver", page: 1, limit: 20 },
        });

        const formatted: Contact[] = (res.data?.data?.users || []).map(
          (driver: any) => ({
            id: driver._id,

            name:
              `${driver.firstName ?? ""} ${driver.lastName ?? ""}`.trim() ||
              driver.email ||
              "Driver",

            avatar: driver.profilePicture || "/placeholder.svg",
          })
        );

        setContacts(formatted);
      } catch (err) {
        console.error("Failed to load drivers:", err);

        toast.error("Couldn't load contacts.");
      }
    };

    fetchDrivers();
  }, []);

  // Initial notifications (replace)

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    // Clear any stale UI state before first fetch

    hardReplaceNotifications([]);

    fetchNotifications();
  }, [fetchNotifications, hardReplaceNotifications]);

  return (
    <>
      {/* Mobile backdrop */}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}

      <div
        className={`fixed lg:static inset-y-0 right-0 w-80 bg-white transform z-[1001]
  ${isOpen ? "translate-x-0" : "translate-x-full"}
  lg:translate-x-0 transition-transform duration-200 ease-in-out
  border-l max-h-screen h-full overflow-hidden`} // <- contain height
      >
        <div className="p-6 h-full flex flex-col gap-8">
          {" "}
          {/* <- full-height flex column */}
          {/* Close (mobile) */}
          <button
            className="absolute top-4 right-4 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <IoClose size={24} />
          </button>
          {/* Notifications (top half) */}
          <div className="flex flex-col basis-1/2 min-h-0">
            {" "}
            {/* <- exactly half, allow shrink */}
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="flex items-center gap-3">
                <button
                  className="text-green-600 text-sm hover:underline"
                  onClick={fetchNotifications}
                >
                  Refresh
                </button>
                <button
                  className="text-gray-500 text-sm hover:underline"
                  onClick={() => hardReplaceNotifications([])}
                  title="Clear locally (for testing after DB resets)"
                >
                  Clear
                </button>
              </div>
            </div>
            {/* scroll lives here */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
              {notifications.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400 text-center px-4">
                  No new notifications.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className="relative group flex gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg p-4 border border-gray-200"
                    >
                      <div className="rounded-full bg-green-100 p-2 h-fit">
                        <IoNotifications className="h-4 w-4 text-green-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {n.title}
                        </p>
                        {n.message ? (
                          <p className="text-sm text-gray-600 break-words">
                            {n.message}
                          </p>
                        ) : null}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n._id)}
                        disabled={markingId === n._id}
                        title="Mark as read"
                        className={`hidden group-hover:flex absolute top-2 right-2 items-center justify-center
                  rounded bg-green-100 hover:bg-green-200 p-1 transition
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {markingId === n._id ? (
                          <span className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <MdCheck className="h-4 w-4 text-green-600" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Contacts (bottom half) */}
          <div className="flex flex-col basis-1/2 min-h-0">
            {" "}
            {/* <- exactly half, allow shrink */}
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold">Contacts</h3>
              <button className="text-green-600 text-sm hover:underline">
                Show All
              </button>
            </div>
            {/* scroll lives here */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-4">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChat(c)}
                    className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2"
                  >
                    <img
                      src={getImageUrl(c.avatar)}
                      alt={c.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <p className="font-medium truncate">{c.name}</p>
                  </button>
                ))}

                {contacts.length === 0 && (
                  <div className="text-gray-400 text-center py-6">
                    No contacts found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeChat && (
        <Chat contact={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </>
  );
};

export default RightSidebar;
