import { useEffect, useRef, useCallback, useState } from "react";
import { IoNotifications } from "react-icons/io5";
import { MdCheck } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useNotifications } from "../../realtime/useNotifications";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../api/deliveryService";

export type NotificationDoc = {
  _id: string;
  title: string;
  message?: string;
  createdAt: string | Date;
};

type Props = {
  className?: string;
  pageSize?: number;
  /** Max scrollable height of the list area (px). Default: 420 */
  maxHeight?: number;
  /** Max panel width (px). Default: 360 */
  maxWidth?: number;
};

export default function NotificationsPanel({
  className = "",
  pageSize = 20,
  maxHeight = 420,
  maxWidth = 360,
}: Props) {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const hardReplace = useCallback((arr: unknown) => {
    setNotifications(Array.isArray(arr) ? (arr as NotificationDoc[]) : []);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(pageSize, 1);
      hardReplace(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      toast.error("Couldn't load notifications.");
      hardReplace([]);
    }
  }, [pageSize, hardReplace]);

  // realtime
  useNotifications({
    onNew: (n: NotificationDoc) => {
      setNotifications((prev) =>
        prev.some((x) => String(x._id) === String(n._id)) ? prev : [n, ...prev]
      );
    },
    onRead: ({ id }: { id: string }) => {
      setNotifications((prev) =>
        prev.filter((x) => String(x._id) !== String(id))
      );
    },
  });

  // initial load (once)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    hardReplace([]);
    fetchNotifications();
  }, [fetchNotifications, hardReplace]);

  const handleMarkAsRead = async (id: string) => {
    if (markingId) return;
    const prev = notifications;
    setMarkingId(id);
    setNotifications((list) =>
      list.filter((n) => String(n._id) !== String(id))
    );
    try {
      await toast.promise(markNotificationAsRead(id), {
        loading: "Marking as read…",
        success: "Notification marked as read",
        error: "Failed to mark as read",
      });
    } catch (e) {
      setNotifications(prev); // revert
      console.error(e);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <section
      className={`flex flex-col ${className}`}
      /* Responsive container:
         - clamp width for popover usage on desktop
         - allow full width inside parent on mobile
      */
      style={{
        width: "100%",
        maxWidth, // e.g. 360
        minWidth: 260,
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-3 py-3">
          <h3 className="text-base font-semibold">Notifications</h3>
          <div className="flex items-center gap-3">
            <button
              className="text-green-600 text-sm hover:underline"
              onClick={fetchNotifications}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Scroll area — responsive max height */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-3"
        style={{
          maxHeight, // e.g. 420px in popovers; grow if you pass larger
        }}
      >
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center text-gray-400 text-center px-4 py-10">
            No new notifications.
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li
                key={n._id}
                className="relative group flex gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg p-3 border border-gray-200"
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
                  className={`hidden sm:flex group-hover:flex absolute top-2 right-2 items-center justify-center
                    rounded bg-green-100 hover:bg-green-200 p-1 transition
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {markingId === n._id ? (
                    <span className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MdCheck className="h-4 w-4 text-green-600" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
